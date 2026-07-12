/**
 * Module 10: Capstone
 *
 * Activities:
 *   1. Team Capstone Task — group activity with 4 sections (research output, draft document,
 *      visual asset, presentation summary), each up to 5000 chars
 *   2. Team Peer Review — rubric with 4 dimensions (accuracy, clarity, visual quality,
 *      completeness) rated 1-5, plus free-text feedback (2000 chars)
 *   3. Individual Close — 3 personal fields (Tools to Adopt, Use Cases to Explore,
 *      Personal Guidelines), each up to 2000 chars, min 50 chars for completion
 *   4. Course Reflection — 3 deeper reflection fields on the full learning journey
 *
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
 */

import { registerModule } from '../core/module-registry.js';

/**
 * Assigns a peer review group for the given group using a bijective mapping.
 * For G groups, each group reviews group at index (currentIndex + 1) % G.
 *
 * @param {string} groupId - The ID of the group being assigned a review target
 * @param {string[]} allGroupIds - Array of all group IDs in the session
 * @returns {string|null} The group ID to review, or null if assignment is not possible
 */
export function assignPeerReviewGroup(groupId, allGroupIds) {
  if (!Array.isArray(allGroupIds) || allGroupIds.length < 2) {
    return null;
  }

  const index = allGroupIds.indexOf(groupId);
  if (index === -1) {
    return null;
  }

  const targetIndex = (index + 1) % allGroupIds.length;
  return allGroupIds[targetIndex];
}

