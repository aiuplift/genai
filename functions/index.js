const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

// Initialise Firebase Admin SDK
admin.initializeApp();

// CORS middleware — allow all origins for development; restrict in production
const corsHandler = cors({ origin: true });

// In-memory rate limit map: participantId → last request timestamp
const rateLimitMap = new Map();

// Rate limit window in milliseconds (1 request per 2 seconds)
const RATE_LIMIT_MS = 2000;

/**
 * AI Chat Proxy endpoint.
 * Accepts POST requests, routes prompts to OpenAI, Anthropic, or Google APIs,
 * and stores responses + token usage in Firebase RTDB.
 *
 * Request body:
 * {
 *   prompt: string,
 *   model: string,
 *   context: string | null,
 *   participantId: string,
 *   passcode: string,
 *   isComparison: boolean,
 *   comparisonModel: string | null
 * }
 */
exports.chat = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Only allow POST
    if (req.method !== "POST") {
      res.status(405).json({
        error: "INVALID_REQUEST",
        message: "Only POST requests are accepted.",
      });
      return;
    }

    const { prompt, model, context, participantId, passcode, isComparison, comparisonModel } =
      req.body;

    // --- 1. Validate required fields ---
    if (!prompt || !model || !participantId || !passcode) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Missing required fields: prompt, model, participantId, passcode.",
      });
      return;
    }

    // --- 2. Rate limit check ---
    const now = Date.now();
    const lastRequest = rateLimitMap.get(participantId);
    if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
      res.status(429).json({
        error: "RATE_LIMITED",
        message: "Please wait 2 seconds between requests.",
      });
      return;
    }
    rateLimitMap.set(participantId, now);

    try {
      const db = admin.database();

      // --- 3. Read session config ---
      const configSnapshot = await db
        .ref(`/sessions/${passcode}/chat/config`)
        .once("value");
      const config = configSnapshot.val();

      if (!config) {
        res.status(404).json({
          error: "INVALID_REQUEST",
          message: "Session configuration not found.",
        });
        return;
      }

      // Check model is enabled
      const enabledModels = config.enabledModels || [];
      const disabledModels = config.disabledModels || [];
      if (!enabledModels.includes(model) || disabledModels.includes(model)) {
        res.status(400).json({
          error: "MODEL_UNAVAILABLE",
          message: `Model "${model}" is not available for this session.`,
        });
        return;
      }

      // --- 4. Token budget check ---
      const tokenBudget = config.tokenBudget || null;
      if (tokenBudget) {
        const usageSnapshot = await db
          .ref(`/sessions/${passcode}/chat/tokenUsage`)
          .once("value");
        const usageData = usageSnapshot.val() || {};
        const totalUsage = Object.values(usageData).reduce(
          (sum, val) => sum + (typeof val === "number" ? val : 0),
          0
        );
        if (totalUsage >= tokenBudget) {
          res.status(403).json({
            error: "TOKEN_BUDGET_EXCEEDED",
            message: "Session token budget has been reached. No further requests allowed.",
          });
          return;
        }
      }

      // --- 5. Assemble prompt with context ---
      let fullPrompt = prompt;
      if (context) {
        fullPrompt =
          `--- PERSONAL CONTEXT ---\n${context}\n--- END CONTEXT ---\n\n${prompt}`;
      }

      // --- 6. Get API key for provider ---
      const provider = getProviderForModel(model);
      const apiKey = config.apiKeys ? config.apiKeys[provider] : null;
      if (!apiKey) {
        res.status(500).json({
          error: "PROVIDER_ERROR",
          message: `API key not configured for provider: ${provider}.`,
        });
        return;
      }

      // --- 7. Route to provider ---
      let primaryResponse;
      try {
        primaryResponse = await callProvider(provider, model, fullPrompt, apiKey);
      } catch (providerError) {
        console.error("Provider error:", providerError.message);
        res.status(502).json({
          error: "PROVIDER_ERROR",
          message: `Error from ${provider}: ${providerError.message}`,
        });
        return;
      }

      // --- 8. Handle comparison mode ---
      let comparisonResponse = null;
      if (isComparison && comparisonModel) {
        // Validate comparison model
        if (
          !enabledModels.includes(comparisonModel) ||
          disabledModels.includes(comparisonModel)
        ) {
          comparisonResponse = {
            content: null,
            tokens: { input: 0, output: 0 },
            model: comparisonModel,
            error: `Model "${comparisonModel}" is not available.`,
          };
        } else {
          const compProvider = getProviderForModel(comparisonModel);
          const compApiKey = config.apiKeys ? config.apiKeys[compProvider] : null;
          if (!compApiKey) {
            comparisonResponse = {
              content: null,
              tokens: { input: 0, output: 0 },
              model: comparisonModel,
              error: `API key not configured for ${compProvider}.`,
            };
          } else {
            try {
              comparisonResponse = await callProvider(
                compProvider,
                comparisonModel,
                fullPrompt,
                compApiKey
              );
            } catch (compError) {
              comparisonResponse = {
                content: null,
                tokens: { input: 0, output: 0 },
                model: comparisonModel,
                error: compError.message,
              };
            }
          }
        }
      }

      // --- 9. Store message in RTDB ---
      const messageRef = db
        .ref(`/sessions/${passcode}/chat/${participantId}/messages`)
        .push();
      const messageData = {
        role: "user",
        content: prompt,
        model: model,
        tokens: primaryResponse.tokens,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        isComparison: !!isComparison,
        comparisonModel: comparisonModel || null,
        comparisonContent: comparisonResponse ? comparisonResponse.content : null,
        comparisonTokens: comparisonResponse ? comparisonResponse.tokens : null,
      };
      await messageRef.set(messageData);

      // Store assistant response as separate entry
      const assistantRef = db
        .ref(`/sessions/${passcode}/chat/${participantId}/messages`)
        .push();
      await assistantRef.set({
        role: "assistant",
        content: primaryResponse.content,
        model: model,
        tokens: primaryResponse.tokens,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        isComparison: !!isComparison,
        comparisonModel: comparisonModel || null,
        comparisonContent: comparisonResponse ? comparisonResponse.content : null,
        comparisonTokens: comparisonResponse ? comparisonResponse.tokens : null,
      });

      // --- 10. Update token usage ---
      const totalTokens =
        primaryResponse.tokens.input +
        primaryResponse.tokens.output +
        (comparisonResponse
          ? comparisonResponse.tokens.input + comparisonResponse.tokens.output
          : 0);

      await db
        .ref(`/sessions/${passcode}/chat/tokenUsage/${participantId}`)
        .transaction((current) => (current || 0) + totalTokens);

      // --- 11. Return response ---
      const responseBody = {
        content: primaryResponse.content,
        tokens: primaryResponse.tokens,
        model: model,
      };

      if (comparisonResponse) {
        responseBody.comparison = {
          content: comparisonResponse.content,
          tokens: comparisonResponse.tokens,
          model: comparisonModel,
          error: comparisonResponse.error || null,
        };
      }

      res.status(200).json(responseBody);
    } catch (error) {
      console.error("Unexpected error in chat function:", error);
      res.status(500).json({
        error: "PROVIDER_ERROR",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  });
});

