/**
 * Module 6: Reviewing and Summarising Documents
 *
 * Activities:
 *   1. Document Synthesis Sprint — summarise at 3 resolutions, extract themes
 *   2. CV Screening Discussion — AI shortlist, identified gaps, bias/legal discussion log
 *   3. Module Quiz — 5-question knowledge check
 *   4. Reflection & Feedback — structured reflection entries
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { registerModule } from '../core/module-registry.js';

const module6 = {
  id: 'module6',
  title: 'Reviewing and Summarising Documents',
  description: 'Master the art of AI-assisted summarisation — compressing information without losing what matters, at any level of detail your audience needs.',
  sections: [
    // ── 1. Welcome + Learning Objectives ────────────────────────────────────
    {
      type: 'content',
      title: 'Welcome to Module 6',
      content: `Welcome to Module 6 — where you'll learn to use AI as a document synthesis engine that compresses, extracts, and restructures information at multiple resolutions, all while maintaining the critical judgment to catch what AI gets wrong.

<strong>What you'll walk away with:</strong>

• The ability to summarise documents at multiple resolutions — one-line, paragraph, and full-page — tailored to different audiences and decision contexts
• A trained eye for identifying what AI misses in documents — the nuances, caveats, implicit meanings, and political context that change how information should be interpreted
• The skills to navigate ethical concerns in AI-assisted screening — understanding how AI reproduces bias, where legal obligations apply, and how to build fair processes around powerful tools
• A professional document review workflow that leverages AI speed while preserving human accuracy and judgment

Document synthesis is one of AI's genuine superpowers. A 50-page report can become a single sentence for a Slack message, a paragraph for a stakeholder brief, or a full-page summary for archival reference — all in seconds. But that speed comes with risks. AI doesn't just compress; it interprets, and its interpretations carry biases you won't notice unless you know where to look.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'How This Module Works',
      content: `Use the AI Chat (💬 button) throughout this module. Paste in documents, ask for summaries at different levels, and practise identifying what gets lost at each compression level. Your work saves automatically.`
    },

    // ── 2. The Multi-Resolution Summary Skill ───────────────────────────────
    {
      type: 'content',
      title: 'The Multi-Resolution Summary Skill',
      content: `Different audiences need different levels of detail. Your CEO doesn't read the same document as your project team — and neither should they. The ability to produce the right summary at the right resolution for the right audience is one of the most valuable professional communication skills, and AI makes it dramatically faster.

<strong>Why resolution matters:</strong>

Consider a 40-page quarterly business review. The same document needs to serve:
• A Slack message to the team: "Q3 missed revenue target by 8% — recovery plan in next week's all-hands" (one line)
• A pre-read for the leadership meeting: key metrics, causes, proposed actions, timeline (one paragraph)
• An onboarding reference for new hires joining next quarter: full context, methodology, historical trend, team responsibilities (full page)

Each version isn't just shorter or longer — it preserves different information because different audiences need different things to make their specific decisions.

<strong>The one-line / paragraph / full-page framework:</strong>

<strong>One-line (10-15 words):</strong> Captures the single most important takeaway. Forces you to identify what matters most. Used for email subjects, Slack updates, task titles, document labels.

<strong>Paragraph (50-100 words):</strong> Preserves the conclusion, key supporting evidence, primary implication, and most important caveat. Used for stakeholder briefs, meeting pre-reads, decision memos, handoff notes.

<strong>Full page (250-400 words):</strong> Maintains the complete narrative arc — context, methodology, findings, implications, limitations, and next steps. Used for archival reference, onboarding materials, comprehensive briefings.

<strong>How AI handles each resolution level differently:</strong>

At the one-line level, AI must make a judgment about what the "most important" thing is — and it often defaults to the most prominently stated conclusion rather than the most consequential finding. A report might state "customer satisfaction improved" in its executive summary while burying "but churn increased 40% in the enterprise segment" on page 23. AI will likely capture the first, not the second.

At the paragraph level, AI handles structure well — it can compress an argument while maintaining logical flow. But it tends to drop caveats and qualifying statements because they make paragraphs longer without adding "new" information.

At the full-page level, AI performs best because compression pressure is lowest. But it may still flatten disagreements, skip methodology notes it considers "standard," and miss implications that require domain knowledge to spot.

<strong>The critical test at every level:</strong> "If someone read only this summary and made a decision based on it, would they be misled about anything important?" If yes, something essential was lost in compression.`
    },

    // ── 3. AI's Summarisation Strengths and Weaknesses ──────────────────────
    {
      type: 'content',
      title: 'AI\'s Summarisation Strengths and Weaknesses',
      content: `Understanding exactly where AI excels and where it silently fails in document synthesis is the foundation of using it responsibly. The strengths are genuine — but the weaknesses are dangerous precisely because they're invisible in the output.

<strong>What AI captures well:</strong>

<strong>Main arguments and conclusions:</strong> AI reliably identifies the primary thesis, central argument, or key conclusion of a document. If a report's purpose is to recommend a course of action, AI will almost always capture that recommendation accurately.

<strong>Key data points:</strong> Numbers, percentages, dates, and quantitative findings survive compression well. AI recognises that "revenue grew 23% to $4.2M" is more information-dense than the surrounding prose and preserves it.

<strong>Structural elements:</strong> AI understands document architecture — introductions, literature reviews, methodology sections, findings, recommendations, appendices. It can reorganise information according to these structural patterns even when the original document is poorly organised.

<strong>Explicit relationships:</strong> When a document states "A caused B" or "X contradicts Y," AI captures these stated relationships accurately. It's good at preserving logical connections that are explicitly written.

<strong>Recurring themes:</strong> When the same concept appears multiple times across a document, AI recognises the repetition and surfaces it as a key theme. Frequency-based importance detection is reliable.

<strong>What AI misses:</strong>

<strong>Nuance and qualification:</strong> "Sales grew, but entirely from one client" becomes "Sales grew." The "but" clause — which changes the entire strategic implication — gets dropped because it makes the summary longer. AI systematically strips qualifications, hedges, and "however" statements.

<strong>Implicit meaning:</strong> When a report says "the timeline was ambitious" and everyone in your organisation knows this means "it was impossible and we all knew it," AI takes the statement at face value. Understatement, irony, diplomatic language, and coded organisational communication are invisible to AI.

<strong>Political context:</strong> A document might carefully avoid naming a department responsible for a failure, or might praise a initiative that everyone knows is being shut down. The political subtext — who's protecting whom, what's being positioned for the next reorg — is completely opaque to AI.

<strong>What's important to YOUR specific audience:</strong> AI doesn't know that your board cares deeply about customer acquisition cost but considers employee satisfaction a "nice to have." It doesn't know that your VP has been asking about the European expansion for three meetings running. Audience-specific relevance requires human judgment that no AI currently possesses.

<strong>Dissenting opinions and minority views:</strong> If 8 out of 10 stakeholders agree on a direction but 2 have serious objections, AI tends to summarise this as "stakeholders agreed" — erasing the dissent entirely. The existence of disagreement is itself critical information for decision-makers.

<strong>Conditional statements:</strong> "If market conditions remain stable, we project 15% growth" often becomes "we project 15% growth." The condition — which is the entire basis for the projection — disappears.

<strong>Real examples of these failures:</strong>

• A due diligence report that mentioned "minor regulatory concerns in two jurisdictions" was summarised without that caveat. Those "minor concerns" later became a $2M compliance cost.
• A performance review summary dropped the phrase "when given clear direction" from "delivers excellent results when given clear direction" — changing a conditional positive into an unconditional one.
• A market research report noting "respondents in urban areas preferred X" was summarised as "respondents preferred X" — erasing the geographical limitation that was critical for a rural expansion decision.

The pattern: AI failures in summarisation are not random. They systematically favour cleaner, simpler, more confident-sounding outputs — which means they systematically remove the complexity, uncertainty, and caveats that professionals need to make good decisions.`
    },

    // ── 4. The Theme Extraction Technique ───────────────────────────────────
    {
      type: 'content',
      title: 'The Theme Extraction Technique',
      content: `Theme extraction — identifying cross-cutting patterns across multiple documents — is one of AI's strongest capabilities when guided properly. A human reading 30 customer feedback emails might notice 3-4 recurring themes. AI can reliably identify 8-10, including subtle patterns that emerge only across volume.

<strong>How to use AI for theme extraction:</strong>

The key is structured prompting. Don't just paste 15 documents and say "find themes." Instead, guide the AI with specific instructions about what counts as a theme, how many you expect, and what level of granularity you want.

<strong>Practical prompt templates for theme extraction:</strong>

<strong>Template 1: Cross-document themes</strong>
"I'm going to paste [N] documents. For each, identify the 3-5 main themes discussed. Then, across all documents, identify which themes appear in multiple sources, rank them by frequency, and flag any theme that appears in only one document (these may be unique insights or outliers)."

<strong>Template 2: Stakeholder alignment analysis</strong>
"These are notes from [N] stakeholder interviews about [topic]. Identify: (1) Points where all stakeholders agree, (2) Points where stakeholders disagree, (3) Topics mentioned by some but not others — these gaps may indicate blind spots or differing priorities."

<strong>Template 3: Evolution over time</strong>
"These are quarterly reports from the same team over [time period]. Identify: (1) Themes that appear consistently across all quarters, (2) Themes that emerge or grow over time, (3) Themes that disappear — what was a concern in Q1 but isn't mentioned by Q4?"

<strong>Template 4: Sentiment-aware themes</strong>
"Analyse these customer feedback entries. Group into themes, but for each theme note: (1) How many entries mention it, (2) The prevailing sentiment (positive, negative, mixed), (3) Whether the sentiment is changing over time if dates are available."

<strong>Making theme extraction reliable:</strong>

• Always ask AI to cite which documents support each theme — this lets you verify rather than trust
• Request a "confidence" indicator: themes supported by 8/10 documents are more reliable than themes from 2/10
• Ask for counter-examples: "For each theme, are there any documents that contradict or complicate it?"
• Specify granularity: "I want high-level strategic themes, not operational details" prevents AI from mixing levels

<strong>Where theme extraction goes wrong:</strong>

AI sometimes generates "phantom themes" — patterns it expects to find based on the document type rather than patterns actually present. If you give it customer feedback, it might report "pricing concerns" as a theme even if nobody mentioned pricing, because that's a common theme in customer feedback generally.

The fix: always ask "Which specific documents mention this theme? Quote the relevant passages." If AI can't point to specific evidence, the theme is likely hallucinated.`
    },

    // ── 5. Activity: Document Synthesis Sprint ──────────────────────────────
    {
      type: 'activity',
      activityId: 'document-synthesis-sprint'
    },

    // ── 6. AI in Hiring — Opportunities and Ethical Minefields ──────────────
    {
      type: 'content',
      title: 'AI in Hiring — Opportunities and Ethical Minefields',
      content: `Document synthesis in recruitment — screening CVs, evaluating applications, shortlisting candidates — is one of the highest-stakes applications of AI in professional life. The efficiency gains are real. So are the risks of discrimination at scale.

<strong>How AI can help with CV screening:</strong>

<strong>Speed:</strong> AI can process hundreds of CVs in minutes, extracting relevant experience, matching skills to job requirements, and producing structured comparisons. For a role receiving 300 applications, AI can surface candidates who might otherwise be overlooked buried in the pile.

<strong>Consistency:</strong> Unlike human reviewers who get tired, lose focus, or unconsciously shift their criteria after lunch, AI applies the same evaluation framework to candidate 1 and candidate 247. This consistency is valuable — every application gets equal processing attention.

<strong>Pattern matching across volume:</strong> AI can identify transferable skills and relevant experience that a human reviewer might miss when scanning quickly. A candidate whose CV doesn't use the exact keywords but demonstrates the underlying competence might be caught by AI when a fatigued human reviewer would pass them over.

<strong>Structured comparison:</strong> AI can normalise different CV formats into comparable summaries, making it easier for human reviewers to evaluate candidates on substance rather than presentation skill.

<strong>How AI can discriminate:</strong>

<strong>Pattern-matching from biased historical data:</strong> This is the fundamental problem. AI learns "what good candidates look like" from historical hiring decisions. If your organisation (or your industry) has historically favoured candidates from certain demographics, universities, or career paths, AI learns those patterns and reproduces them — perfectly, consistently, at scale.

Amazon famously scrapped an AI hiring tool after discovering it systematically penalised CVs containing the word "women's" (as in "women's chess club captain") because it had learned from a decade of male-dominated hiring data.

<strong>Penalising career gaps:</strong> AI often learns that "linear career progression" correlates with being hired. This systematically disadvantages anyone who took time out for caregiving, illness, career changes, or education — disproportionately affecting women, people with disabilities, and career changers who may bring valuable diverse perspectives.

<strong>Favouring certain educational backgrounds:</strong> If historical hires disproportionately came from Russell Group or Ivy League universities, AI treats educational prestige as a predictor of job performance — even when no actual performance data supports this correlation. This entrenches socioeconomic privilege as a hiring criterion.

<strong>Proxy discrimination:</strong> Even when protected characteristics (gender, race, age) aren't in the data, AI finds proxies. Names, postcodes, university choices, extracurricular activities, and writing style all correlate with demographics. AI doesn't need to "see" your gender to discriminate based on patterns associated with it.

<strong>The bias amplification cycle:</strong>
1. Historical hiring data contains human biases (conscious and unconscious)
2. AI learns these patterns as "what successful candidates look like"
3. AI applies these patterns with perfect consistency — no occasional deviation that lets a non-traditional candidate through
4. The next generation of hiring data is even more biased because AI enforced the pattern flawlessly
5. Each cycle narrows the funnel further until "diversity" becomes structurally impossible without intervention`
    },

    // ── 7. Callout (warning) — Bias in AI-Assisted Hiring ───────────────────
    {
      type: 'callout',
      variant: 'warning',
      title: 'Bias in AI-Assisted Hiring Decisions',
      content: `AI screening tools trained on historical hiring data will reproduce — and amplify — whatever biases existed in that history. This isn't a theoretical risk; it's a documented pattern across industries. Legal obligations apply: the EU AI Act classifies employment AI as "high-risk" requiring human oversight, bias auditing, and transparency. In many jurisdictions, disparate impact liability doesn't require intent — if your tool disproportionately excludes protected groups, the outcome itself may be unlawful regardless of design intent. Always audit AI shortlists for patterns of exclusion and ensure human decision-makers review every rejection with the question: "Is this exclusion justified by actual job-relevant criteria?"`
    },

    // ── 8. Activity: CV Screening Discussion ────────────────────────────────
    {
      type: 'activity',
      activityId: 'cv-screening-discussion'
    },

    // ── 9. Building Critical Reading Habits ─────────────────────────────────
    {
      type: 'content',
      title: 'Building Critical Reading Habits',
      content: `Every AI summary you read — whether of a document, a set of CVs, or a body of research — deserves the same critical scrutiny you'd give to a briefing from someone you've never worked with before. The summary looks authoritative, reads fluently, and states conclusions with confidence. None of that means it's accurate, complete, or fair.

<strong>How to read AI summaries with the right level of scepticism:</strong>

Don't treat AI summaries as "the document, but shorter." They're a different thing entirely — they're the AI's interpretation of what matters in the document, filtered through its training biases, compression algorithms, and pattern-matching tendencies. Reading a summary is not a substitute for reading the source when decisions are at stake.

The right mindset: treat every AI summary as a first draft written by a capable but unreliable research assistant. It's a starting point, not an endpoint. It tells you what's probably in the document and roughly what it's about — but it doesn't tell you what's missing, what's been distorted, or what matters most to your specific situation.

<strong>The "what's missing" question:</strong>

After reading any AI summary, ask: "What might this summary be omitting that could change my understanding if I knew it?"

This isn't a paranoid question — it's a structural one. You know AI systematically drops:
• Caveats and qualifications
• Minority opinions and dissenting views
• Conditional statements and their conditions
• Context that requires organisational knowledge
• Information that's important to your specific audience but not "generally" important

So asking "what's missing" isn't speculation — it's checking for known failure modes. If the summary describes a recommendation, ask: "Were there objections? What were the risks noted? What assumptions does this depend on?"

<strong>The "who benefits from this framing" question:</strong>

Every summary frames information in a particular way. The choice of what to include, what to emphasise, and what language to use creates a narrative — and narratives serve interests.

Ask: "If I accepted this summary as the complete truth, whose interests would that serve? Whose interests might it harm?"

This isn't about assuming bad intent from AI. It's about recognising that framing is never neutral. When AI summarises a restructuring plan as "an efficiency initiative," that's a frame. When it summarises a complaint as "feedback," that's a frame. When it describes a failure as a "learning opportunity," that's a frame. Each frame makes some responses more natural and others less visible.

In recruitment contexts, this question is especially powerful: "Who benefits from defining 'qualified candidate' the way this AI has defined it? Who gets excluded by that definition?"

<strong>Building these habits into your workflow:</strong>

• Before acting on any AI summary: read the original source document for at least the sections where decisions will be made
• After receiving an AI shortlist: explicitly ask "who was excluded and why?" — review the rejections, not just the acceptances
• When sharing AI summaries with others: flag that it's AI-generated and note any caveats you've identified through verification
• Create a personal checklist: 3 questions you always ask before trusting an AI synthesis for decision-making`
    },

    // ── 10. Activity: Module Quiz ───────────────────────────────────────────
    {
      type: 'activity',
      activityId: 'module6-quiz'
    },

    // ── 11. Activity: Reflection & Feedback ─────────────────────────────────
    {
      type: 'activity',
      activityId: 'module6-feedback'
    }
  ],

  activities: [
    // ─── Activity 1: Document Synthesis Sprint ──────────────────────────────
    {
      id: 'document-synthesis-sprint',
      title: 'Document Synthesis Sprint',
      type: 'form',
      description: 'Summarise a document at three resolutions (one-line, paragraph, full page) and extract key themes. Use a real document from your work or paste one into the AI Chat and practise the Multi-Resolution Summary framework.',
      isGroupActivity: true,
      fields: [
        {
          id: 'one-line-summary',
          label: 'One-Line Summary (max 150 characters)',
          type: 'textarea',
          maxLength: 150,
          minLength: 1,
          required: true,
          placeholder: 'Write a one-line summary capturing the single most important takeaway...'
        },
        {
          id: 'paragraph-summary',
          label: 'Paragraph Summary (50-100 words)',
          type: 'textarea',
          maxLength: 700,
          minLength: 1,
          required: true,
          placeholder: 'Write a paragraph-length summary including conclusion, evidence, and key caveat...'
        },
        {
          id: 'full-page-summary',
          label: 'Full Page Summary (250-400 words)',
          type: 'textarea',
          maxLength: 3000,
          minLength: 1,
          required: true,
          placeholder: 'Write a full page summary preserving findings, methodology, caveats, and next steps...'
        },
        {
          id: 'themes',
          label: 'Extracted Themes',
          type: 'structured_table',
          required: true,
          minRows: 1,
          maxRows: 10,
          columns: [
            { id: 'theme', label: 'Theme', type: 'text', maxLength: 200, minLength: 1 }
          ],
          placeholder: 'Add extracted themes (up to 10)...'
        }
      ],
      completionRule: 'all_required_fields_filled'
    },

    // ─── Activity 2: CV Screening Discussion ────────────────────────────────
    {
      id: 'cv-screening-discussion',
      title: 'CV Screening Discussion',
      type: 'form',
      description: 'Review an AI-generated candidate shortlist, identify gaps in the AI\'s reasoning, and discuss bias and legal constraints. Consider: who is being systematically excluded, and is that exclusion justified by actual job-relevant criteria?',
      fields: [
        {
          id: 'shortlist',
          label: 'AI-Generated Shortlist',
          type: 'structured_table',
          required: true,
          minRows: 1,
          maxRows: 10,
          columns: [
            { id: 'candidate', label: 'Candidate', type: 'text', maxLength: 200, minLength: 1 },
            { id: 'rationale', label: 'Rationale', type: 'textarea', maxLength: 500, minLength: 1 }
          ],
          placeholder: 'Add shortlisted candidates with the AI\'s rationale (up to 10)...',
          loadable: true,
          loadErrorMessage: 'The AI-generated shortlist is unavailable. Please retry the generation.'
        },
        {
          id: 'gaps',
          label: 'Identified Gaps',
          type: 'structured_table',
          required: true,
          minRows: 1,
          maxRows: 10,
          columns: [
            { id: 'gap', label: 'Gap Description', type: 'textarea', maxLength: 500, minLength: 1 }
          ],
          placeholder: 'What did the AI miss or undervalue? (up to 10)...'
        },
        {
          id: 'discussion-log',
          label: 'Discussion Log (Bias and Legal Constraints)',
          type: 'structured_table',
          required: true,
          minRows: 1,
          maxRows: 50,
          columns: [
            { id: 'entry', label: 'Discussion Entry', type: 'textarea', maxLength: 1000, minLength: 1 }
          ],
          placeholder: 'Document your discussion about bias patterns and legal constraints (up to 50)...'
        }
      ],
      completionRule: 'all_required_fields_filled'
    },

    // ─── Activity 3: Module Quiz ────────────────────────────────────────────
    {
      id: 'module6-quiz',
      title: 'Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of multi-resolution summarisation, AI synthesis limitations, and bias in AI-assisted screening.',
      questions: [
        {
          id: 'q1',
          text: 'What\'s the main risk of relying solely on AI summaries of long documents?',
          options: [
            { id: 'a', text: 'The summaries might be too short to be useful' },
            { id: 'b', text: 'AI may omit nuances, caveats, or context that changes the meaning of key findings' },
            { id: 'c', text: 'AI summaries take too long to generate for practical use' },
            { id: 'd', text: 'The formatting of AI summaries is unprofessional' }
          ],
          correctAnswer: 'b',
          explanation: 'AI systematically drops qualifications, caveats, conditional statements, and dissenting views during compression. A summary that states "revenue grew 12%" without mentioning it was driven by a single anomalous deal, or a recommendation without its critical assumptions, can lead decision-makers to confident but wrong conclusions. The risk isn\'t that summaries are short — it\'s that they\'re selectively incomplete in ways that distort meaning.'
        },
        {
          id: 'q2',
          text: 'When AI summarises a 50-page report into one paragraph, what type of information is most likely to be lost?',
          options: [
            { id: 'a', text: 'The report\'s title and author' },
            { id: 'b', text: 'The primary recommendation or conclusion' },
            { id: 'c', text: 'Dissenting opinions, caveats, and conditional statements' },
            { id: 'd', text: 'Numerical data and specific figures' }
          ],
          correctAnswer: 'c',
          explanation: 'AI prioritises clean, confident-sounding narratives during compression. Primary conclusions and key numbers tend to survive because they\'re prominent and information-dense. But dissenting opinions ("however, two board members objected"), caveats ("assuming market conditions remain stable"), and conditional statements ("only if the Q4 launch proceeds on schedule") get systematically dropped because they make summaries longer without adding what AI perceives as "new" information. These are precisely the elements that prevent overconfident decision-making.'
        },
        {
          id: 'q3',
          text: 'Why is AI-assisted CV screening potentially discriminatory?',
          options: [
            { id: 'a', text: 'AI can\'t read CVs accurately due to formatting differences' },
            { id: 'b', text: 'AI always rejects candidates over 40 years old' },
            { id: 'c', text: 'It pattern-matches from historical hiring data which may reflect existing biases' },
            { id: 'd', text: 'AI screening is always illegal under employment law' }
          ],
          correctAnswer: 'c',
          explanation: 'AI learns "what good candidates look like" from historical hiring decisions. If an organisation historically favoured candidates from certain universities, with linear career paths, or from particular demographics, AI treats those patterns as predictors of success and applies them with perfect consistency at scale. This doesn\'t require the AI to "see" protected characteristics directly — it finds proxies (postcodes, university names, extracurricular activities) that correlate with demographics and uses those instead.'
        },
        {
          id: 'q4',
          text: 'What\'s the "what\'s missing" technique in document review?',
          options: [
            { id: 'a', text: 'Checking whether the AI forgot to include the document\'s page numbers' },
            { id: 'b', text: 'Asking what the summary omits that might change your understanding if you knew it' },
            { id: 'c', text: 'Counting words to ensure the summary meets a minimum length' },
            { id: 'd', text: 'Asking AI to regenerate the summary to see if it produces different content' }
          ],
          correctAnswer: 'b',
          explanation: 'The "what\'s missing" technique is a structured critical reading habit. After reading any AI summary, you ask: "What might this be leaving out that would change my decision if I knew it?" Because you know AI systematically drops caveats, dissenting views, conditional statements, and audience-specific context, this question targets known failure modes rather than being a vague call for scepticism. It turns abstract distrust into specific, actionable verification.'
        },
        {
          id: 'q5',
          text: 'A company uses AI to screen 500 CVs for a senior role. The AI rejects a candidate with 15 years of domain expertise because she took a 3-year career break to care for a family member. Which statement best describes this situation?',
          options: [
            { id: 'a', text: 'The AI made the correct decision because career gaps indicate lower commitment' },
            { id: 'b', text: 'This is an appropriate use of AI because it applies criteria consistently' },
            { id: 'c', text: 'The AI is using career linearity as a proxy signal rather than actual job-relevant criteria like demonstrated competence and domain knowledge' },
            { id: 'd', text: 'The candidate should have explained the gap better in her CV' }
          ],
          correctAnswer: 'c',
          explanation: 'Career gaps don\'t predict job performance, but AI learns to penalise them because historical hiring data shows a pattern of rejecting candidates with gaps. The AI is using "career linearity" as a proxy for "good candidate" when the actual job-relevant criteria — domain expertise, demonstrated results, problem-solving ability — are all present. This kind of proxy discrimination disproportionately affects caregivers (mostly women), people who experienced illness, and career changers — without any evidence that linearity predicts performance in the role.'
        }
      ]
    },

    // ─── Activity 4: Reflection & Feedback ──────────────────────────────────
    {
      id: 'module6-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Reflect on how you\'ll apply document synthesis and critical reading skills in your professional work.',
      fields: [
        { id: 'synthesis-application', label: 'What document or set of documents will you try the Multi-Resolution Summary method on this week?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'bias-watchpoint', label: 'What\'s one bias or omission pattern you\'ll now watch for when reviewing AI-generated summaries or shortlists?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'critical-reading', label: 'How will you apply the "what\'s missing" and "who benefits" questions in your day-to-day work?', type: 'textarea', maxLength: 400, minLength: 1 }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module6);

export default module6;