const module10 = {
  id: 'module10',
  title: 'Capstone',
  description: 'Bring it all together — synthesise everything you\'ve learned into a team deliverable, peer review with professional standards, and launch your ongoing AI journey.',
  sections: [
    {
      type: 'content',
      title: 'Welcome to Module 10 — The Capstone',
      content: `Welcome to the final module. Everything you've learned across nine modules comes together here — not as a test, but as a demonstration of how you'll actually work with AI going forward.

<strong>What you'll walk away with:</strong>

• A real, manager-ready deliverable that synthesizes research, writing, visuals, and presentation skills
• Experience collaborating with AI and teammates on a complex, multi-part project
• Practice giving and receiving constructive peer feedback on AI-assisted work
• A personal AI action plan for what comes after this course

This isn't an exam. There are no trick questions, no time pressure designed to make you fail. This is you demonstrating — to yourself and your team — that you can use AI tools competently, responsibly, and effectively in a realistic work scenario.

The capstone is designed to mirror a real workplace deliverable: something a manager would actually read, evaluate, and act on. You'll use every skill category from this course, work as a team, and produce something you'd be proud to present in a real meeting.`
    },
    {
      type: 'content',
      title: 'The Capstone Challenge',
      content: `<strong>What Your Team Will Produce</strong>

Your team will create a manager-ready deliverable that demonstrates AI competency across four dimensions. Think of this as the kind of output a senior leader would receive before making a decision — clear, well-researched, visually supported, and concisely presented.

<strong>The Deliverable Has Four Sections:</strong>

<em>1. Research Output</em> — Demonstrates your ability to use AI for research, fact-finding, and synthesis (Module 7 skills). You'll show that you can gather information efficiently, evaluate sources, and present findings in a structured format that supports decision-making.

<em>2. Draft Document</em> — Demonstrates your ability to write clear, professional content with AI assistance (Module 2-3 skills). This is the main body of your deliverable — well-structured, accurate, appropriate in tone, and edited to professional standards.

<em>3. Visual Asset</em> — Demonstrates your ability to create or describe visual content that supports your message (Module 8 skills). This could be a chart, infographic, diagram, or any visual element that makes your deliverable more compelling and easier to understand.

<em>4. Presentation Summary</em> — Demonstrates your ability to distill complex work into a brief, high-impact presentation format (all skills combined). This is what you'd present in a 5-minute slot with leadership — the headlines, the "so what," and the recommended action.

<strong>This Isn't a Test — It's a Demonstration</strong>

The difference matters. A test measures whether you can recall information under pressure. A demonstration shows whether you can apply skills in a realistic context. There's no single "right answer" for the capstone. There are standards of quality — accuracy, clarity, visual effectiveness, completeness — but many ways to meet them.

Your team chooses the topic, decides how to divide the work, selects which AI tools to use, and determines your own quality bar. The rubric (which another team will use to review your work) is transparent — you know exactly what "good" looks like before you start.

<strong>Why Team-Based?</strong>

In real workplaces, AI-assisted work is rarely individual. Teams need to coordinate when multiple people are using AI tools — otherwise you get inconsistent voice, contradictory facts, duplicated effort, and a final product that reads like it was assembled from disconnected pieces (because it was). The capstone deliberately creates this coordination challenge because it's one you'll face every week going forward.`
    },
    {
      type: 'content',
      title: 'Working as a Team with AI',
      content: `<strong>How to Divide Work Effectively</strong>

The obvious approach — "you do research, I'll write, they'll do visuals" — seems efficient but often produces a disjointed result. Here's why, and what to do instead.

<strong>The Coordination Problem</strong>

When team members work independently with AI, each person gets output in a slightly different voice, with slightly different assumptions, and sometimes with contradictory facts. Person A's research section mentions "the market grew 12% in 2024." Person B's draft document says "moderate growth of 8-10%." Person C's visual shows a 15% growth figure from a different source. The final deliverable looks incoherent.

This happens because each team member had a separate AI conversation, gave slightly different context, and accepted different AI outputs without cross-referencing.

<strong>The Solution: Assign a Quality Lead</strong>

Before dividing work, designate one team member as the "quality lead." Their job:
• Establish shared facts and data points the whole team will use
• Define the voice and tone for the deliverable (formal? conversational? technical?)
• Review the combined output for consistency before submission
• Catch contradictions between sections
• Ensure the four sections tell a coherent story, not four disconnected stories

The quality lead doesn't do more work — they do different work. While others build sections, the quality lead maintains the thread that connects everything.

<strong>Effective Division Strategies</strong>

<em>Strategy 1: Sequential (one person starts, others build on their work)</em>
Research first → Writing builds on research → Visuals support the writing → Summary distills everything. Each person builds on the previous person's output. Strength: coherent. Weakness: bottlenecks.

<em>Strategy 2: Parallel with sync points (everyone works simultaneously but checks in)</em>
All sections in parallel, but the team syncs after 30 minutes to share key facts, align on messaging, and resolve contradictions. Strength: fast. Weakness: requires discipline to actually sync.

<em>Strategy 3: Pair-build (two people per section, alternating)</em>
Two people collaborate on research + writing, two on visuals + presentation. Then swap for review. Strength: built-in quality check. Weakness: requires good pairing.

<strong>Common Team Mistakes to Avoid</strong>

• <em>No shared prompt context</em> — If each person gives AI different background information, outputs will conflict. Agree on a shared "brief" before anyone starts prompting.
• <em>No fact reconciliation</em> — Different AI conversations generate different "facts." Cross-check any specific claims across sections.
• <em>Assembling without editing</em> — Pasting four AI-generated sections together without a human editing pass produces obvious seams. Budget time for integration editing.
• <em>Everyone doing everything</em> — If all team members research the same topic independently with AI, you waste time on duplicated effort. Divide and trust.`
    },
    {
      type: 'content',
      title: 'The Four Deliverable Sections',
      content: `Each section of your capstone demonstrates a specific competency. Here's what "good" looks like for each, and what pitfalls to watch for.

<strong>Section 1: Research Output (Module 7 Skills)</strong>

<em>What to demonstrate:</em> Your ability to use AI for efficient research and synthesis — not just asking a chatbot a question, but conducting structured research that produces reliable, well-sourced findings.

<em>What "good" looks like:</em>
• Multiple perspectives or sources represented (not just one AI's answer)
• Clear distinction between established facts and AI-generated insights
• Sources identified or identifiable (not just "AI said so")
• Findings organized in a way that supports decision-making
• Acknowledgment of what you couldn't verify or what remains uncertain

<em>Common pitfalls:</em> Accepting AI's first answer as complete research. Presenting AI-generated content as if it were sourced from real documents. Not verifying specific claims.

<strong>Section 2: Draft Document (Module 2-3 Skills)</strong>

<em>What to demonstrate:</em> Your ability to produce clear, professional written content using AI as a drafting partner — showing that you can direct AI output, edit for accuracy and tone, and produce something that reads as polished professional communication.

<em>What "good" looks like:</em>
• Clear structure with logical flow
• Appropriate tone for the intended audience (manager-ready means professional but not stiff)
• Specific rather than generic — concrete details, not filler
• Edited for accuracy — no hallucinated facts, no contradictions with the research section
• Human judgment visible — the document makes arguments, not just lists facts

<em>Common pitfalls:</em> Submitting an unedited AI draft (generic language, over-hedging, no specific details). Writing that sounds impressive but says nothing concrete. Sections that contradict the research findings.

<strong>Section 3: Visual Asset (Module 8 Skills)</strong>

<em>What to demonstrate:</em> Your ability to create or specify visual content that supports and enhances your message — whether that's a data visualization, diagram, infographic, or AI-generated image.

<em>What "good" looks like:</em>
• Visual clearly supports the document's message (not decorative)
• Data represented accurately if using charts or graphs
• Professional quality appropriate for a manager audience
• Accessible — understandable without extensive explanation
• Described clearly enough that someone could create it if viewing the text description

<em>Common pitfalls:</em> Generic stock-photo-style visuals that add nothing. Charts with misleading scales or unlabeled axes. Visuals that look nice but don't connect to the document's argument.

<strong>Section 4: Presentation Summary (All Skills Combined)</strong>

<em>What to demonstrate:</em> Your ability to distill complex work into a brief, high-impact format — the skill of knowing what to include, what to cut, and how to lead with the "so what."

<em>What "good" looks like:</em>
• Leads with the conclusion or recommendation (not the methodology)
• Could be presented in under 5 minutes
• Each point is concise and high-impact
• Acknowledges limitations or open questions honestly
• Ends with a clear next step or call to action

<em>Common pitfalls:</em> Summarizing everything equally (a summary is selective, not proportional). Leading with process instead of conclusions. Being so brief that it's unclear, or so detailed that it's not actually a summary.`
    },
    {
      type: 'activity',
      activityId: 'team-capstone'
    },
    {
      type: 'content',
      title: 'Peer Review That Actually Helps',
      content: `<strong>How to Give Constructive Feedback on AI-Assisted Work</strong>

Peer review is one of the most valuable professional skills — and one of the hardest to do well. Most peer feedback falls into two useless categories: vague praise ("Looks great!") or vague criticism ("Could be better"). Neither helps the other team improve.

Your peer review uses a rubric with four dimensions. Here's how to use it effectively.

<strong>The Rubric: Four Dimensions</strong>

<em>1. Accuracy (1-5)</em>
Are the facts correct? Are claims supported? Are there contradictions between sections?
• <strong>5/5:</strong> All claims are verifiable or clearly marked as AI-generated insights. No contradictions. Sources are identifiable. Specific details check out.
• <strong>3/5:</strong> Generally accurate but with some unsupported claims or minor contradictions. Most facts seem right but a few feel like they might be AI hallucinations.
• <strong>1/5:</strong> Multiple incorrect or unverifiable claims. Contradictions between sections. Reads like unedited AI output with plausible-sounding but potentially fabricated details.

<em>2. Clarity (1-5)</em>
Is the writing clear? Is the structure logical? Would a manager understand this without asking follow-up questions?
• <strong>5/5:</strong> Crystal clear on first read. Logical flow. Each section builds on the previous one. No jargon without explanation. A busy manager could skim this and get the key points.
• <strong>3/5:</strong> Understandable but requires some effort. Some sections are clearer than others. A few points are ambiguous or could be interpreted multiple ways.
• <strong>1/5:</strong> Confusing structure. Unclear what the main point is. Would require significant follow-up questions to understand the recommendation.

<em>3. Visual Quality (1-5)</em>
Does the visual asset support the message? Is it professional? Does it communicate effectively?
• <strong>5/5:</strong> Visual directly supports the document's argument. Professional quality. Data is accurately represented. Immediately understandable. Adds value beyond the text.
• <strong>3/5:</strong> Visual is relevant but not particularly compelling. Adequate quality. Gets the point across but doesn't enhance understanding significantly.
• <strong>1/5:</strong> Visual seems disconnected from the document. Poor quality or misleading. Doesn't add value — feels like it was included to check a box rather than support the message.

<em>4. Completeness (1-5)</em>
Are all four sections present and substantive? Does the deliverable feel finished, not rushed?
• <strong>5/5:</strong> All sections are fully developed. Nothing feels missing or rushed. The deliverable is ready for a manager to act on without additional work.
• <strong>3/5:</strong> All sections are present but some feel underdeveloped. The overall deliverable is acceptable but has obvious gaps or areas that could be expanded.
• <strong>1/5:</strong> One or more sections are minimal or missing. The deliverable feels incomplete — like a draft rather than a finished product.

<strong>How to Be Specific Rather Than Generic</strong>

Bad feedback: "The research section could be stronger."
Good feedback: "The research section mentions '42% of companies have adopted AI' but doesn't cite where that number comes from. Adding the source would strengthen credibility."

Bad feedback: "Nice visuals."
Good feedback: "The bar chart effectively shows the growth trend, but the y-axis starts at 40% rather than 0%, which exaggerates the differences. Starting at 0 would be more accurate."

Bad feedback: "Writing is a bit long."
Good feedback: "The draft document's third paragraph repeats the same point made in paragraph one with different words. Cutting paragraph three would tighten the argument without losing content."

The pattern: identify a specific element, explain what's wrong or right about it, and suggest a concrete action if applicable.`
    },
    {
      type: 'activity',
      activityId: 'team-peer-review'
    },
    {
      type: 'content',
      title: 'Your Personal AI Journey Forward',
      content: `<strong>This Is the End of the Course — But the Beginning of Your Practice</strong>

You've now completed ten modules covering the full spectrum of AI competency for professionals: from understanding what AI is and isn't, through prompting, writing, editing, ethics, research, visual creation, and building tools. You've assessed risks, reviewed peers, and produced a team deliverable.

But here's the honest truth: a course teaches you frameworks. Practice builds real skill.

<strong>What's Changed?</strong>

Think back to Module 1. Remember your first impressions of AI tools? Your initial tool survey? Your personal AI policy? Compare that version of yourself to who you are now:

• You understand <em>how</em> AI generates output — and why that means it will always need human oversight
• You can prompt effectively — with specificity, structure, and iterative refinement
• You can evaluate AI output critically — catching hallucinations, bias, and quality issues
• You can write with AI as a partner — not delegating your judgment, but amplifying your productivity
• You can navigate the ethical dimensions — privacy, bias, attribution, responsible use
• You can research and synthesize with AI — faster and more broadly than before
• You can create visual content and presentations with AI assistance
• You can build functional tools without coding — and assess their risks before deployment

That's not minor. That's a fundamental shift in professional capability.

<strong>What to Do Starting Monday</strong>

The gap between "trained" and "competent" is filled by consistent practice. Here are concrete actions for your first week back:

1. <em>Pick one task from your weekly routine</em> — Apply what you've learned. Use AI for it deliberately, with the verification mindset active.
2. <em>Share one insight with a colleague</em> — Teaching reinforces learning. Tell someone one specific thing you learned that changed how you think about AI.
3. <em>Revisit your personal AI policy</em> — Does it still fit? Update it based on what you've learned since Module 1.
4. <em>Notice when you default to old patterns</em> — Catch yourself doing things the old way when AI could help. Also catch yourself reaching for AI when your own thinking would be better.

<strong>What Support Do You Still Need?</strong>

Be honest about gaps. Maybe you're confident with text AI but uncertain about building tools. Maybe you understand the risks but aren't sure how to navigate your company's specific policies. Maybe you want to explore a tool category you didn't get to during the course.

These gaps aren't failures — they're your learning roadmap for the next month. The individual close activity below is where you capture your personal plan.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The Real Differentiator',
      content: `The professionals who get the most from AI aren't the ones who use it the most — they're the ones who use it with the most judgment. You now have both the skills and the frameworks. The difference from here is practice. Start with one task this week. Build the habit. Let judgment develop through experience, not just training.`
    },
    {
      type: 'activity',
      activityId: 'individual-close'
    },
    {
      type: 'activity',
      activityId: 'module10-quiz'
    },
    {
      type: 'activity',
      activityId: 'module10-celebration'
    }
  ],
  activities: [
    {
      id: 'team-capstone',
      title: 'Team Capstone Task',
      type: 'form',
      groupActivity: true,
      description: 'Work with your team to produce a manager-ready deliverable that synthesises all course skills. Complete all four sections: research output, draft document, visual asset, and presentation summary.',
      fields: [
        {
          id: 'research-output',
          label: 'Research Output',
          type: 'textarea',
          maxLength: 5000,
          minLength: 1,
          required: true,
          placeholder: 'Present your team\'s research findings, including sources consulted and key insights discovered...'
        },
        {
          id: 'draft-document',
          label: 'Draft Document',
          type: 'textarea',
          maxLength: 5000,
          minLength: 1,
          required: true,
          placeholder: 'Write the main deliverable document synthesising your research into a manager-ready format...'
        },
        {
          id: 'visual-asset',
          label: 'Visual Asset',
          type: 'textarea',
          maxLength: 5000,
          minLength: 1,
          required: true,
          placeholder: 'Describe or outline the visual asset (chart, infographic, diagram) that supports your deliverable...'
        },
        {
          id: 'presentation-summary',
          label: 'Presentation Summary',
          type: 'textarea',
          maxLength: 5000,
          minLength: 1,
          required: true,
          placeholder: 'Summarise the key points for a brief presentation of your team\'s capstone deliverable...'
        }
      ],
      completionRule: 'all_fields_filled'
    },
    {
      id: 'team-peer-review',
      title: 'Team Peer Review',
      type: 'form',
      groupActivity: true,
      description: 'Review another team\'s capstone output using the rubric below. Rate each dimension on a scale of 1–5 and provide written feedback.',
      prerequisite: {
        activityId: 'team-capstone',
        message: 'Your group must submit all four capstone sections before peer review is available.'
      },
      peerReviewAssignment: {
        type: 'bijective',
        assignFn: 'assignPeerReviewGroup'
      },
      fields: [
        {
          id: 'accuracy-rating',
          label: 'Accuracy',
          type: 'rating',
          min: 1,
          max: 5,
          required: true,
          description: 'How accurate and well-supported are the claims and data presented?'
        },
        {
          id: 'clarity-rating',
          label: 'Clarity',
          type: 'rating',
          min: 1,
          max: 5,
          required: true,
          description: 'How clear and well-structured is the writing and presentation?'
        },
        {
          id: 'visual-quality-rating',
          label: 'Visual Quality',
          type: 'rating',
          min: 1,
          max: 5,
          required: true,
          description: 'How effective and professional is the visual asset?'
        },
        {
          id: 'completeness-rating',
          label: 'Completeness',
          type: 'rating',
          min: 1,
          max: 5,
          required: true,
          description: 'How thoroughly does the deliverable cover the topic and address all required elements?'
        },
        {
          id: 'feedback',
          label: 'Written Feedback',
          type: 'textarea',
          maxLength: 2000,
          minLength: 1,
          required: true,
          placeholder: 'Provide constructive feedback on the team\'s capstone deliverable...'
        }
      ],
      completionRule: 'all_fields_filled'
    },
    {
      id: 'individual-close',
      title: 'Individual Close',
      type: 'form',
      groupActivity: false,
      description: 'Create your personal AI use plan by reflecting on the tools, use cases, and guidelines you will take forward from this course.',
      fields: [
        {
          id: 'tools-to-adopt',
          label: 'Tools to Adopt',
          type: 'textarea',
          maxLength: 2000,
          minLength: 50,
          required: true,
          placeholder: 'Which AI tools will you adopt in your daily work? Describe how you plan to integrate them...'
        },
        {
          id: 'use-cases-to-explore',
          label: 'Use Cases to Explore',
          type: 'textarea',
          maxLength: 2000,
          minLength: 50,
          required: true,
          placeholder: 'What AI use cases do you want to explore further? Describe specific scenarios you want to try...'
        },
        {
          id: 'personal-guidelines',
          label: 'Personal Guidelines',
          type: 'textarea',
          maxLength: 2000,
          minLength: 50,
          required: true,
          placeholder: 'What personal guidelines will you follow when using AI tools? Consider privacy, accuracy, and responsible use...'
        }
      ],
      completionRule: 'all_fields_min_length'
    },
    {
      id: 'module10-quiz',
      title: 'Comprehensive Knowledge Check',
      type: 'quiz',
      description: 'A final review covering the major themes from across all modules — how AI works, prompt engineering, privacy, data verification, and research sourcing.',
      questions: [
        {
          id: 'q1',
          text: 'A colleague claims their AI tool "understands" their business strategy and can make autonomous decisions about resource allocation. Based on what you know about how AI actually works, what\'s the most accurate response?',
          options: [
            { id: 'a', text: 'They\'re right — modern AI systems can understand complex strategy' },
            { id: 'b', text: 'AI generates statistically probable outputs based on patterns in training data — it doesn\'t "understand" strategy. It can produce useful analysis, but autonomous high-stakes decisions still need human judgment and accountability' },
            { id: 'c', text: 'AI can never be useful for strategic work' },
            { id: 'd', text: 'It depends entirely on which AI model they\'re using' }
          ],
          correctAnswer: 'b',
          explanation: 'Understanding how AI actually generates output (Module 1) is foundational. AI produces statistically probable text based on patterns — it doesn\'t comprehend meaning or consequences. This makes it excellent for analysis and drafting, but inappropriate for autonomous high-stakes decisions without human oversight and accountability.'
        },
        {
          id: 'q2',
          text: 'You need AI to generate a detailed competitive analysis for your industry. Which prompting approach will produce the best result?',
          options: [
            { id: 'a', text: '"Write a competitive analysis"' },
            { id: 'b', text: '"Tell me about my competitors"' },
            { id: 'c', text: '"Act as a market analyst. I\'m in [specific industry]. Analyse the top 5 competitors by: market positioning, pricing strategy, product differentiation, and recent strategic moves. Format as a comparison table followed by a summary of opportunities and threats for a mid-size company."' },
            { id: 'd', text: '"Give me a SWOT analysis" and then fix whatever comes back' }
          ],
          correctAnswer: 'c',
          explanation: 'Effective prompting (Modules 2-3) requires specificity: a defined role, clear scope, specific dimensions to analyse, format requirements, and context about your perspective. The more structure you provide, the more useful the output. Vague prompts produce vague results regardless of how powerful the model is.'
        },
        {
          id: 'q3',
          text: 'Your company wants to use an AI tool that processes customer support emails to generate automated responses. What privacy consideration should be addressed FIRST?',
          options: [
            { id: 'a', text: 'Whether the AI responses are grammatically correct' },
            { id: 'b', text: 'Whether customer emails — which may contain personal data, account details, and sensitive information — are being sent to a third-party AI provider, and what that provider\'s data retention and training policies are' },
            { id: 'c', text: 'Whether the AI tool is the cheapest option available' },
            { id: 'd', text: 'Whether employees will lose their jobs to the automation' }
          ],
          correctAnswer: 'b',
          explanation: 'Privacy and data handling (Modules 4-5) must be the first consideration when AI processes personal data. Customer emails often contain PII, financial details, and sensitive context. Understanding where that data goes — especially to third-party AI providers who may retain or use it for training — is a non-negotiable prerequisite before deployment.'
        },
        {
          id: 'q4',
          text: 'An AI tool produces a market report stating "Industry revenue grew 34% in 2024, driven primarily by enterprise adoption." You plan to include this in a board presentation. What should you do?',
          options: [
            { id: 'a', text: 'Include it — AI tools have access to current data and are generally accurate with statistics' },
            { id: 'b', text: 'Include it but add "Source: AI-generated" as a footnote' },
            { id: 'c', text: 'Verify the specific claim against an authoritative source before including it. AI frequently generates plausible-sounding statistics that are fabricated or inaccurate — especially specific numbers with dates' },
            { id: 'd', text: 'Round it to "approximately 30%" so it doesn\'t need to be exact' }
          ],
          correctAnswer: 'c',
          explanation: 'Data verification (Modules 6-7) is critical for any specific claim from AI. LLMs are particularly prone to generating confident, specific-sounding statistics that are partially or entirely fabricated. Any specific number, date, or attribution destined for a high-stakes context (like a board presentation) must be verified against authoritative sources.'
        },
        {
          id: 'q5',
          text: 'You\'re using AI to help write a research report on emerging technology trends. The AI produces a paragraph that cites "a 2024 Gartner report on enterprise AI adoption." What\'s the correct approach to this citation?',
          options: [
            { id: 'a', text: 'Keep the citation as-is — if AI mentioned it, the report probably exists' },
            { id: 'b', text: 'Remove all citations since AI can\'t reliably reference real sources' },
            { id: 'c', text: 'Verify whether this specific Gartner report exists, check the actual findings match what AI claims, and either confirm with a proper citation or replace with a verified source' },
            { id: 'd', text: 'Change it to "according to industry analysts" so you don\'t need to verify' }
          ],
          correctAnswer: 'c',
          explanation: 'Research sourcing integrity (Module 7) requires verifying every specific citation AI produces. AI commonly generates plausible-sounding citations to sources that don\'t exist, or attributes claims to real sources that didn\'t actually make those claims. The professional standard is: verify the source exists, confirm the claim matches, and provide a proper citation — or find a real source instead.'
        }
      ]
    },
    {
      id: 'module10-celebration',
      title: 'Celebration & Next Steps',
      type: 'structured_entries',
      description: 'You\'ve completed the course! Take a moment to celebrate your achievement and set your intentions for what comes next.',
      fields: [
        { id: 'proudest-moment', label: 'What\'s your proudest moment from this course?', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'Think about a specific moment where something clicked, you produced great work, or you surprised yourself with what you could do...' },
        { id: 'monday-action', label: 'What will you do differently starting Monday?', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'Name one specific, concrete change you\'ll make in how you work with AI starting your first day back...' },
        { id: 'colleague-advice', label: 'One piece of advice you\'d give a colleague about AI?', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'If a colleague asked you "What\'s the one thing I should know about working with AI?" — what would you say?' }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module10);

export default module10;