/**
 * Determine the provider name for a given model ID.
 */
function getProviderForModel(model) {
  const providerMap = {
    "gpt-4o": "openai",
    "gpt-4o-mini": "openai",
    "claude-sonnet": "anthropic",
    "claude-haiku": "anthropic",
    "gemini-pro": "google",
    "gemini-flash": "google",
  };
  return providerMap[model] || null;
}

/**
 * Call the appropriate AI provider API.
 * Returns { content: string, tokens: { input: number, output: number }, model: string }
 */
async function callProvider(provider, model, prompt, apiKey) {
  switch (provider) {
    case "openai":
      return await callOpenAI(model, prompt, apiKey);
    case "anthropic":
      return await callAnthropic(model, prompt, apiKey);
    case "google":
      return await callGoogle(model, prompt, apiKey);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Call OpenAI API (GPT-4o, GPT-4o-mini)
 */
async function callOpenAI(model, prompt, apiKey) {
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
  });

  const choice = response.choices[0];
  return {
    content: choice.message.content,
    tokens: {
      input: response.usage.prompt_tokens,
      output: response.usage.completion_tokens,
    },
    model: model,
  };
}

/**
 * Call Anthropic API (Claude Sonnet, Claude Haiku)
 */
async function callAnthropic(model, prompt, apiKey) {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  // Map internal model names to Anthropic model IDs
  const modelMap = {
    "claude-sonnet": "claude-sonnet-4-20250514",
    "claude-haiku": "claude-haiku-4-20250514",
  };

  const response = await client.messages.create({
    model: modelMap[model] || model,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  return {
    content: response.content[0].text,
    tokens: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
    model: model,
  };
}

/**
 * Call Google Generative AI API (Gemini Pro, Gemini Flash)
 */
async function callGoogle(model, prompt, apiKey) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  // Map internal model names to Google model IDs
  const modelMap = {
    "gemini-pro": "gemini-pro",
    "gemini-flash": "gemini-1.5-flash",
  };

  const genModel = genAI.getGenerativeModel({ model: modelMap[model] || model });
  const result = await genModel.generateContent(prompt);
  const response = result.response;

  // Google AI SDK provides usage metadata
  const usageMetadata = response.usageMetadata || {};

  return {
    content: response.text(),
    tokens: {
      input: usageMetadata.promptTokenCount || 0,
      output: usageMetadata.candidatesTokenCount || 0,
    },
    model: model,
  };
}
