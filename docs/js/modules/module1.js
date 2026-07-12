/**
 * Module 1: AI Landscape and Tool Survey
 *
 * Activities:
 *   1. Tool Survey — guided checklist across 5 AI tool categories
 *   2. Use Case Brainstorm — structured entries for personal AI use cases
 *   3. Personal Tool Map — structured entries for documenting tools
 *   4. Quick Quiz — 5-question multiple-choice knowledge check
 *   5. Personal AI Policy — structured entries for personal AI usage rules
 *   6. Reflection & Feedback — structured reflection entries
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import { registerModule } from '../core/module-registry.js';

const module1 = {
  id: 'module1',
  title: 'AI Landscape and Tool Survey',
  description: 'Overview of AI types and hands-on exploration of a wide range of tools.',
  sections: [
    {
      type: 'content',
      title: 'Welcome to Module 1',
      content: `Welcome to Module 1 — your foundation for everything that follows in this course. By the end of this session, you won't just know what Generative AI is — you'll understand how it works well enough to use it with confidence and healthy skepticism.

<strong>What you'll walk away with:</strong>

• A clear mental model of how AI generates text (and why it sometimes gets things wrong)
• Practical knowledge of which AI tools exist and when to reach for each one
• Real examples of how professionals are using AI right now — not hypotheticals, but actual workflows
• A personal framework for when AI helps vs when it hurts
• Your own AI usage policy — boundaries you've set for yourself based on informed judgment

This isn't a technology lecture. It's a practical orientation for professionals who want to work smarter without working recklessly. You'll do exercises, brainstorm applications for your specific role, and leave with an action plan for this week.

Use the AI Chat (💬 button) in the bottom-right corner anytime to ask questions, get clarification, or explore ideas further. The AI assistant has context about this module and can help you think through the exercises.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'How to Use This Page',
      content: `This is your interactive worksheet. While your facilitator presents, complete the exercises below at your own pace. Your work saves automatically — close the browser, come back tomorrow, and everything will be here. There's no time pressure. The exercises are designed to make you think, not to be rushed through.`
    },
    {
      type: 'content',
      title: 'What is Generative AI?',
      content: `<strong>The "Advanced Autocomplete" Analogy</strong>

Think about your phone's keyboard. When you type "See you at the," your phone suggests "meeting" or "office" or "airport" — based on patterns it has learned from millions of text messages. It doesn't understand where you're going. It's predicting what word is statistically likely to come next.

Generative AI works on the same principle, but at an extraordinary scale. When you type a prompt into ChatGPT or Claude, the system predicts the most probable next word (called a "token") based on patterns learned from billions of pages of text. It does this thousands of times in sequence, producing paragraphs that read like thoughtful, expert answers.

The difference between your phone's autocomplete and GPT-4 is like the difference between a puddle and the Pacific Ocean. Your phone has seen thousands of messages. GPT-4 has absorbed a significant portion of the publicly available internet — books, research papers, code repositories, forums, articles, and documentation. The patterns it has learned are incredibly rich, which is why its output can be remarkably good.

<strong>Why Training Data Matters</strong>

The quality and breadth of training data directly determines what an AI can and cannot do well. A model trained primarily on English text will struggle with Mandarin. A model trained before 2023 won't know about events that happened in 2024. A model that has seen millions of legal documents will sound convincing when discussing law — but it's still pattern-matching, not practising law.

This has practical implications for you: AI tools are strongest in domains where vast amounts of high-quality written material exists (business writing, coding, general knowledge). They're weakest in domains that are niche, recent, proprietary, or primarily oral traditions. If your company has internal processes that aren't documented anywhere public, the AI has never seen them and will guess — often convincingly but incorrectly.

<strong>Hallucination — The Critical Risk</strong>

Here's the most important thing to understand: AI models have no mechanism for self-doubt. A human expert who is unsure will hedge or say "I don't know." A generative AI produces output with the same confident tone whether the information is accurate or completely fabricated. The industry calls this "hallucination."

<em>Workplace example:</em> You ask an AI to summarize your company's parental leave policy. The AI generates a clear, professional summary that states "Employees are entitled to 16 weeks of paid parental leave after 12 months of tenure." It sounds authoritative. But your company's actual policy is 12 weeks after 6 months. The AI invented plausible-sounding details because it couldn't say "I don't have access to your company's specific policy." If you forwarded this to a new employee without checking, you'd be spreading misinformation with your name on it.

<strong>What AI is NOT</strong>

Let's clear up some persistent myths:

• <strong>AI is not thinking.</strong> It doesn't understand your question. It identifies patterns in your input and generates statistically likely continuations. This isn't a semantic distinction — it explains why AI can sound brilliant one moment and produce nonsense the next.

• <strong>AI is not searching the internet</strong> (unless it has a specific web-search feature enabled). Most AI models work from their training data — a frozen snapshot of text from a cutoff date. They don't look things up. They generate what seems probable based on what they've already learned.

• <strong>AI is not a database of facts.</strong> It doesn't store and retrieve information the way a search engine does. It generates text that is statistically likely to be correct, which is different from looking up a verified answer.

• <strong>AI is not sentient, conscious, or aware.</strong> When it says "I think" or "I believe," these are patterns in language, not evidence of inner experience. It produces human-sounding text because it was trained on human text.

• <strong>AI is not consistently accurate.</strong> It can get the same question right today and wrong tomorrow, depending on how the question is phrased. Consistency is not a feature of statistical prediction.

The practical takeaway: GenAI is a powerful drafting and brainstorming tool, but it requires a human in the loop who can evaluate the output critically.`
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Key Insight',
      content: `The gap between "sounds right" and "is right" is where AI creates the most risk in professional settings. AI doesn't signal uncertainty — it generates the same confident tone whether it's giving you a well-established fact or a complete fabrication. Your job is to be the quality filter.`
    },
    {
      type: 'content',
      title: 'AI in Your Workday — Real Examples',
      content: `Let's move from theory to practice. Here's how professionals across industries are using AI tools right now — not in experimental pilots, but in their daily workflows.

<strong>1. Drafting Meeting Agendas from Messy Notes</strong>
You've got scattered bullet points from a pre-meeting call, three Slack threads, and a rambling voicemail. You paste the raw material into Claude and ask it to produce a structured agenda with time allocations. What used to take 20 minutes takes 3. You still review it, reorder two items, and add a note the AI missed — but 80% of the formatting work is done.

<strong>2. Summarizing Long Email Threads</strong>
Someone forwards you a 47-message email chain and says "Can you get up to speed on this?" Instead of spending 15 minutes reading every reply, you paste the thread into an AI tool and ask for a summary of key decisions, open questions, and action items. You get a one-page brief in 30 seconds. You still skim the original to catch anything nuanced, but you've cut your ramp-up time by 70%.

<strong>3. Creating First Drafts of Proposals</strong>
You need a project proposal by Friday. You know the key points but staring at a blank page is the bottleneck. You feed the AI your bullet points, the target audience, and the format you need. It produces a structured first draft. You spend your time refining arguments and adding specifics rather than fighting blank-page paralysis.

<strong>4. Analysing Customer Feedback at Scale</strong>
Your team received 200 customer survey responses. Manually reading and categorising them would take days. You feed them to an AI tool and ask it to identify the top 5 themes, sentiment breakdown, and notable outlier responses. It gives you a starting framework in minutes. You validate against the raw data, but the initial pattern recognition saves hours.

<strong>5. Generating Code for Automation Scripts</strong>
You need a Python script to rename 500 files in a specific pattern, or a spreadsheet macro to clean up inconsistent date formats. You describe the task to Copilot or ChatGPT. It writes the code. You test it on a sample set before running it on real data. Tasks that would require 30 minutes of Stack Overflow browsing take 5 minutes.

<strong>6. Creating Presentation Outlines</strong>
You're presenting quarterly results to leadership next week. You give the AI your key metrics, three wins, two challenges, and asked questions from last quarter. It produces a slide-by-slide outline with suggested talking points. You reorganize, cut a section that doesn't land, and add a story the AI couldn't know about — but the structural thinking is done.

<strong>7. Translating Technical Content for Non-Technical Audiences</strong>
Your engineering team wrote a technical post-mortem full of system architecture references and error codes. You need to explain to the sales team what happened and what it means for customers. AI is excellent at this translation task — maintaining accuracy while adjusting vocabulary, removing jargon, and restructuring for a different audience's priorities.

<strong>8. Brainstorming Solutions to Complex Problems</strong>
You're stuck on how to restructure your team's workflow after a reorg. You describe the situation, constraints, and goals to an AI tool and ask for 10 possible approaches. Half of them won't fit your situation — but two or three spark ideas you hadn't considered. AI as a brainstorming partner breaks you out of your own thinking patterns.

<strong>9. Writing Job Descriptions and Interview Questions</strong>
You're hiring for a new role. You describe the responsibilities, team culture, and required skills. The AI produces a first-draft job description and a set of behavioural interview questions. You adjust for your company's voice and add role-specific technical questions — but the boilerplate is handled.

<strong>10. Preparing for Difficult Conversations</strong>
You need to give a team member feedback about missed deadlines. You ask the AI to help you frame the conversation — direct but compassionate, focused on behaviour not character, with specific examples. It gives you a script to work from. You won't read it verbatim, but practising with a structured framework makes the real conversation easier.

<strong>The common pattern:</strong> In every example above, AI handles the structural, repetitive, or "first 80%" work. The human handles judgment, context, verification, and the final 20% that requires actual knowledge of the situation. This is the partnership model that works.`
    },
    {
      type: 'content',
      title: 'The Human + AI Partnership Model',
      content: `The professionals who get the most value from AI aren't the ones who use it the most — they're the ones who understand when to use it and when not to. This requires a mental model for the partnership.

<strong>The Co-Pilot Mental Model</strong>

Think of AI as a co-pilot, not an autopilot. An autopilot flies the plane while you sleep. A co-pilot assists while you remain in command. You're still responsible for the destination, the decisions, and the safety of the passengers. The co-pilot handles routine calculations, monitors instruments, and offers suggestions — but you make the calls.

In practice this means: AI does the heavy lifting on tasks that are structural, repetitive, or require broad pattern recognition. You provide direction, judgment, domain expertise, and quality control. The work still has your name on it, and you're still accountable for its accuracy and appropriateness.

<strong>When to Use AI</strong>

AI is your best assistant when:
• The task is time-consuming but not intellectually complex (formatting, restructuring, summarizing)
• You need a first draft to react to rather than a blank page to fill
• The task requires broad knowledge synthesis (comparing options, explaining concepts)
• You need brainstorming volume — lots of ideas quickly, even if most won't work
• The task has clear evaluation criteria (you'll know good output when you see it)
• You're working in a domain with extensive public documentation

<strong>When NOT to Use AI (or Use with Extreme Caution)</strong>

AI is the wrong tool when:
• The task requires knowledge of confidential information you shouldn't paste into external tools
• The output will be taken as fact without opportunity for verification (legal filings, medical advice)
• The work requires genuine originality, not recombination of existing patterns
• You're in a domain where being 95% right is dangerous (safety-critical decisions, financial calculations)
• The task requires understanding of interpersonal dynamics, politics, or unspoken context
• You couldn't evaluate the output's quality even if you saw it (you don't know enough about the subject to judge)

<strong>The Verification Mindset</strong>

The most important habit to build: <em>never trust, always verify.</em> This doesn't mean AI output is bad — it means you approach it the same way a good editor approaches a first draft. You assume it's a starting point, not a final product.

Practical verification looks like:
• Fact-check any specific claims (dates, statistics, policy references, names)
• Read the output from the recipient's perspective — does it land correctly?
• Check for hallucinated details — things that sound specific but you didn't provide
• Confirm the tone matches the relationship and context
• Ensure nothing was lost from your original intent

<strong>How AI Changes Your Role</strong>

With AI tools, your professional role shifts. You move from being primarily a creator to being primarily an editor and curator. This isn't a demotion — it's a leverage upgrade. Instead of spending 80% of your time on production and 20% on judgment, you can spend 20% on production and 80% on judgment, strategy, and refinement.

The professionals who thrive with AI are the ones who already had good judgment about quality. AI amplifies your taste and standards — it doesn't replace them. If you can recognise good writing, you can produce more of it faster with AI. If you can't recognise good writing, AI won't fix that for you.

This means the skills that matter most in an AI-augmented workplace are: critical thinking, domain expertise, interpersonal judgment, and the ability to evaluate quality. These are the skills that justify your salary — AI just removes the busywork that used to consume most of your day.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The Delegation Test',
      content: `Before using AI for any task, ask yourself: "If I delegated this to a new hire who was smart but had zero context about my team, my company, or this specific situation — what would I need to tell them, and how carefully would I review their work?" That's exactly how you should approach AI: provide the same context, and apply the same level of review.`
    },
    {
      type: 'activity',
      activityId: 'tool-survey'
    },
    {
      type: 'content',
      title: 'AI Tool Categories Deep Dive',
      content: `The AI tool landscape is broad, but most tools fall into five practical categories. Understanding each category's strengths and limitations helps you choose the right tool without trial-and-error.

<strong>1. Text Generation</strong>
Tools: ChatGPT, Claude, Gemini, Copilot, Llama

<em>Workplace use cases:</em>
• Drafting professional communications (emails, proposals, reports, announcements)
• Summarizing documents, meetings, or research into actionable briefs
• Translating content between technical and non-technical audiences

<em>Best for:</em> First drafts, brainstorming, restructuring existing content, explaining complex topics simply, and any task where you need volume and can provide quality control.

<em>Not suitable for:</em> Tasks requiring access to your company's internal data (unless enterprise-deployed), legal or medical advice, calculations where precision matters, and anything where you can't verify the output.

<em>Free vs Paid:</em> Free tiers (ChatGPT Free, Claude Free, Gemini) give you access to capable but older models with usage limits and shorter context windows. Paid tiers ($20/month range) unlock the most capable models, longer conversations, file uploads, and features like web search and image generation. For professional use, the paid tier typically pays for itself within the first week in time savings.

<strong>2. Image Creation</strong>
Tools: DALL-E (via ChatGPT), Midjourney, Adobe Firefly, Stable Diffusion, Ideogram

<em>Workplace use cases:</em>
• Creating custom illustrations for presentations when stock photos won't cut it
• Generating mockups and concept visuals for early-stage project discussions
• Producing social media graphics and marketing assets for internal campaigns

<em>Best for:</em> Concept visualization, presentations, social content, brainstorming visual directions, and any situation where "good enough" imagery beats spending hours sourcing or commissioning assets.

<em>Not suitable for:</em> Final brand assets requiring pixel-perfect control, images of real people (ethical and legal concerns), anything requiring precise text in the image (AI still struggles with lettering), and situations where image provenance needs to be documented.

<em>Free vs Paid:</em> Most image generators offer limited free credits (5-25 generations). Paid tiers ($10-30/month) provide more generations, higher resolution, and commercial usage rights. Adobe Firefly is notable for being trained exclusively on licensed content, which reduces copyright concerns.

<strong>3. Code Assistance</strong>
Tools: GitHub Copilot, Cursor, Claude, ChatGPT, Amazon Q Developer, Cody

<em>Workplace use cases:</em>
• Writing automation scripts for repetitive file/data tasks (even for non-developers)
• Debugging error messages — paste the error and get an explanation plus fix
• Generating spreadsheet formulas, SQL queries, or simple macros

<em>Best for:</em> Accelerating development work, learning new languages or frameworks, automating tedious data tasks, and explaining unfamiliar code. Even non-developers benefit — describing what you need in plain English and getting working code is a superpower.

<em>Not suitable for:</em> Security-critical code without review, production deployments without testing, complex system architecture decisions, and any code that handles sensitive data without understanding its data flow.

<em>Free vs Paid:</em> ChatGPT/Claude free tiers can generate code effectively. GitHub Copilot ($10/month) integrates directly into your editor for real-time suggestions. Cursor ($20/month) provides a full AI-native development environment. For occasional code tasks, free tools work fine. For daily coding, integrated tools are transformative.

<strong>4. Data Analysis</strong>
Tools: ChatGPT Advanced Data Analysis, Julius AI, Tableau AI, Google Sheets AI, NotebookLM

<em>Workplace use cases:</em>
• Analyzing survey results or customer feedback to identify patterns and themes
• Creating charts and visualizations from raw data without learning visualization tools
• Exploring datasets conversationally — "What correlates with customer churn in this data?"

<em>Best for:</em> Initial data exploration, creating visualizations quickly, finding patterns in moderate-sized datasets, and making data accessible to non-analysts. Particularly powerful for professionals who have data but not the technical skills to analyse it traditionally.

<em>Not suitable for:</em> Sensitive or confidential data (unless enterprise-deployed), datasets requiring statistical rigour for publication, situations where you need to explain your methodology to auditors, and real-time data analysis.

<em>Free vs Paid:</em> Google Sheets AI features are included with Workspace. ChatGPT's Advanced Data Analysis requires the paid tier ($20/month) but is remarkably capable — it writes and executes Python code on your uploaded files. Julius AI offers a free tier for basic analysis.

<strong>5. Audio/Video</strong>
Tools: ElevenLabs, Descript, Runway, Otter.ai, Microsoft Teams Transcription, Suno

<em>Workplace use cases:</em>
• Transcribing meetings with speaker identification and action item extraction
• Creating voiceovers for training videos or presentations without booking a studio
• Editing video by editing text — Descript lets you cut video by deleting words from the transcript

<em>Best for:</em> Meeting documentation, training content creation, podcast production, and accessibility work (generating captions, transcripts, or audio versions of written content).

<em>Not suitable for:</em> Content where voice authenticity matters legally (contracts, testimony), creating deepfakes or impersonating real people, and situations where the synthetic nature of the content would undermine trust.

<em>Free vs Paid:</em> Otter.ai and Teams transcription are often included in enterprise subscriptions. ElevenLabs offers limited free voice generation. Descript has a free tier for basic editing. Professional-grade output typically requires $15-30/month.

<strong>Choosing the right category:</strong> When you have a task, ask: "What type of output do I need?" Text → Category 1. Visuals → Category 2. Code/automation → Category 3. Insights from data → Category 4. Audio or video → Category 5. Many real tasks combine categories — you might use text generation to plan a presentation, then image creation for visuals, then audio for a voiceover.`
    },
    {
      type: 'activity',
      activityId: 'use-case-brainstorm'
    },
    {
      type: 'activity',
      activityId: 'tool-map'
    },
    {
      type: 'content',
      title: 'Key Risks — with Workplace Scenarios',
      content: `Every AI tool carries risks you need to manage actively. These aren't theoretical — they're scenarios that happen in real workplaces every week. For each risk, you'll see what it looks like in practice, how to mitigate it, and how to explain it to colleagues who might not understand the concern.

<strong>Hallucination — AI Invents Convincing Fictions</strong>

<em>Workplace scenario:</em> A manager asks an AI to draft a response to an employee's question about their remaining annual leave balance. The AI generates a specific number — "You have 8 days remaining" — when it has no access to the HR system and no way to know the actual number. The manager sends it without checking. The employee books a holiday based on wrong information.

<em>Mitigation:</em> Never send AI-generated content containing specific facts, numbers, or policy references without verifying each one against an authoritative source.

<em>Explaining to your team:</em> "AI doesn't look things up — it generates what sounds probable. Any specific detail in AI output should be treated as a guess until verified."

<strong>Privacy & Data Exposure — Your Input Becomes Their Data</strong>

<em>Workplace scenario:</em> A team lead pastes a performance review into ChatGPT to "improve the wording." That review now contains an employee's name, performance ratings, salary details, and specific behavioural feedback — all sent to an external server. Depending on the tool's data retention policy, that content might be stored, used to train future models, or accessible to the tool's employees.

<em>Mitigation:</em> Before pasting anything into an AI tool, ask: "Would I be comfortable if this content appeared on a public website?" If not, anonymise it first or use an enterprise-deployed tool with appropriate data handling agreements.

<em>Explaining to your team:</em> "Treat the AI input box like a conversation in a crowded café — don't say anything you wouldn't want overheard. Consumer AI tools are not covered by our data protection agreements."

<strong>Bias — AI Reflects and Amplifies Societal Patterns</strong>

<em>Workplace scenario:</em> A recruiter uses AI to screen résumés and draft shortlists. The AI consistently ranks candidates with traditionally male names higher for technical roles and candidates with traditionally female names higher for support roles — because it learned from historical hiring data that reflected those biases. The recruiter doesn't notice because the output looks reasonable.

<em>Mitigation:</em> Be especially vigilant when AI output describes, evaluates, or makes recommendations about people. Look for patterns that correlate with gender, ethnicity, age, or other protected characteristics. When in doubt, remove identifying information and see if the recommendation changes.

<em>Explaining to your team:</em> "AI learned from human-generated data, which includes all of our historical biases. It's not neutral — it's a mirror of the internet's existing patterns, including discriminatory ones."

<strong>Copyright & Intellectual Property — Legal Grey Zones</strong>

<em>Workplace scenario:</em> A marketing team uses Midjourney to generate campaign imagery. One image looks strikingly similar to a well-known photographer's style — because the model was trained on that photographer's portfolio. The company publishes the image. The photographer's legal team sends a cease-and-desist letter. The legal status is unclear, but the reputational damage and legal costs are real.

<em>Mitigation:</em> For any AI-generated content that will be published, client-facing, or commercially used: check the tool's terms of service regarding output ownership, avoid generating content "in the style of" named creators, and consider tools trained on licensed content (like Adobe Firefly). Keep records of what was AI-generated.

<em>Explaining to your team:</em> "The law hasn't caught up with AI-generated content yet. Until it does, assume that AI-generated material carries copyright risk — especially images and anything that closely resembles existing work."

<strong>Over-Reliance — Skills Atrophy and Critical Thinking Decay</strong>

<em>Workplace scenario:</em> A consultant starts using AI for all client deliverables. Over six months, they stop developing original frameworks, stop reading industry research, and stop building the deep thinking that originally made them valuable. Their work becomes generic and interchangeable — because it's all AI-generated patterns. When a client asks a probing question, they can't answer without reaching for their AI tool.

<em>Mitigation:</em> Use AI to handle the mechanical parts of work, but continue investing in deep thinking, original analysis, and domain expertise. Regularly do work without AI to maintain your foundational skills. AI should expand your capacity, not replace your capability.

<em>Explaining to your team:</em> "AI is like a calculator — it makes computation faster, but you still need to understand maths. If you can't do the work without AI, you can't evaluate whether AI did it correctly."`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The 30-Second Rule',
      content: `Before sending anything AI-generated — an email, a report, a message, a document — spend 30 seconds asking yourself three questions:

<strong>1. Is every fact verifiable?</strong> Can I point to a source for each specific claim, number, date, or reference?

<strong>2. Is the tone appropriate?</strong> Would this land correctly with this specific person, in this specific context, given our relationship?

<strong>3. Would I put my name on this?</strong> If this was printed with my signature at the bottom, would I be comfortable defending every sentence?

If the answer to any of these is "no" or "I'm not sure," stop and fix it. Thirty seconds of review prevents hours of damage control. This one habit is the difference between using AI responsibly and using it recklessly.`
    },
    {
      type: 'content',
      title: 'Case Study — AI Done Right vs Wrong',
      content: `<strong>CASE STUDY A: AI Done Right</strong>
<em>Marketing Team — Social Media Content Production</em>

A five-person marketing team at a mid-sized tech company needed to produce 40 social media posts per week across three platforms. Previously, one person spent 2.5 days per week writing posts from scratch. They implemented an AI-assisted workflow:

<strong>Their process:</strong>
1. A team member feeds campaign briefs, key messages, and brand voice guidelines into Claude
2. The AI generates 8-10 draft posts per campaign theme
3. A human reviews each draft against their brand voice checklist
4. They fact-check any claims about product features or statistics
5. They adjust tone for platform-specific audiences (LinkedIn vs Twitter vs Instagram)
6. Final approval from the team lead before scheduling

<strong>The result:</strong> Content production time dropped from 2.5 days to 1 day per week. Quality remained consistent because every post went through human review. The team redirected saved time toward strategy and audience analysis — higher-value work that AI couldn't do. Three months in, engagement metrics were up 12% because the team had more time for thoughtful strategy rather than grinding through production.

<strong>Why it worked:</strong> They used AI for what it's good at (volume, structure, first drafts) and kept humans responsible for what matters (brand accuracy, fact-checking, audience understanding, final judgment).

---

<strong>CASE STUDY B: AI Done Wrong</strong>
<em>Sales Representative — Client Proposal</em>

A sales representative needed to send a competitive analysis to a prospective client. Under time pressure, they asked ChatGPT to generate a comparison between their product and three competitors. The AI produced a professional-looking table with feature comparisons, pricing tiers, and performance metrics. It looked thorough and convincing.

<strong>What went wrong:</strong>
1. The AI invented a competitor's pricing (stated $49/month when the actual price was $29/month)
2. It claimed their product had a feature that was actually on the roadmap but not yet released
3. It attributed a "97% uptime guarantee" to a competitor that actually offers 99.9%
4. The tone was subtly disparaging toward competitors in a way that violated the company's ethical sales guidelines

The sales rep sent it directly to the client without verification. The client's team included someone who had previously worked at one of the competitors. They immediately spotted the pricing error and the false feature claim. The client's response: "If your team can't be accurate about basic publicly available facts, how can we trust your technical claims about your own product?"

<strong>The damage:</strong> The deal was lost. More importantly, the client shared the experience with their professional network. The sales rep's manager had to issue a formal apology. Internal trust in AI tools dropped across the whole sales team.

<strong>Why it failed:</strong> The human was absent from the process at exactly the point where human judgment was essential. AI is fundamentally incapable of verifying current competitive information — it generates plausible-sounding data, not researched facts. A 3-minute verification check would have caught every error.

<strong>The lesson:</strong> AI makes you faster. It does not make you exempt from responsibility. The output carries your name, and "the AI wrote it" is not a professional defence.`
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'Critical Reminder',
      content: `AI generates confident text whether it's true or completely made up. The model has no built-in mechanism for self-doubt or fact-checking — it simply predicts the next most probable token. A hallucinated statistic looks identical to a real one. A fabricated policy reference reads exactly like a genuine one. The only safeguard is you.`
    },
    {
      type: 'activity',
      activityId: 'module1-quiz'
    },
    {
      type: 'activity',
      activityId: 'personal-ai-policy'
    },
    {
      type: 'activity',
      activityId: 'module1-feedback'
    }
  ],
  activities: [
    {
      id: 'tool-survey',
      title: 'Tool Survey',
      type: 'checklist',
      description: 'Explore the current AI tool landscape by reviewing tools across five categories. Check off the tools you have tried or are aware of. This isn\'t a test — it\'s a self-assessment to see where you currently stand.',
      categories: [
        {
          id: 'chat-generate',
          title: 'Chat & Generate',
          items: [
            { id: 'chatgpt', label: 'ChatGPT' },
            { id: 'claude', label: 'Claude' },
            { id: 'gemini', label: 'Gemini' },
            { id: 'copilot', label: 'Copilot' },
            { id: 'llama', label: 'Llama / Meta AI' }
          ]
        },
        {
          id: 'search-grounded',
          title: 'Search-grounded',
          items: [
            { id: 'perplexity', label: 'Perplexity' },
            { id: 'google-ai-overview', label: 'Google AI Overview' },
            { id: 'bing-chat', label: 'Bing Chat' },
            { id: 'you-com', label: 'You.com' }
          ]
        },
        {
          id: 'document-qa',
          title: 'Document Q&A',
          items: [
            { id: 'notebooklm', label: 'NotebookLM' },
            { id: 'chatpdf', label: 'ChatPDF' },
            { id: 'copilot-document', label: 'Copilot (document mode)' },
            { id: 'claude-files', label: 'Claude (file upload)' }
          ]
        },
        {
          id: 'capture-structure',
          title: 'Capture-to-structure',
          items: [
            { id: 'notion-ai', label: 'Notion AI' },
            { id: 'otter-ai', label: 'Otter.ai' },
            { id: 'teams-transcription', label: 'Microsoft Teams transcription' },
            { id: 'fireflies', label: 'Fireflies.ai' }
          ]
        },
        {
          id: 'creative-visual',
          title: 'Creative/Visual',
          items: [
            { id: 'dall-e', label: 'DALL-E' },
            { id: 'midjourney', label: 'Midjourney' },
            { id: 'canva-ai', label: 'Canva AI' },
            { id: 'suno', label: 'Suno' },
            { id: 'gamma', label: 'Gamma' },
            { id: 'adobe-firefly', label: 'Adobe Firefly' }
          ]
        }
      ],
      completionRule: 'all_checked'
    },
    {
      id: 'use-case-brainstorm',
      title: 'AI Use Case Brainstorm',
      type: 'structured_entries',
      description: 'Think about your actual work this week. Brainstorm 3 specific ways you could use AI tools in your role. Be concrete — not "use AI for emails" but "use Claude to draft the project status update I send every Friday." For each use case, think through what could go wrong and how you\'d catch it.',
      fields: [
        {
          id: 'repetitive-task',
          label: 'Describe a repetitive task you do weekly',
          type: 'textarea',
          maxLength: 300,
          minLength: 1,
          placeholder: 'E.g., "Every Monday I compile team updates from Slack into a summary email for my manager..."'
        },
        {
          id: 'tool-category',
          label: 'Which AI tool category would help?',
          type: 'textarea',
          maxLength: 200,
          minLength: 1,
          placeholder: 'E.g., "Text Generation — I\'d use Claude or ChatGPT to structure the raw notes into a coherent summary..."'
        },
        {
          id: 'prompt-idea',
          label: 'What would you prompt the AI to do?',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          placeholder: 'E.g., "Organize these team updates into a concise summary grouped by project, highlighting blockers and wins..."'
        },
        {
          id: 'risk-verification',
          label: 'What could go wrong? How would you verify?',
          type: 'textarea',
          maxLength: 300,
          minLength: 1,
          placeholder: 'E.g., "AI might misattribute who said what or invent a status I didn\'t provide. I\'d cross-check against the original Slack messages..."'
        }
      ],
      minEntries: 1,
      maxEntries: 5,
      completionRule: 'min_entries_filled'
    },
    {
      id: 'tool-map',
      title: 'Personal Tool Map',
      type: 'structured_entries',
      description: 'Document the AI tools you currently use or plan to try. For each tool, capture what you use it for, what it does well, where it falls short, and any data restrictions you need to respect. This becomes your personal reference guide.',
      fields: [
        { id: 'purpose', label: 'Tool Name & Purpose', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'E.g., "ChatGPT Plus — I use it for drafting client emails and brainstorming presentation structures..."' },
        { id: 'strengths', label: 'Strengths', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'E.g., "Fast, good at restructuring messy thoughts, handles long context well..."' },
        { id: 'weaknesses', label: 'Weaknesses / Limitations', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'E.g., "Sometimes too verbose, occasionally invents details, doesn\'t know my company\'s specific context..."' },
        { id: 'data-restrictions', label: 'Data Restrictions / Rules', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'E.g., "Never paste client names, financial data, or anything from our internal systems..."' }
      ],
      minEntries: 1,
      maxEntries: 20,
      completionRule: 'min_entries_filled'
    },
    {
      id: 'module1-quiz',
      title: 'Quick Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of the key concepts from this module. These questions focus on practical application, not memorization.',
      questions: [
        {
          id: 'q1',
          text: 'How does Generative AI produce its output?',
          options: [
            { id: 'a', text: 'It searches the internet in real-time for the best answer' },
            { id: 'b', text: 'It predicts the next token based on statistical patterns learned during training' },
            { id: 'c', text: 'It copies from a database of pre-written responses' },
            { id: 'd', text: 'It truly understands and reasons about the question before answering' }
          ],
          correctAnswer: 'b',
          explanation: 'GenAI predicts the next token based on statistical patterns learned during training. It doesn\'t search the web (unless specifically given that tool), doesn\'t copy from a database, and doesn\'t "understand" in the way humans do — it generates text one token at a time based on probability.'
        },
        {
          id: 'q2',
          text: 'You ask an AI to summarize your company\'s remote work policy and it generates specific details about "mandatory 3 days in office after 6 months." You never provided this information. What happened?',
          options: [
            { id: 'a', text: 'The AI searched your company\'s intranet and found the policy' },
            { id: 'b', text: 'The AI hallucinated — it generated plausible-sounding details it has no way to verify' },
            { id: 'c', text: 'The AI remembered the policy from a previous conversation' },
            { id: 'd', text: 'The AI used its training data to give you the correct answer' }
          ],
          correctAnswer: 'b',
          explanation: 'This is hallucination — the AI generated specific, confident-sounding details about your company that it has no access to and no way to verify. It pattern-matched from generic remote work policies in its training data and presented the output with the same confidence as if it were factual.'
        },
        {
          id: 'q3',
          text: 'You need custom illustrations for a presentation. Which AI tool category should you use?',
          options: [
            { id: 'a', text: 'Text Generation' },
            { id: 'b', text: 'Image Creation' },
            { id: 'c', text: 'Code Assistance' },
            { id: 'd', text: 'Data Analysis' }
          ],
          correctAnswer: 'b',
          explanation: 'Image Creation is the right category. Tools like Midjourney, DALL-E, and Adobe Firefly generate visual content from text descriptions. They\'re well-suited for presentation visuals, concept art, and custom illustrations.'
        },
        {
          id: 'q4',
          text: 'In the Human + AI Partnership Model, what is the human\'s primary role?',
          options: [
            { id: 'a', text: 'To type prompts and accept whatever the AI produces' },
            { id: 'b', text: 'To provide direction, judgment, and verification while AI handles production' },
            { id: 'c', text: 'To fix the AI\'s grammar and formatting errors' },
            { id: 'd', text: 'To train the AI model by correcting its outputs' }
          ],
          correctAnswer: 'b',
          explanation: 'The human\'s role is direction, judgment, and verification. AI handles the production-heavy work (drafting, structuring, generating options), while you provide the strategy, domain expertise, quality standards, and final approval. You\'re the editor and decision-maker; AI is the fast-but-fallible assistant.'
        },
        {
          id: 'q5',
          text: 'A colleague wants to paste a client\'s confidential financial data into ChatGPT to generate a report summary. What\'s the best advice?',
          options: [
            { id: 'a', text: 'Go ahead — ChatGPT is secure and won\'t share the data' },
            { id: 'b', text: 'It\'s fine as long as you delete the conversation afterward' },
            { id: 'c', text: 'Don\'t paste confidential data into consumer AI tools — anonymise it first or use an enterprise-approved tool with appropriate data agreements' },
            { id: 'd', text: 'Only paste it if the client gave verbal permission' }
          ],
          correctAnswer: 'c',
          explanation: 'Consumer AI tools may store inputs, use them for training, or lack appropriate data protection agreements. Confidential client data should never be pasted into consumer tools. Either anonymise the data first (remove names, account numbers, identifying details), use an enterprise-deployed version with proper data handling agreements, or do that part of the work manually.'
        }
      ]
    },
    {
      id: 'personal-ai-policy',
      title: 'Personal AI Policy',
      type: 'structured_entries',
      description: 'Before you leave this module, write your own rules for how you\'ll use AI at work. This isn\'t about what your company allows — it\'s about your personal standards. What guardrails will you set for yourself? Think of this as your professional code of conduct for AI usage.',
      fields: [
        {
          id: 'will-use-for',
          label: 'What types of work will you use AI for?',
          type: 'textarea',
          maxLength: 400,
          minLength: 1,
          placeholder: 'E.g., "First drafts of routine emails, brainstorming session prep, summarizing long documents, generating presentation outlines, explaining technical concepts to non-technical audiences..."'
        },
        {
          id: 'never-input',
          label: 'What will you NEVER put into an AI tool?',
          type: 'textarea',
          maxLength: 300,
          minLength: 1,
          placeholder: 'E.g., "Client financial data, employee performance details, proprietary product roadmaps, anything with personal identification numbers, internal strategy documents..."'
        },
        {
          id: 'verification-process',
          label: 'How will you verify AI output before using it?',
          type: 'textarea',
          maxLength: 300,
          minLength: 1,
          placeholder: 'E.g., "Fact-check all specific claims, read from the recipient\'s perspective, run the 30-second rule (facts, tone, name), never send without at least one full read-through..."'
        }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    },
    {
      id: 'module1-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Take a moment to reflect on what you learned and plan your next steps. This reflection helps solidify your learning and gives your facilitator valuable feedback.',
      fields: [
        { id: 'takeaway', label: 'What was your biggest takeaway from this module?', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'What surprised you, challenged your assumptions, or changed how you\'ll approach AI?' },
        { id: 'tool-to-try', label: 'Which AI tool will you try this week?', type: 'textarea', maxLength: 200, minLength: 1, placeholder: 'Name the specific tool and what you\'ll use it for...' },
        { id: 'questions', label: 'Any questions for the facilitator?', type: 'textarea', maxLength: 500, placeholder: 'Anything unclear, anything you want to explore deeper, or topics you\'d like covered in future sessions?' }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module1);

export default module1;
