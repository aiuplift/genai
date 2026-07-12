/**
 * ChatService — Client-side service for AI chat.
 * 
 * All requests are routed directly to the Gemini API from the browser,
 * regardless of which model is selected in the dropdown.
 * 
 * Requirements: 20.3, 24.3
 */

import { DEMO_MODELS } from './ai-model-registry.js';

// --- Gemini Direct API Configuration ---
// Set your API key via: window.GEMINI_API_KEY = 'your-key-here' in the browser console
// Or create a config.js file that sets it before this module loads
const GEMINI_API_KEY = (typeof window !== 'undefined' && window.GEMINI_API_KEY) || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const RATE_LIMIT_COOLDOWN_MS = 2000;

// Demo mode response message (shown when API key is not configured)
const DEMO_MODE_RESPONSE = `🤖 **AI Chat — API Key Required**

To enable live AI responses, replace the placeholder API key in \`chat-service.js\`:

\`\`\`
const GEMINI_API_KEY = 'YOUR_ACTUAL_KEY_HERE';
\`\`\`

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

In the meantime, you can still write your questions here for discussion with your group. Try formulating clear, specific prompts — that's great practice for working with AI tools!`;

// List of demo model IDs for quick checking
const DEMO_MODEL_IDS = ['chatgpt', 'claude', 'gemini'];

// Error code to user-friendly message mapping
const ERROR_MESSAGES = {
  RATE_LIMITED: 'Please wait a moment before sending another message.',
  TOKEN_BUDGET_EXCEEDED: 'The token budget for this session has been reached. No more prompts can be sent.',
  MODEL_UNAVAILABLE: 'The selected model is currently unavailable. Please try a different model.',
  PROVIDER_ERROR: 'The AI provider encountered an error. Please try again.',
  INVALID_REQUEST: 'Invalid request. Please check your input and try again.',
  NETWORK_ERROR: 'Unable to reach the Gemini API. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Track the last request timestamp for client-side rate limiting
let lastRequestTimestamp = 0;

/**
 * Check if a new prompt can be sent (client-side rate limit: 2s cooldown).
 * @returns {boolean} true if at least 2 seconds have elapsed since the last request
 */
export function canSendPrompt() {
  const now = Date.now();
  return (now - lastRequestTimestamp) >= RATE_LIMIT_COOLDOWN_MS;
}

/**
 * Get a user-friendly error message for a given error code.
 * @param {string} code - The error code from the server response
 * @returns {string} A human-readable error message
 */
export function getErrorMessage(code) {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Call the Gemini API directly from the browser.
 * @param {string} prompt - The user's message text
 * @returns {Promise<{content: string, tokens: {input: number, output: number}}>}
 * @throws {Error} On network failure or API error
 * @private
 */
async function _callGeminiDirect(prompt) {
  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      { parts: [{ text: prompt }] }
    ]
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(ERROR_MESSAGES.PROVIDER_ERROR);
    }
    const message = errorData?.error?.message || ERROR_MESSAGES.PROVIDER_ERROR;
    throw new Error(`Gemini API error: ${message}`);
  }

  const data = await response.json();

  // Extract response text
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

  // Extract token usage
  const usage = data?.usageMetadata || {};
  const tokens = {
    input: usage.promptTokenCount || 0,
    output: usage.candidatesTokenCount || 0
  };

  return { content, tokens };
}

/**
 * Check if the API key is configured (not the placeholder).
 * @returns {boolean} True if the API key is a real key
 * @private
 */
function _isApiKeyConfigured() {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
}

/**
 * Send a prompt to the AI (always routed to Gemini regardless of selected model).
 * 
 * @param {Object} params
 * @param {string} params.prompt - The user's message text
 * @param {string} params.model - The model identifier (displayed only, all go to Gemini)
 * @param {string|null} params.context - Extracted context document text, or null
 * @param {string} params.participantId - The participant's unique identifier
 * @param {string} params.passcode - The session passcode
 * @returns {Promise<{content: string, tokens: {input: number, output: number}, model: string}>}
 * @throws {Error} With a user-friendly message on failure
 */
export async function sendPrompt({ prompt, model, context, participantId, passcode }) {
  // If API key is not configured, return demo response
  if (!_isApiKeyConfigured()) {
    return _getDemoResponse(model);
  }

  if (!canSendPrompt()) {
    throw new Error(ERROR_MESSAGES.RATE_LIMITED);
  }

  lastRequestTimestamp = Date.now();

  // Build full prompt with context if provided
  let fullPrompt = prompt;
  if (context) {
    fullPrompt = `--- CONTEXT ---\n${context}\n--- END CONTEXT ---\n\n${prompt}`;
  }

  // Call Gemini directly regardless of selected model
  const { content, tokens } = await _callGeminiDirect(fullPrompt);

  return {
    content,
    tokens,
    model: model
  };
}

/**
 * Send a prompt to two AI models for comparison.
 * Both calls go to Gemini (responses may differ slightly due to temperature).
 * 
 * @param {Object} params
 * @param {string} params.prompt - The user's message text
 * @param {[string, string]} params.models - Two model identifiers to compare
 * @param {string|null} params.context - Extracted context document text, or null
 * @param {string} params.participantId - The participant's unique identifier
 * @param {string} params.passcode - The session passcode
 * @returns {Promise<{responses: Array}>} Array of two response objects
 * @throws {Error} With a user-friendly message on failure
 */
export async function sendComparisonPrompt({ prompt, models, context, participantId, passcode }) {
  // If API key is not configured, return demo responses
  if (!_isApiKeyConfigured()) {
    return {
      responses: [
        _getDemoResponse(models[0]),
        _getDemoResponse(models[1])
      ]
    };
  }

  if (!canSendPrompt()) {
    throw new Error(ERROR_MESSAGES.RATE_LIMITED);
  }

  lastRequestTimestamp = Date.now();

  // Build full prompt with context if provided
  let fullPrompt = prompt;
  if (context) {
    fullPrompt = `--- CONTEXT ---\n${context}\n--- END CONTEXT ---\n\n${prompt}`;
  }

  // Call Gemini twice (responses may vary slightly)
  const [result1, result2] = await Promise.all([
    _callGeminiDirect(fullPrompt),
    _callGeminiDirect(fullPrompt)
  ]);

  return {
    responses: [
      { content: result1.content, tokens: result1.tokens, model: models[0] },
      { content: result2.content, tokens: result2.tokens, model: models[1] }
    ]
  };
}

/**
 * Generate a demo response for unconfigured API key.
 * @param {string} model - The model ID
 * @returns {{content: string, tokens: {input: number, output: number}, model: string}}
 * @private
 */
function _getDemoResponse(model) {
  return {
    content: DEMO_MODE_RESPONSE,
    tokens: { input: 0, output: 0 },
    model: model
  };
}

/**
 * Reset the rate limit timestamp (useful for testing).
 * @internal
 */
export function _resetRateLimit() {
  lastRequestTimestamp = 0;
}

/**
 * Get the current rate limit timestamp (useful for testing).
 * @internal
 * @returns {number}
 */
export function _getLastRequestTimestamp() {
  return lastRequestTimestamp;
}
