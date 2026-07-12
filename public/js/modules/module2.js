/**
 * Module 2: Prompt Engineering and Professional Writing
 *
 * Activities:
 *   1. Prompt Warm-up — compare unconstrained vs structured prompt attempts
 *   2. Email Clinic — improve 3 pre-loaded communications with decisions log
 *   3. Template Builder — structured prompt template (role, goal, details, rules, QA)
 *   4. Peer Review Swap — Seven Cs feedback on another member's Email Clinic draft
 *   5. Writing Clinic Scenarios — select and complete exactly 2 of 5+ scenarios
 *   6. Prompt Library Starter — create reusable prompt templates
 *   7. Module Quiz — 5-question knowledge check
 *   8. Reflection & Feedback — structured reflection entries
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { registerModule } from '../core/module-registry.js';

const module2 = {
  id: 'module2',
  title: 'Prompt Engineering and Professional Writing',
  description: 'Master the art of communicating with AI tools to produce professional, accurate workplace writing.',
  sections: [
    {
      type: 'content',
      title: 'Welcome to Module 2',
      content: `Welcome to Module 2 — where you turn your understanding of how AI works into a practical skill that saves you hours every week. In Module 1, you learned that AI is a pattern-prediction engine. Now you'll learn to drive that engine with precision.

<strong>What you'll walk away with:</strong>

• Mastery of the CRAFT framework for prompt construction — a repeatable system for getting excellent output on the first or second try
• Understanding of why specific prompts produce better output — the statistical explanation that makes the "rules" of prompting feel intuitive rather than arbitrary
• Knowledge of the 4 failure patterns that cause AI writing disasters — and how to spot them before hitting send
• A library of reusable prompt templates for your daily workflow — not one-off prompts, but tools you'll reach for every week
• A verification habit that catches 90% of AI errors — in under 60 seconds per draft

This module is hands-on. You'll write prompts, revise real emails, build templates, and develop a prompt library you can use starting tomorrow. The exercises build on each other, so work through them in order.

Use the AI Chat (💬 button) anytime to test prompts, ask questions, or iterate on your work. That's not cheating — it's exactly how you'll use these skills in practice.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'How This Connects to Module 1',
      content: `In Module 1, you learned that AI is pattern prediction — a statistical engine that generates the most probable next token based on everything that came before it. Module 2 teaches you to exploit that knowledge. Every technique here — CRAFT framework, constraints, progressive prompting — is about structuring your input to channel the prediction engine precisely where you want it to go. You're not "asking" AI for help. You're engineering the input pattern to produce a specific output pattern. That mental shift changes everything.`
    },
    {
      type: 'content',
      title: 'How LLMs Generate Text',
      content: `Before you can write effective prompts, it helps to understand what's happening under the hood when you type a message into ChatGPT or Claude. You don't need a computer science degree — just a mental model of the five-step pipeline that turns your words into a response.

<strong>1. Tokenization</strong>
The model doesn't read words the way you do. It breaks your input into tokens — fragments that might be whole words, parts of words, or even individual characters. The word "unbelievable" might become ["un", "believ", "able"]. Common words like "the" are a single token; rare or technical terms get split into smaller pieces. Why does this matter? Because the model processes patterns at the token level. A clearly worded prompt produces cleaner token sequences, which means the model has stronger patterns to work with.

<strong>2. Embeddings</strong>
Each token gets converted into a vector — a long list of numbers that represents its meaning and relationships. Think of it as coordinates in a vast semantic space. In this space, "doctor" and "physician" end up close together. "Bank" (the financial institution) and "bank" (of a river) end up in different regions based on surrounding context.

<strong>3. The Transformer (Attention)</strong>
This is the architecture that made modern AI possible. The transformer looks at all tokens simultaneously and decides which ones should pay attention to which other ones. When you write "The manager who joined last Tuesday said the project deadline is Friday," the transformer connects "said" back to "manager" (not "Tuesday" or "project") to understand who is speaking. This is why sentence structure in your prompt directly affects output quality.

<strong>4. Next-Token Prediction</strong>
After processing your input through layers of attention, the model produces a probability distribution over its entire vocabulary for the next token. After "The capital of France is" the token "Paris" has ~97% probability. It picks one, adds it to the sequence, and repeats. Your entire response is generated one token at a time.

<strong>5. Temperature</strong>
Temperature controls how adventurous the model is when picking from probabilities. Low temperature (0.0–0.3) = predictable, consistent output. High temperature (0.7–1.0+) = creative, surprising, occasionally nonsensical output. For professional writing: lower temperature. For brainstorming: higher temperature.

<strong>The key insight:</strong> You're not talking to a thinking entity. You're providing tokens that set the prediction context. The clearer and more structured your input, the stronger the statistical pattern the model has to work with — and the better its output will be.`
    },
    {
      type: 'content',
      title: 'What This Means for Your Prompts',
      content: `Now that you understand the pipeline, let's translate it into practical prompting principles. Every technical detail above has a direct implication for how you write prompts.

<strong>Token Patterns → Use Specific Language</strong>
Since the model works at the token level, precise words activate stronger patterns than vague ones. "Write a professional email" activates broad, generic patterns. "Write a 120-word email declining a meeting invitation while suggesting an alternative time, in a warm collegial tone" activates very specific patterns — the model has seen thousands of examples that match this precise description, and it can draw on them directly.

<strong>Attention Mechanism → Structure Matters</strong>
The transformer's attention mechanism means the model weighs some parts of your prompt more heavily than others. Information at the beginning and end of your prompt typically gets more attention than information buried in the middle. Put your most important instructions — the role, the key constraint, the format requirement — where they'll get the most attention: at the start and the end.

<strong>Probability Distribution → Constraints Narrow the Field</strong>
Without constraints, the model chooses from a wide probability distribution — many possible "good enough" continuations. Each constraint you add narrows that distribution. "Write an email" has millions of possible outputs. "Write a 3-paragraph email, under 150 words, using the recipient's first name, ending with a clear call to action" has far fewer — and they're almost all good.

<strong>Context Window Economics</strong>
Every model has a context window — a maximum number of tokens it can process at once (your prompt + its response). This is a finite resource. Here's how to pack maximum useful information into limited space:

• <strong>Front-load critical context.</strong> Don't bury the most important information in paragraph 4. Lead with it.
• <strong>Cut filler words.</strong> "I was wondering if you could possibly help me with" → "Help me with." Every unnecessary token is a wasted slot.
• <strong>Use structured formats.</strong> Bullet points and labeled sections are more token-efficient than rambling prose — and they give the model clearer patterns to work with.
• <strong>Provide examples over explanations.</strong> Showing the model what you want (a 2-line example of the desired output format) is often more token-efficient than explaining it in a paragraph.
• <strong>Know when to summarize vs. include full text.</strong> If you're revising a 2000-word document, paste the full text. If you're asking about a theme across 10 documents, summarize each in one line and let the model work from summaries.

The goal isn't to write the shortest possible prompt — it's to ensure every token in your prompt is earning its place by giving the model useful signal.`
    },
    {
      type: 'content',
      title: 'The 7 Cs of Professional Communication',
      content: `Before we talk about AI-assisted writing, we need a framework for evaluating what "good" professional writing looks like. The 7 Cs of Communication have been taught in business schools for decades, and they're more relevant now than ever — because they give you a concrete checklist for approving or rejecting AI-generated drafts.

<strong>1. Clear</strong> — The reader understands your meaning on the first read. No ambiguity, no jargon without explanation, no convoluted sentence structures. If someone has to read your email twice to understand what you're asking, it isn't clear.

<strong>2. Concise</strong> — Every word earns its place. No filler phrases ("I just wanted to reach out to let you know..."), no redundancy, no padding. Shorter is not always better, but unnecessary length always makes communication worse.

<strong>3. Concrete</strong> — Specific details replace vague generalities. Not "soon" but "by Thursday at 3pm." Not "we need to improve performance" but "page load time needs to drop from 4.2s to under 2s."

<strong>4. Correct</strong> — Facts are accurate. Names are spelled right. Numbers add up. Policy references are current. Grammar and punctuation follow professional standards.

<strong>5. Coherent</strong> — Ideas flow logically from one to the next. The reader can follow your reasoning without mental gymnastics. Paragraphs connect. The overall structure makes sense.

<strong>6. Complete</strong> — The reader has everything they need to act. No missing dates, no undefined acronyms, no assumptions about what the reader already knows. If they have to write back asking "but when?" or "who specifically?" — it wasn't complete.

<strong>7. Courteous</strong> — The tone respects the reader. Professional doesn't mean cold. Directness doesn't mean rudeness. The message considers the reader's perspective and treats them with respect.

<strong>Where AI excels:</strong> Clarity (restructuring confusing sentences), Conciseness (cutting filler), Concreteness (suggesting specific language), and Courteousness (adjusting tone). AI is genuinely good at these because they're pattern-matching tasks.

<strong>Where humans must verify:</strong> Correctness (AI invents facts), Completeness (AI doesn't know what you haven't told it), and Context-appropriateness (AI doesn't understand your office culture, your relationship with the recipient, or the political dynamics at play).

<strong>Your approval checklist:</strong> Before sending any AI-assisted communication, run it through the 7 Cs. If it passes all seven, send it. If it fails on any C, revise it. This takes 30 seconds and prevents the most common AI writing failures.`
    },
    {
      type: 'content',
      title: 'The CRAFT Framework',
      content: `Most people write prompts the way they'd text a friend: vague, context-free, and hoping the AI will figure out what they mean. The CRAFT framework gives you a repeatable structure that produces professional-quality output consistently. Each letter represents a component that channels the model's prediction engine in a specific direction.

<strong>C — Context</strong>
Background, situation, and constraints. What's happening? Who's involved? What came before this moment? What are the boundaries?

The model knows nothing about your situation unless you tell it. Context eliminates guessing — and guessing is where AI goes wrong. Include: who you are, who the audience is, what's already happened, what's at stake, and any constraints (word count, deadline, sensitivity level).

<strong>R — Role</strong>
Who the AI should be. Setting a role isn't a gimmick — it activates a specific set of patterns in the model's training data. "You are a senior HR business partner at a mid-size tech company" produces fundamentally different output than "You are a casual copywriter." The role sets voice, vocabulary, formality level, and the type of expertise the model draws on.

<strong>A — Action</strong>
What to do, with explicit boundaries. Be specific about the task AND what not to do. "Write an email" is weak. "Write a 150-word email declining this meeting invitation while offering an alternative time" is strong. "Do not make promises about future availability" is an essential boundary. Action without boundaries invites drift.

<strong>F — Format</strong>
Output structure and length. Do you want bullet points or prose? A subject line followed by body text? Three options to choose from? A table? Specify paragraph count, word count, or structural elements. If you don't specify format, the model picks whatever seems most common — which may not be what you need.

<strong>T — Tone</strong>
Voice, formality, and energy level. "Warm but professional" is different from "direct and urgent" is different from "empathetic and supportive." Tone is the element most people forget — and it's often the difference between output that sounds like you and output that sounds like a corporate chatbot.

<strong>CRAFT in Action — A Real Example:</strong>

Let's say you need to draft a weekly project update email to your manager. Here's the CRAFT breakdown:

<em>Context:</em> "I'm a product manager on the payments team. We're 3 weeks into a 6-week sprint to launch a new checkout flow. This week we hit a blocker with the third-party payment provider's API being 2 days late on their integration timeline. My manager prefers concise updates with clear risk flags."

<em>Role:</em> "You are a clear, structured communicator who writes executive-friendly updates."

<em>Action:</em> "Write my weekly project update email. Summarize progress, flag the API delay as a risk with potential impact on timeline, and propose a mitigation plan. Do not invent any details about the project beyond what I've provided. Do not downplay the risk or use hedge language that obscures the delay."

<em>Format:</em> "Subject line + 3 short paragraphs: (1) Progress summary, (2) Risk flag with specifics, (3) Proposed next steps. Total under 200 words."

<em>Tone:</em> "Confident and factual. Not alarmist, not dismissive. The tone of someone who has the situation under control but wants leadership to be informed."

This prompt will produce a dramatically better output than "Write a project update email about a delay." Every CRAFT component narrows the model's probability distribution toward exactly what you need.`
    },
    {
      type: 'activity',
      activityId: 'prompt-warmup'
    },
    {
      type: 'content',
      title: 'Constraint-Based Prompting',
      content: `Here's a pattern that separates casual AI users from effective ones: explicit constraints. Without boundaries, LLMs drift. They add information you didn't ask for. They shift tone mid-paragraph. They invent details to fill gaps. Constraints are how you keep the output on target.

<strong>Why constraints matter</strong>
LLMs are completion engines — they want to keep generating. If you ask for a "professional email," the model's idea of "professional" might be a 400-word, overly formal, jargon-heavy message when what you needed was a crisp 80-word note. Without constraints, the model defaults to whatever pattern it's seen most often in its training data, which may not match your specific needs.

Content drift is the most common failure mode. You ask for a response to a client complaint, and the AI starts making promises about future improvements that your company hasn't agreed to. You ask for a meeting summary, and it adds "next steps" that nobody actually discussed. Constraints prevent drift.

<strong>Three things to specify in every prompt:</strong>

<strong>1. What to change</strong> — Be explicit about what you want the AI to actually do. "Make this more concise" is better than "improve this." "Rewrite the opening to be more direct" is better than "fix the tone."

<strong>2. What to keep</strong> — Tell the AI what must remain unchanged. "Keep the original deadline of March 15th." "Preserve the three bullet points about project scope." "Don't change the greeting or sign-off." Without this, the model may "improve" things you needed left alone.

<strong>3. What to avoid</strong> — Name the failure modes you want to prevent. "Do not add any new commitments or promises." "Avoid using jargon the client wouldn't understand." "Do not make the tone more casual than the original."

<strong>The anchor guardrail</strong>
There is one constraint so universally useful it should be part of your default prompting practice:

<em>"Do not invent policies, reasons, or details that I have not provided."</em>

This single sentence dramatically reduces the most dangerous AI writing failure: confident fabrication. Without this guardrail, an AI might tell a client "per our refund policy" when you never mentioned a refund policy, or explain to an employee "as discussed in last week's meeting" about a meeting that never happened.

<strong>Example with constraints:</strong>
<em>"Rewrite this email to decline the vendor's proposal. Keep the opening acknowledgment of their work. Change the middle section to clearly state we're going in a different direction. Avoid giving specific reasons for the decision (legal has asked us not to). Do not promise future opportunities that haven't been approved. Maximum 120 words."</em>

Notice how each constraint addresses a specific way the AI might go wrong: giving too much detail, making unauthorized promises, being too long. This is defensive prompting — and it's how professionals get reliable output from AI tools.`
    },
    {
      type: 'content',
      title: 'Progressive Prompting — The Art of Iteration',
      content: `Here's what separates skilled prompt engineers from everyone else: they don't expect perfection on the first try. Most people write one prompt, accept whatever comes back (or give up), and miss the enormous value that comes from iterating.

Progressive prompting is a 3-step workflow where each prompt builds on the last. Think of it like sculpting — rough shape first, then refine, then polish.

<strong>Step 1: Get the Structure Right</strong>
Your first prompt focuses on getting the bones of the output correct — the right sections, the right information, the right logical flow. Don't worry about tone or word choice yet. Just get the architecture.

<em>First prompt:</em> "Write a project update email covering: (1) what we accomplished this week, (2) the API integration blocker, (3) proposed mitigation. Here's the raw info: [paste bullet points]."

<strong>Step 2: Refine Tone and Specifics</strong>
Now take that output and refine it. Adjust tone, fix specifics, tighten language.

<em>Second prompt:</em> "Good structure. Now refine: make the tone more confident and less apologetic. The blocker paragraph should be factual, not defensive — we're flagging a risk, not making excuses. Replace 'we hope to resolve' with specific next steps. Keep it under 180 words."

<strong>Step 3: Polish and Verify</strong>
Final pass — catch errors, verify accuracy, ensure it sounds like you.

<em>Third prompt:</em> "Final pass: Check this draft for (1) any details I didn't provide that you may have assumed, (2) any language that sounds more formal than my usual style, (3) any commitments or promises I didn't authorize. Flag anything uncertain."

<strong>Why This Works Better Than One Perfect Prompt</strong>

• <strong>Lower cognitive load.</strong> You don't need to think of everything upfront. Focus on one dimension at a time.
• <strong>Better output quality.</strong> Each iteration narrows the probability space further. The model has more context with each step.
• <strong>Faster than starting over.</strong> Refining a 70%-good draft takes one prompt. Getting to 95% from scratch takes three failed attempts.
• <strong>Catches errors early.</strong> Step 3's self-critique prompt catches hallucinations that a single-pass approach would miss entirely.

<strong>A Complete Example — Client Proposal Email:</strong>

<em>Step 1:</em> "Draft an email to a potential client (marketing director at a retail company) proposing our analytics consulting services. Include: our team's experience with retail data, the 3-month timeline, the deliverables (dashboard, monthly reports, recommendations deck). Don't invent specifics I haven't given you."

<em>Step 2:</em> "Better. Now: shorten paragraph 2 to 2 sentences max. Make the opening more personalized — reference their recent expansion to e-commerce (I saw it in their press release last week). The closing should have a specific call to action: suggest a 30-minute call next Tuesday or Wednesday."

<em>Step 3:</em> "Review this final draft: flag any claims about our capabilities I didn't explicitly state, any promises about deliverable timelines that go beyond '3 months,' and any tone that feels salesy rather than consultative."

Three prompts. Two minutes total. Output you'd be confident sending to a real client.`
    },
    {
      type: 'callout',
      variant: 'info',
      title: 'Approaching AI-Assisted Revision',
      content: `The Email Clinic below gives you 3 workplace communications to improve. Before you jump in, understand the difference between effective and ineffective AI revision.

<strong>Ineffective approach:</strong> Pasting the email and saying "rewrite this to be more professional." This gives the AI no direction — it'll produce generic corporate-speak that could have been written by anyone about anything.

<strong>Effective approach:</strong> A structured revision prompt that specifies what's wrong, what to keep, and what the improved version should achieve.

<strong>Model revision prompt you can copy and adapt:</strong>

<em>"Revise this workplace email. The core problem with the current version is [specific issue: too blunt / too vague / missing context / wrong tone for the audience]. Keep [specific elements to preserve]. The improved version should be [target characteristics: concise, warm, specific about next steps, under X words]. The recipient is [relationship context]. Do not add information I haven't provided."</em>

Use this pattern for each email below. The decisions log is where you document what the AI changed and whether you agreed with each change — this builds your editorial judgment for AI-assisted writing.`
    },
    {
      type: 'activity',
      activityId: 'email-clinic'
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'The Most Dangerous Failure Pattern: Invented Details',
      content: `Of the four AI writing failure patterns, <strong>Invented Details</strong> causes the most real-world damage. The others (wrong assumptions, tone mismatches, over-polishing) are embarrassing but recoverable. Invented details can create legal exposure, damage client relationships, and erode your credibility in ways that are hard to undo.

<strong>Why it's so dangerous:</strong> The AI adds specific-sounding details — dates, policy references, statistics, historical context — with the same confident tone as verified information. "As per our company's 90-day review policy..." (you never mentioned such a policy). "Research shows that 73% of employees prefer..." (that statistic doesn't exist). These fabrications sound authoritative and easily slip past a quick review.

<strong>Your defense:</strong> Every time you review an AI draft, ask one question: "Can I verify every specific claim in this text?" If the answer is no — if there's a date you didn't provide, a policy you didn't reference, a statistic you didn't supply — the AI invented it. Delete it or replace it with verified information. No exceptions.`
    },
    {
      type: 'content',
      title: 'The Writing Verification Checklist',
      content: `Every piece of AI-assisted writing needs a final human review before it goes out. This isn't optional — it's the step that prevents failure patterns from reaching your colleagues, clients, or leadership. Here's a five-point verification checklist that takes 60 seconds and catches 90% of AI writing errors.

<strong>1. Verify Names and Details</strong>
Check every proper noun in the draft. Is the person's name spelled correctly? Is the company name right? Is the project name accurate? AI models frequently get names slightly wrong, especially for less common names. If the AI wrote "Hi Sarah" and the person's name is Sara — that's a credibility-destroying error that takes two seconds to catch.

<strong>2. Audit Dates and Math</strong>
If the draft contains any dates, deadlines, durations, percentages, or calculations — verify every single one. "The project started three weeks ago" — did it? "This represents a 15% improvement" — does the math check out? AI models are notoriously unreliable with numerical reasoning.

<strong>3. Review Corporate Policy</strong>
If the draft references any company policy, procedure, benefit, or commitment, verify it against the actual source. "Per our flexible working policy" — does that policy say what the AI implies? This is where Invented Details causes the most damage — false policy references in official communications can create legal exposure.

<strong>4. Check Cultural Fit</strong>
Does this sound like something that would actually be sent in your organization? Every workplace has unwritten rules about communication style. Read the draft and ask: would this feel natural coming from me, to this specific person, in this specific context?

<strong>5. The Self-Critique QA Prompt</strong>
After the AI generates your draft, use a follow-up prompt to have the AI critique its own work:

<em>"Review the email above for: (1) any details I didn't explicitly provide that you may have assumed or invented, (2) tone mismatches for a [describe your workplace relationship], (3) commitments or promises that go beyond what I specified. Flag anything uncertain."</em>

This technique catches a surprising number of issues. The model can identify its own hallucinations when explicitly prompted to look for them. It's not foolproof, but it's a valuable second pass before your own human review.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The Self-Critique QA Prompt Technique',
      content: `One of the most underrated prompt engineering techniques is asking the AI to critique its own output. After generating any draft, paste it back and ask: "What might be wrong with this? What did you assume? What should I verify?" The model can often identify its own weaknesses when explicitly asked to look for them. This isn't a replacement for human review — but it's a powerful 15-second addition to your workflow that catches errors you might miss on a quick scan. Build this into your habit: generate → self-critique → human verify → send.`
    },
    {
      type: 'activity',
      activityId: 'template-builder'
    },
    {
      type: 'content',
      title: 'Building Your Prompt Library',
      content: `Here's the productivity secret that most AI users miss: the real value isn't in any single prompt — it's in building a library of proven prompts that you reuse and refine over time.

Think about it. You probably do 5-10 recurring communication tasks every week: status updates, meeting follow-ups, feedback emails, client responses, internal announcements. Each time, you either write from scratch or dig through your sent folder for something to copy. A prompt library eliminates that friction entirely.

<strong>Why Templates Beat One-Off Prompts</strong>

• <strong>Consistency:</strong> A proven template produces reliable quality every time. No more "sometimes the AI nails it, sometimes it misses completely."
• <strong>Speed:</strong> Fill in 3-4 variables and you have a complete prompt in 30 seconds instead of 3 minutes.
• <strong>Improvement over time:</strong> Each time you use a template, you notice what works and what doesn't. Small refinements compound into a prompt that's been optimized through dozens of real-world uses.
• <strong>Shareability:</strong> Good templates can be shared with your team. "Here's the prompt I use for client status updates" — instant team capability boost.

<strong>How to Parameterize a Prompt</strong>

A parameterized prompt uses [BRACKET VARIABLES] for the parts that change each time. Everything else stays fixed. Think of it as a form where you fill in the blanks.

Template structure:
<em>"You are a [ROLE]. I need you to [ACTION] based on the following: [RAW INPUT]. Format as [FORMAT]. Tone should be [TONE]. Constraints: [CONSTRAINTS]."</em>

<strong>Example Template 1: Meeting Minutes → Action Items</strong>
<em>"You are a project coordinator. Convert these raw meeting notes into a structured action items list. Notes: [PASTE MEETING NOTES]. Format: numbered list with (1) action item, (2) owner, (3) deadline. Only include items that are explicitly mentioned as next steps or commitments. Do not infer action items that weren't directly discussed. Flag any item where the owner or deadline is unclear."</em>

<strong>Example Template 2: Feedback Email (Positive or Constructive)</strong>
<em>"You are a thoughtful team lead. Write a [POSITIVE/CONSTRUCTIVE] feedback email to [RECIPIENT NAME], who is a [THEIR ROLE/RELATIONSHIP]. The feedback is about: [SPECIFIC BEHAVIOR OR WORK]. Context: [WHAT PROMPTED THIS]. The email should be [WORD COUNT] words, [TONE DESCRIPTOR]. If constructive: be direct about what needs to change while acknowledging what's working. Do not soften the feedback to the point where the core message is lost. Do not invent examples I haven't provided."</em>

<strong>Example Template 3: Status Update from Bullet Points</strong>
<em>"Convert these raw bullet points into a polished [WEEKLY/MONTHLY] status update for [AUDIENCE: my manager / the leadership team / the full team]. Bullet points: [PASTE BULLETS]. Format: 3 sections — Progress, Risks/Blockers, Next Week's Priorities. Total under [WORD COUNT] words. Tone: [confident and factual / casual and brief / formal and comprehensive]. Do not add accomplishments, risks, or plans that aren't reflected in my bullet points."</em>

<strong>Starting Your Library</strong>

You don't need 50 templates on day one. Start with 2-3 templates for tasks you do every single week. Use them. Refine them. Add one new template per week. Within a month, you'll have a library that saves you meaningful time and produces consistently better output than ad-hoc prompting.

The next activity asks you to create your first templates. Think about what you'll actually use this week.`
    },
    {
      type: 'activity',
      activityId: 'prompt-library-starter'
    },
    {
      type: 'activity',
      activityId: 'peer-review-swap'
    },
    {
      type: 'activity',
      activityId: 'writing-clinic-scenarios'
    },
    {
      type: 'activity',
      activityId: 'module2-quiz'
    },
    {
      type: 'activity',
      activityId: 'module2-feedback'
    }
  ],
  activities: [
    {
      id: 'prompt-warmup',
      title: 'Prompt Warm-up',
      type: 'form',
      description: 'Write two versions of a prompt for the same task: first an unconstrained attempt (however you would naturally ask), then a structured attempt using the CRAFT framework. Compare the results in the notes section.',
      fields: [
        {
          id: 'unconstrained-prompt',
          label: 'Unconstrained Prompt Attempt',
          type: 'textarea',
          maxLength: 2000,
          minLength: 1,
          placeholder: 'Write your prompt however you would naturally ask an AI tool...'
        },
        {
          id: 'structured-prompt',
          label: 'Structured Prompt Attempt (Using CRAFT)',
          type: 'textarea',
          maxLength: 2000,
          minLength: 1,
          placeholder: 'Now write a structured version using the CRAFT framework (Context, Role, Action, Format, Tone)...'
        },
        {
          id: 'comparison-notes',
          label: 'Comparison Notes',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          placeholder: 'What differences did you notice in the AI output between the two approaches?'
        }
      ],
      completionRule: 'all_fields_filled'
    },
    {
      id: 'email-clinic',
      title: 'Email Clinic',
      type: 'preloaded_revision',
      description: 'Review 3 pre-loaded workplace communications. For each, use a structured revision prompt (not just "rewrite this") to improve it with AI assistance. Document your decisions about which AI suggestions you accepted or rejected.',
      preloadedItems: [
        {
          id: 'blunt-request',
          title: 'Internal Request to a Colleague',
          content: 'Hey, I need the sales report by end of day. You were supposed to have it done already. Send it over ASAP.'
        },
        {
          id: 'time-off-request',
          title: 'Time-off Request to a Manager',
          content: 'I want to take next Friday off. I have stuff to do. Let me know if that works or whatever.'
        },
        {
          id: 'complaint-response',
          title: 'Response to a Complaint',
          content: 'We got your complaint. Not sure what you expected us to do about it. The policy is the policy. You can try again next month I guess.'
        }
      ],
      fieldsPerItem: [
        {
          id: 'improved-version',
          label: 'Improved Version',
          type: 'textarea',
          maxLength: 2000,
          minLength: 1,
          placeholder: 'Rewrite this communication using AI assistance. Use a structured revision prompt — specify what to change, what to keep, and what to avoid...'
        },
        {
          id: 'decisions-log',
          label: 'Decisions Log',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          placeholder: 'Document which AI suggestions you accepted or rejected, and why. What did the AI get right? What did you override?'
        }
      ],
      completionRule: 'all_items_filled'
    },
    {
      id: 'template-builder',
      title: 'Template Builder',
      type: 'form',
      description: 'Build a reusable prompt template using the CRAFT framework. Define each component: context, role, action, format, tone — plus a QA verification prompt to check the output.',
      fields: [
        {
          id: 'role',
          label: 'Role',
          type: 'textarea',
          maxLength: 200,
          minLength: 1,
          placeholder: 'Define the role or persona the AI should adopt (e.g., "You are a senior HR advisor...")'
        },
        {
          id: 'goal',
          label: 'Goal',
          type: 'textarea',
          maxLength: 200,
          minLength: 1,
          placeholder: 'State the specific outcome you want from the AI...'
        },
        {
          id: 'specific-details',
          label: 'Specific Details',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          placeholder: 'Provide context, background information, and specific requirements...'
        },
        {
          id: 'rules-constraints',
          label: 'Rules and Constraints',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          placeholder: 'List any rules, limitations, tone requirements, or things to avoid...'
        },
        {
          id: 'qa-prompt',
          label: 'QA Prompt',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          placeholder: 'Write a follow-up prompt to verify the output quality (e.g., "Check this draft against...")'
        }
      ],
      completionRule: 'all_fields_filled'
    },
    {
      id: 'prompt-library-starter',
      title: 'Prompt Library Starter',
      type: 'structured_entries',
      description: 'Create your first 2 reusable prompt templates. These are prompts you\'ll use repeatedly — not one-off requests. Think about tasks you do every week that follow a similar pattern.',
      fields: [
        { id: 'template-name', label: 'Template Name', type: 'textarea', maxLength: 100, minLength: 1, placeholder: 'E.g., "Weekly Status Update Generator" or "Client Email Tone Polisher"...' },
        { id: 'when-to-use', label: 'When to Use This Template', type: 'textarea', maxLength: 200, minLength: 1, placeholder: 'E.g., "Every Friday when I need to compile my team\'s updates into a manager-friendly summary..."' },
        { id: 'full-template', label: 'Full Prompt Template (mark variables with [BRACKETS])', type: 'textarea', maxLength: 1000, minLength: 1, placeholder: 'E.g., "You are a [ROLE]. I need you to [ACTION] based on the following information: [RAW INPUT]. Format as [FORMAT]. Tone should be [TONE]. Do not [CONSTRAINTS]."' },
        { id: 'verification-checklist', label: 'Output Verification Checklist', type: 'textarea', maxLength: 300, minLength: 1, placeholder: 'E.g., "Check: all dates accurate, no invented metrics, tone matches recipient relationship, under 200 words..."' }
      ],
      minEntries: 1,
      maxEntries: 5,
      completionRule: 'min_entries_filled'
    },
    {
      id: 'peer-review-swap',
      title: 'Peer Review Swap',
      type: 'peer_review',
      description: 'View another group member\'s Email Clinic draft and provide structured feedback using the Seven Cs Framework. Rate each criterion from 1 (needs significant work) to 5 (excellent) and add a specific comment.',
      sourceActivity: 'email-clinic',
      criteria: [
        {
          id: 'clear',
          label: 'Clear',
          description: 'The message is easy to understand with no ambiguity',
          ratingMin: 1,
          ratingMax: 5,
          commentMaxLength: 500
        },
        {
          id: 'concise',
          label: 'Concise',
          description: 'The message uses no unnecessary words or filler',
          ratingMin: 1,
          ratingMax: 5,
          commentMaxLength: 500
        },
        {
          id: 'concrete',
          label: 'Concrete',
          description: 'The message includes specific details rather than vague statements',
          ratingMin: 1,
          ratingMax: 5,
          commentMaxLength: 500
        },
        {
          id: 'correct',
          label: 'Correct',
          description: 'The message is free from grammatical, factual, and technical errors',
          ratingMin: 1,
          ratingMax: 5,
          commentMaxLength: 500
        },
        {
          id: 'coherent',
          label: 'Coherent',
          description: 'The message flows logically and all points connect',
          ratingMin: 1,
          ratingMax: 5,
          commentMaxLength: 500
        },
        {
          id: 'complete',
          label: 'Complete',
          description: 'The message includes all necessary information for the reader to act',
          ratingMin: 1,
          ratingMax: 5,
          commentMaxLength: 500
        },
        {
          id: 'courteous',
          label: 'Courteous',
          description: 'The message maintains a respectful and professional tone',
          ratingMin: 1,
          ratingMax: 5,
          commentMaxLength: 500
        }
      ],
      completionRule: 'all_criteria_rated'
    },
    {
      id: 'writing-clinic-scenarios',
      title: 'Writing Clinic Scenarios',
      type: 'scenario_selection',
      description: 'Choose exactly 2 scenarios from the list below. For each selected scenario, use AI to draft a response and refine it using progressive prompting until you are satisfied with the result.',
      scenarios: [
        {
          id: 'diplomatic-feedback',
          title: 'Diplomatic Feedback',
          description: 'Write constructive feedback to a colleague whose work did not meet expectations, maintaining the relationship while being honest about required improvements.'
        },
        {
          id: 'angry-client-response',
          title: 'Angry Client Response',
          description: 'Respond to an angry client who has escalated a complaint via email. Acknowledge their frustration, take ownership, and propose a resolution.'
        },
        {
          id: 'team-announcements',
          title: 'Team Announcements',
          description: 'Draft an announcement to your team about an upcoming organisational change that may cause concern. Balance transparency with reassurance.'
        },
        {
          id: 'repurposing-content',
          title: 'Repurposing Content',
          description: 'Take a dense internal report summary and repurpose it into a brief, engaging update suitable for a company-wide newsletter audience.'
        },
        {
          id: 'job-application',
          title: 'Job Application / Cover Letter',
          description: 'Write a tailored cover letter for a role you are interested in, using AI to match the language of the job description while keeping an authentic voice.'
        }
      ],
      responseFields: [
        {
          id: 'scenario-response',
          label: 'Your Draft Response',
          type: 'textarea',
          maxLength: 2000,
          minLength: 1,
          placeholder: 'Write your AI-assisted response for this scenario. Try using progressive prompting — structure first, then refine tone, then verify...'
        }
      ],
      completionRule: 'select_exactly',
      selectCount: 2
    },
    {
      id: 'module2-quiz',
      title: 'Quick Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of prompt engineering concepts covered in this module.',
      questions: [
        {
          id: 'q1',
          text: 'Why does a clear, specific prompt produce better AI output?',
          options: [
            { id: 'a', text: 'The AI tries harder when you write more' },
            { id: 'b', text: 'It gives the model stronger patterns to predict from' },
            { id: 'c', text: 'Clear prompts bypass the AI safety filters' },
            { id: 'd', text: 'The AI searches a database more accurately' }
          ],
          correctAnswer: 'b',
          explanation: 'Clear prompts provide stronger token patterns for the model to work with. Since LLMs predict the next token based on statistical patterns, well-structured input creates a more constrained prediction space — leading to more relevant output.'
        },
        {
          id: 'q2',
          text: 'An AI draft references "our company\'s 90-day review policy" but no such policy was mentioned in your prompt. Which failure pattern is this?',
          options: [
            { id: 'a', text: 'Wrong Assumptions' },
            { id: 'b', text: 'Tone Mismatch' },
            { id: 'c', text: 'Invented Details' },
            { id: 'd', text: 'Over-Polishing' }
          ],
          correctAnswer: 'c',
          explanation: 'This is the Invented Details pattern — the AI fabricated a specific policy reference that sounds authoritative but doesn\'t exist. This is the most dangerous failure pattern because it can create legal exposure if sent to colleagues or clients.'
        },
        {
          id: 'q3',
          text: 'Which constraint should you include in almost every professional prompt?',
          options: [
            { id: 'a', text: '"Make it longer than 500 words"' },
            { id: 'b', text: '"Use formal academic language"' },
            { id: 'c', text: '"Do not invent details I have not provided"' },
            { id: 'd', text: '"Add emojis for friendliness"' }
          ],
          correctAnswer: 'c',
          explanation: 'The anchor guardrail "Do not invent details I have not provided" prevents the most dangerous AI writing failure: confident fabrication. It forces the model to work only with information you\'ve supplied.'
        },
        {
          id: 'q4',
          text: 'What is the primary benefit of progressive (iterative) prompting over writing a single "perfect" prompt?',
          options: [
            { id: 'a', text: 'It uses fewer tokens overall' },
            { id: 'b', text: 'It lets you focus on one dimension at a time, producing better results with less cognitive load' },
            { id: 'c', text: 'AI models are designed to only work with multiple prompts' },
            { id: 'd', text: 'It avoids the need for a verification step' }
          ],
          correctAnswer: 'b',
          explanation: 'Progressive prompting lets you tackle structure, tone, and accuracy in separate passes rather than trying to specify everything perfectly upfront. Each iteration narrows the model\'s output further, and the final self-critique step catches errors that a single-pass approach would miss.'
        },
        {
          id: 'q5',
          text: 'A colleague\'s prompt reads: "Write me a professional email to my team about the project delay." What single change would most improve this prompt?',
          options: [
            { id: 'a', text: 'Add "please" to make it more polite' },
            { id: 'b', text: 'Specify the AI should use bullet points' },
            { id: 'c', text: 'Add specific context: who the team is, what caused the delay, what tone to use, and what not to promise' },
            { id: 'd', text: 'Ask for a longer response to cover more detail' }
          ],
          correctAnswer: 'c',
          explanation: 'The original prompt lacks context, constraints, and specifics — giving the model weak patterns to extrapolate from. Adding who/what/why context, tone guidance, and constraints (especially "what not to promise") transforms it from a generic request into a targeted prompt that produces usable output.'
        }
      ]
    },
    {
      id: 'module2-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Reflect on what you learned about prompt engineering and plan your next steps.',
      fields: [
        { id: 'takeaway', label: 'What prompt engineering technique will you use most?', type: 'textarea', maxLength: 500, minLength: 1 },
        { id: 'template-plan', label: 'What recurring task will you create a prompt template for?', type: 'textarea', maxLength: 300, minLength: 1 },
        { id: 'questions', label: 'Any questions for the facilitator?', type: 'textarea', maxLength: 500 }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module2);

export default module2;
