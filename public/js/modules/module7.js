/**
 * Module 7: Research and Grounded Answers
 *
 * Activities:
 *   1. Manager-Ready Brief — research question, sources, recommendation, unknowns
 *   2. Side-by-Side Comparison — grounded output vs chat output with documented differences
 *   3. Module Quiz — 5-question knowledge check
 *   4. Reflection & Feedback — structured reflection entries
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { registerModule } from '../core/module-registry.js';

const module7 = {
  id: 'module7',
  title: 'Research and Grounded Answers',
  description: 'Learn to distinguish AI confidence from AI accuracy — build research workflows that produce grounded, sourced, defensible answers.',
  sections: [
    // ── 1. Welcome + Learning Objectives ────────────────────────────────────
    {
      type: 'content',
      title: 'Welcome to Module 7',
      content: `Welcome to Module 7 — where you'll learn the critical difference between AI that retrieves verified information and AI that generates plausible-sounding text from patterns. This distinction is the foundation of trustworthy AI-assisted research.

<strong>What you'll walk away with:</strong>

• The ability to distinguish grounded AI tools (that search real sources and cite them) from ungrounded tools (that generate from training patterns) — and know when each is appropriate
• A reliable workflow for producing research with proper citations that your manager or stakeholders can trust
• The skills to build manager-ready research briefs with clear questions, sourced findings, actionable recommendations, and honestly stated unknowns
• A verification instinct that automatically triggers whenever AI presents factual claims

Not all AI tools are created equal when it comes to research. Some search the live web, retrieve actual documents, and cite specific sources you can verify. Others generate fluent, confident text from training patterns — text that sounds authoritative about sources that may not exist. Knowing which you're using, and verifying either way, is the difference between research and fiction that reads like research.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'How This Module Works',
      content: `Use the AI Chat (💬 button) to experiment with research prompts throughout this module. Try asking for citations, test verification workflows, and compare outputs. Your work saves automatically.`
    },

    // ── 2. The Research Credibility Problem ─────────────────────────────────
    {
      type: 'content',
      title: 'The Research Credibility Problem',
      content: `Here's the uncomfortable truth about AI and factual knowledge: standard chat AI doesn't know things — it predicts what things <em>sound like</em> they should be. And that prediction engine is dangerously good at producing text that looks like research but isn't.

<strong>Why standard AI chat is dangerous for research:</strong>

<strong>1. Hallucinated sources</strong>
Ask ChatGPT (without browsing) for "recent studies on remote work productivity" and it will confidently cite papers that don't exist. It generates plausible-sounding author names, journal titles, publication years, and DOIs — complete fabrications that look indistinguishable from real citations until you try to find them.

<strong>2. Outdated information</strong>
Chat AI's knowledge has a training cutoff date. Ask about market sizes, adoption rates, or recent regulations and you'll get answers based on data that may be months or years old — presented with the same confidence as if it were current. Worse, AI won't tell you its information is outdated unless you specifically ask.

<strong>3. No citation trail</strong>
When a human researcher writes "According to McKinsey (2024)...", they've read that McKinsey report. When chat AI writes the same phrase, it has generated a plausible attribution pattern. There's no citation trail because there was never any research — only pattern completion.

<strong>Real examples of AI inventing sources:</strong>

• <strong>The lawyer who cited fake cases:</strong> In 2023, a New York lawyer used ChatGPT to prepare a court filing. The AI generated six case citations — complete with docket numbers and judicial quotes — that were entirely fabricated. None of the cases existed. The lawyer faced sanctions.

• <strong>Invented academic papers:</strong> Researchers have documented AI generating citations to papers with real-sounding titles, plausible author names from actual academics, and specific journal volumes — papers that have never been published and don't exist in any database.

• <strong>Fabricated statistics with real company names:</strong> AI routinely generates claims like "According to Gartner's 2024 report, 78% of enterprises..." using real analyst firm names paired with invented numbers from reports that may not exist in the form described.

<strong>The core problem:</strong> AI-generated text about research is optimised for <em>plausibility</em>, not <em>accuracy</em>. The more confident and specific a claim sounds, the more likely a reader is to trust it — regardless of whether it's true. This makes unverified AI output uniquely dangerous in professional research contexts.`
    },

    // ── 3. Grounded AI vs Chat AI ───────────────────────────────────────────
    {
      type: 'content',
      title: 'Grounded AI vs Chat AI',
      content: `The most important distinction in AI research tools is whether they're <em>grounded</em> — connected to real, current information sources — or <em>ungrounded</em> — generating from internal training patterns only.

<strong>Grounded AI Tools (search + synthesise, cite sources):</strong>

• <strong>Perplexity AI</strong> — Searches the live web, retrieves documents, and provides inline citations with numbered references linking to original sources. You can click through and verify every claim.
• <strong>Google AI Overview / Gemini with search</strong> — Draws from Google's search index, cites specific web pages, shows you where information came from.
• <strong>Microsoft Copilot (with web access)</strong> — Connects to Bing search, retrieves current information, provides source links alongside answers.
• <strong>ChatGPT with browsing enabled</strong> — When the browsing feature is active, searches the web and cites sources. But verify it's actually using browse mode — if you see no source links, it's generating from training data.

<strong>How grounded tools work:</strong>
They receive your question → formulate search queries → retrieve actual documents from the web → extract relevant information → synthesise an answer with citations pointing back to sources. The critical architecture: they search <em>before</em> answering.

<strong>Ungrounded Chat AI Tools (generate from training patterns):</strong>

• <strong>ChatGPT (without browsing)</strong> — Generates responses from training data patterns. Will confidently cite papers that don't exist.
• <strong>Claude</strong> — Generates from training data. Often acknowledges uncertainty more explicitly, but cannot provide verifiable live citations.
• <strong>Local/offline AI models (Llama, Mistral)</strong> — No internet access at all. Everything generated is from frozen training patterns.

<strong>How ungrounded tools work:</strong>
They receive your question → predict what a good answer would look like based on training data patterns → generate text token by token. They don't retrieve information — they generate it. A "citation" is just the model predicting what a citation would look like in that context.

<strong>Limitations of grounded tools (they're not perfect):</strong>

• They can still misinterpret sources — retrieving a document doesn't guarantee correct interpretation
• Search results may be biased toward popular or recent content, missing authoritative older sources
• They may cite a source for a claim the source doesn't actually support
• They can still hallucinate when synthesising across multiple sources
• The quality depends on what's available online — paywalled or offline-only research won't appear

<strong>When to use each:</strong>

Use <em>grounded tools</em> for:
• Factual research requiring verifiable claims
• Current information (prices, dates, recent events, regulations)
• Building evidence-based arguments for stakeholders
• Any work that will be shared externally or used for decisions

Use <em>ungrounded tools</em> for:
• Brainstorming and idea generation (where accuracy isn't primary)
• Drafting text where facts will be independently verified
• Explaining concepts at a general level
• Restructuring or reformatting your own verified content
• Creative tasks where accuracy isn't the primary concern

<strong>The critical insight:</strong> Many professionals use ungrounded tools for research without realising it. They ask ChatGPT for market data, get a confident answer with what looks like a citation, and include it in a report — never checking whether the source exists. This is how hallucinated facts enter professional documents and eventually reach decision-makers.`
    },

    // ── 4. Building a Manager-Ready Research Brief ──────────────────────────
    {
      type: 'content',
      title: 'Building a Manager-Ready Research Brief',
      content: `A manager-ready research brief is a document your manager can hand to <em>their</em> stakeholders with confidence — knowing every claim is sourced, every recommendation is grounded in evidence, and every uncertainty is honestly stated.

<strong>The structure that works:</strong>

<strong>1. Clear Question</strong>
Start with the exact question you're answering. Not vague ("research AI trends") but specific ("What is the current enterprise adoption rate of generative AI in financial services, and what are the primary barriers to further adoption?"). The question defines the scope and makes it clear what the brief does and doesn't cover.

<strong>2. Methodology Note</strong>
Briefly state how you researched this: which tools you used, what sources you consulted, what date range you covered. "Research conducted using Perplexity AI and direct source verification, covering publications from January 2024 to present." This sets expectations and builds credibility.

<strong>3. Key Findings with Sources</strong>
Present your findings with inline citations. Every factual claim links to a specific, verifiable source. Structure this around themes or sub-questions, not around individual sources. You're synthesising, not listing.

<strong>4. Recommendation</strong>
Based on the evidence, what should we do? This is where you add professional judgment on top of research. A recommendation without evidence is a guess. Evidence without a recommendation is a data dump. You need both.

<strong>5. Acknowledged Unknowns</strong>
What couldn't you find? What questions remain unanswered? What would change your recommendation if new data emerged?

<strong>Why the "Unknowns" section builds trust rather than undermining it:</strong>

Many professionals worry that admitting gaps makes them look incompetent. The opposite is true. Including a "What We Don't Know" section signals:
• <em>Intellectual honesty</em> — you've thought critically about the limits of your research
• <em>Risk awareness</em> — decision-makers can weigh confidence levels appropriately
• <em>Professional maturity</em> — you understand that partial knowledge is the norm, not the exception
• <em>Actionable next steps</em> — unknowns become a roadmap for further investigation

A brief that claims total certainty is either covering a trivially simple topic or hiding its limitations. Decision-makers know this intuitively, and they trust researchers who surface gaps over those who pretend they don't exist.

<strong>Using AI at each step while maintaining standards:</strong>

• <strong>Question:</strong> Use AI to refine your research question — "Help me formulate a specific, answerable research question about X for a senior leadership audience"
• <strong>Methodology:</strong> Document your actual process (which tools, which searches, what date range)
• <strong>Findings:</strong> Use grounded AI to find sources, then verify each one exists and says what AI claims
• <strong>Recommendation:</strong> Draft with AI assistance but ensure logic flows from your verified evidence
• <strong>Unknowns:</strong> Ask AI "What limitations should I acknowledge about this research?" — it's surprisingly good at identifying methodological gaps`
    },

    // ── 5. Activity: Manager-Ready Brief ────────────────────────────────────
    {
      type: 'activity',
      activityId: 'manager-ready-brief'
    },

    // ── 6. The Source Verification Workflow ──────────────────────────────────
    {
      type: 'content',
      title: 'The Source Verification Workflow',
      content: `Every AI-cited source needs to pass through a verification workflow before you include it in professional work. This isn't about distrust — it's about due diligence that protects your credibility and your organisation's decisions.

<strong>The four-question verification framework:</strong>

<strong>1. Does it exist?</strong>
Search for the exact source. Can you find the paper, report, article, or study that AI cited? Use the title, author, and publication date to search. If you can't find it within 2-3 minutes of searching, it likely doesn't exist in the form AI described.

Practical steps:
• Search the publication's website directly (e.g., mckinsey.com, hbr.org)
• Use Google Scholar for academic papers
• Check the DOI if provided (doi.org/[number])
• Search the author's publication list
• If none of these work, the source is probably hallucinated

<strong>2. Does it say what the AI claims?</strong>
Finding the source isn't enough. AI frequently retrieves real sources but misrepresents what they say — quoting out of context, conflating findings from different sections, or presenting conclusions the authors explicitly didn't draw.

Practical steps:
• Read at least the abstract, executive summary, or relevant section
• Check if the specific statistic or claim appears in the document
• Verify that the context matches — a 67% figure in a different context is a different finding
• Check if the source contradicts what AI claimed in other sections

<strong>3. Is it current?</strong>
A perfectly real source from 2019 may be dangerously outdated for 2024 decisions. AI often cites older data without flagging that newer research may have superseded it.

Practical steps:
• Check the publication date against the decision timeline
• Look for "updated" or "revised" versions
• Search for more recent publications on the same topic
• Consider whether the field moves fast enough that old data is unreliable

<strong>4. Is it authoritative?</strong>
Not all sources carry equal weight. A blog post from an unknown author doesn't support a claim the same way a peer-reviewed study or official industry report does.

Practical steps:
• Consider the publication's reputation and editorial standards
• Check the author's credentials and expertise
• Look at sample sizes for surveys and studies
• Distinguish between primary research, secondary analysis, and opinion
• Consider potential conflicts of interest (vendor research about their own market)

<strong>The verification decision matrix:</strong>

• Source exists + says what AI claims + current + authoritative → <strong>Include with confidence</strong>
• Source exists + says what AI claims + outdated → <strong>Include with date caveat, look for newer data</strong>
• Source exists + AI misrepresented it → <strong>Correct the representation or drop the claim</strong>
• Source doesn't exist → <strong>Drop entirely, find alternative evidence or state the gap</strong>`
    },

    // ── 7. Callout (tip) — The "Where Did You Get This?" Test ────────────────
    {
      type: 'callout',
      variant: 'tip',
      title: 'The "Where Did You Get This?" Test',
      content: `When your manager asks "where did you get this?", you need a real answer — not "the AI told me." Every claim in professional work needs a traceable source: a specific report, a named study, a verifiable data point. If the best answer you can give is "ChatGPT said so," that claim doesn't belong in your work yet. Use grounded tools, verify sources, and build the citation trail before the question is asked — because it will be.`
    },

    // ── 8. Activity: Side-by-Side Comparison ────────────────────────────────
    {
      type: 'activity',
      activityId: 'side-by-side-comparison'
    },

    // ── 9. When AI Research Goes Wrong — Case Studies ────────────────────────
    {
      type: 'content',
      title: 'When AI Research Goes Wrong — Case Studies',
      content: `These aren't hypothetical risks. AI-generated research has already caused real professional damage when verification steps were skipped.

<strong>Case 1: Lawyers Citing Fake Cases</strong>

In Mata v. Avianca (2023), attorney Steven Schwartz used ChatGPT to research case law for a personal injury lawsuit. The AI generated six judicial opinions as precedent — complete with case names, docket numbers, and quoted judicial reasoning. None existed. The opposing counsel couldn't find them, the judge couldn't find them, and when pressed, Schwartz admitted he'd used ChatGPT and "did not believe the content could be fabricated." He and his colleague were sanctioned and fined. The court described the filings as containing "bogus judicial decisions with bogus quotes and bogus internal citations."

<strong>Lesson:</strong> AI generates what citations <em>look like</em>, not what citations <em>are</em>. The format was perfect — the substance was entirely invented.

<strong>Case 2: Journalists Publishing AI-Hallucinated Content</strong>

Multiple news outlets have published articles containing AI-generated quotes attributed to real people who never said them, statistics from reports that don't exist, and historical claims that never happened. In one documented case, an AI-generated news article attributed a specific quote to a named academic — the academic confirmed they'd never said it and had never been contacted. The article was published and shared thousands of times before correction.

<strong>Lesson:</strong> AI-generated text passes the "sounds right" test easily. Without verification, hallucinated content enters the information ecosystem and gets cited by others, compounding the problem.

<strong>Case 3: Business Decisions Based on AI-Invented Statistics</strong>

A consulting team used AI to compile market research for a strategic recommendation. The AI provided specific market size figures, growth rates, and competitive intelligence — all presented with source attributions. The recommendation proceeded to the board level before an analyst attempted to verify one figure and discovered the cited report didn't exist. Subsequent review revealed that approximately 40% of the "sourced" statistics in the deck couldn't be verified. The project timeline was set back by weeks as the team rebuilt the research from scratch.

<strong>Lesson:</strong> The higher the stakes of the decision, the more dangerous unverified AI research becomes. Verification at the research stage takes hours; correction after a board presentation takes weeks plus reputational damage.

<strong>The common thread:</strong> In every case, the failure wasn't that AI was used — it's that AI output was treated as research without passing through a verification workflow. The tool isn't the problem. The missing process is.`
    },

    // ── 10. Activity: Module Quiz ───────────────────────────────────────────
    {
      type: 'activity',
      activityId: 'module7-quiz'
    },

    // ── 11. Activity: Reflection & Feedback ─────────────────────────────────
    {
      type: 'activity',
      activityId: 'module7-feedback'
    }
  ],

  activities: [
    // ─── Activity 1: Manager-Ready Brief ────────────────────────────────────
    {
      id: 'manager-ready-brief',
      title: 'Manager-Ready Research Brief',
      type: 'form',
      description: 'Produce a manager-ready research brief with a clear question, cited sources, a recommendation, and an honest acknowledgement of what remains unknown. Use grounded AI tools to find sources, then verify each one.',
      fields: [
        {
          id: 'research-question',
          label: 'Research Question',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'State the specific, answerable research question you are investigating...'
        },
        {
          id: 'sources',
          label: 'Sources Cited',
          type: 'structured_table',
          required: true,
          minRows: 1,
          maxRows: 20,
          columns: [
            { id: 'source-title', label: 'Source Title', type: 'text', maxLength: 200, minLength: 1 },
            { id: 'source-url', label: 'URL / Reference', type: 'text', maxLength: 500, minLength: 0 },
            { id: 'source-summary', label: 'Key Finding', type: 'textarea', maxLength: 500, minLength: 1 }
          ],
          placeholder: 'Add at least 1 verified source (up to 20)...'
        },
        {
          id: 'recommendation',
          label: 'Recommendation',
          type: 'textarea',
          maxLength: 2000,
          minLength: 1,
          required: true,
          placeholder: 'Write your recommendation based on the evidence. Ensure it follows logically from your cited sources...'
        },
        {
          id: 'unknowns',
          label: 'What We Don\'t Know',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          required: true,
          placeholder: 'Document what remains unknown, uncertain, or requiring further investigation...'
        }
      ],
      completionRule: 'all_required_fields_filled'
    },

    // ─── Activity 2: Side-by-Side Comparison ────────────────────────────────
    {
      id: 'side-by-side-comparison',
      title: 'Side-by-Side Comparison',
      type: 'form',
      description: 'Ask the same research question to a grounded AI tool and an ungrounded chat tool. Document what each produces and analyse the differences — especially where they disagree on facts or sources.',
      layout: 'grid-two-col',
      fields: [
        {
          id: 'grounded-output',
          label: 'Grounded Tool Output (e.g. Perplexity, Google AI)',
          type: 'textarea',
          maxLength: 3000,
          minLength: 1,
          required: true,
          placeholder: 'Paste or type the output from the grounded AI tool, including any citations provided...'
        },
        {
          id: 'chat-output',
          label: 'Chat Tool Output (e.g. ChatGPT, Claude)',
          type: 'textarea',
          maxLength: 3000,
          minLength: 1,
          required: true,
          placeholder: 'Paste or type the output from the ungrounded chat AI tool...'
        },
        {
          id: 'documented-differences',
          label: 'Documented Differences',
          type: 'structured_table',
          required: true,
          minRows: 1,
          maxRows: 10,
          columns: [
            { id: 'difference-description', label: 'Difference', type: 'textarea', maxLength: 500, minLength: 1 },
            { id: 'significance', label: 'Significance', type: 'textarea', maxLength: 300, minLength: 1 }
          ],
          placeholder: 'Record at least 1 difference between the two outputs (up to 10). Note which differences matter for decision-making...'
        }
      ],
      completionRule: 'all_required_fields_filled'
    },

    // ─── Activity 3: Module Quiz ────────────────────────────────────────────
    {
      id: 'module7-quiz',
      title: 'Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of grounded vs ungrounded AI tools, research verification, and building trustworthy research briefs.',
      questions: [
        {
          id: 'q1',
          text: 'What\'s the key difference between "grounded" AI tools (like Perplexity) and standard chat AI (like ChatGPT without browsing)?',
          options: [
            { id: 'a', text: 'Grounded tools are more expensive and require a subscription' },
            { id: 'b', text: 'Grounded tools search real sources and cite them; chat AI generates from training data without real-time search' },
            { id: 'c', text: 'Grounded tools only work for academic research; chat AI is for business use' },
            { id: 'd', text: 'There is no meaningful difference — both access the same information' }
          ],
          correctAnswer: 'b',
          explanation: 'Grounded AI tools (like Perplexity) search the live web, retrieve actual documents, and cite specific sources you can click and verify. Standard chat AI (like ChatGPT without browsing) generates responses by predicting probable text patterns from training data — it doesn\'t search for or retrieve any external information. This architectural difference determines whether a "citation" points to a real source or is a hallucinated pattern.'
        },
        {
          id: 'q2',
          text: 'You find a source cited by AI in your research. What\'s your first verification step?',
          options: [
            { id: 'a', text: 'Ask a different AI tool if the source is real' },
            { id: 'b', text: 'Check that the source actually exists and says what the AI claims it says' },
            { id: 'c', text: 'Assume it\'s correct if the AI tool is a reputable brand' },
            { id: 'd', text: 'Check if the formatting of the citation looks professional' }
          ],
          correctAnswer: 'b',
          explanation: 'The first and most critical verification step is confirming the source actually exists (can you find it?) and that it says what AI claims (does the specific statistic, quote, or finding actually appear in the document?). AI frequently invents plausible-sounding sources or misrepresents what real sources say. No amount of AI cross-checking replaces actually looking at the original source yourself.'
        },
        {
          id: 'q3',
          text: 'Why should research briefs include a "What We Don\'t Know" section?',
          options: [
            { id: 'a', text: 'It makes the brief longer and more impressive' },
            { id: 'b', text: 'It\'s a legal requirement for all research documents' },
            { id: 'c', text: 'It builds trust by showing intellectual honesty and helps decision-makers understand the confidence level' },
            { id: 'd', text: 'It gives you an excuse if your recommendation turns out wrong' }
          ],
          correctAnswer: 'c',
          explanation: 'Acknowledging unknowns signals intellectual honesty, professional maturity, and risk awareness. Decision-makers can weigh their confidence appropriately when they understand what gaps exist. A brief that claims total certainty either covers a trivially simple topic or is hiding its limitations — experienced stakeholders know this and trust researchers who surface gaps over those who pretend they don\'t exist.'
        },
        {
          id: 'q4',
          text: 'AI cites "a 2024 McKinsey study on generative AI adoption" in its research output. What should you do?',
          options: [
            { id: 'a', text: 'Include it in your brief — McKinsey is a reputable source' },
            { id: 'b', text: 'Search for the specific study to verify it exists and check whether the AI\'s interpretation matches the actual findings' },
            { id: 'c', text: 'Replace "McKinsey" with "industry research" to be safer' },
            { id: 'd', text: 'Ask the AI to provide the URL and assume it\'s correct if one is given' }
          ],
          correctAnswer: 'b',
          explanation: 'Even when AI names a real organisation, it may be citing a specific study that doesn\'t exist, conflating multiple studies, or misrepresenting findings. The verification step is to search McKinsey\'s actual publications, find the specific study referenced, and confirm the figures and conclusions match what AI claims. Real organisation name ≠ real citation. AI commonly pairs legitimate company names with fabricated report details.'
        },
        {
          id: 'q5',
          text: 'Your manager asks you to research competitor pricing for a strategy meeting next week. Which approach is most appropriate?',
          options: [
            { id: 'a', text: 'Use ChatGPT (without browsing) to generate a competitive pricing analysis — it\'s faster' },
            { id: 'b', text: 'Use an ungrounded AI tool to brainstorm what pricing factors to research, then use a grounded tool to find and verify actual competitor pricing from their websites and public filings' },
            { id: 'c', text: 'Use any AI tool and present the output directly since it\'s just internal research' },
            { id: 'd', text: 'Avoid AI entirely for competitive intelligence and research manually' }
          ],
          correctAnswer: 'b',
          explanation: 'The best approach combines tools based on their strengths: use ungrounded AI for the structural/creative work (identifying what to research, framing the analysis) and grounded AI for the factual work (finding actual current pricing from verifiable sources). Competitor pricing changes frequently and requires current, verifiable data — exactly the scenario where grounded tools excel and ungrounded tools are dangerous.'
        }
      ]
    },

    // ─── Activity 4: Reflection & Feedback ──────────────────────────────────
    {
      id: 'module7-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Reflect on how you\'ll approach AI-assisted research differently after this module.',
      fields: [
        { id: 'research-change', label: 'What will you do differently next time you use AI for research?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'verification-rule', label: 'What\'s your personal rule for when an AI-generated claim needs verification before sharing?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'tool-choice', label: 'Which grounded AI tool will you try first for your next research task, and why?', type: 'textarea', maxLength: 400, minLength: 1 }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module7);

export default module7;
