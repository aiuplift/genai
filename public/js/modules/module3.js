/**
 * Module 3: AI as Notetaker and Operational Writing
 *
 * Activities:
 *   1. Capture-to-Minutes Pack — produce official minutes, action table,
 *      follow-up email, and unknowns section from raw meeting notes
 *   2. QA Verification — verify AI-generated output using a structured
 *      findings log
 *   3. Module Quiz — 5-question knowledge check on meeting documentation,
 *      AI verification, and operational writing
 *   4. Reflection & Feedback — 3 structured reflection entries
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import { registerModule } from '../core/module-registry.js';

const module3 = {
  id: 'module3',
  title: 'AI as Notetaker and Operational Writing',
  description: 'Transform meeting chaos into clear, actionable documentation using AI — with the verification skills to ensure accuracy.',
  sections: [
    {
      type: 'content',
      title: 'Welcome to Module 3',
      content: `Welcome to Module 3 — where you turn the messiest part of your workweek into a streamlined system. If you attend 5-15 meetings per week, you already know the pain: decisions evaporate, action items get lost, and nobody remembers who agreed to what by Friday afternoon.

<strong>What you'll walk away with:</strong>

• The ability to transform raw, chaotic meeting notes into polished operational documents in under 5 minutes
• A systematic verification workflow that catches AI errors before they reach your colleagues
• Understanding of exactly where AI excels in operational writing — and where it fails dangerously
• Practical experience with the "QA Prompt" technique for self-checking AI output
• A repeatable pipeline you can use starting with your next meeting today

This module is built for professionals who live in meetings. The exercises use realistic scenarios — messy notes, ambiguous decisions, unclear ownership — because that's what real meetings produce. You'll practise the full pipeline from raw capture through polished output, and build the verification habit that prevents AI-generated errors from damaging your credibility.

Use the AI Chat (💬 button) throughout this module. Copy your messy notes in, iterate on prompts, and paste polished output into the exercises. That's the real workflow — not a shortcut, but the actual skill you're building.`
    },
    {
      type: 'content',
      title: 'Why Operational Writing Matters',
      content: `Meetings are where decisions happen. Documentation is where accountability lives.

This isn't an exaggeration — it's a pattern that plays out in every organisation, every week. A team meets for 45 minutes, discusses three critical topics, makes two decisions, and assigns four action items. Then everyone goes back to their desks. By the next morning, people remember the decisions differently. By the next week, two of the four action items have been forgotten entirely.

<strong>The numbers tell the story:</strong>

Research consistently shows that 73% of action items from undocumented meetings are never completed. Not because people are lazy — because human memory is unreliable, especially when you're juggling 8-12 meetings per week. Without written documentation, meetings are just conversations that happened to occur in a conference room.

<strong>What good operational documentation does:</strong>

• <strong>Creates accountability.</strong> When "Marcus will deliver mockups by March 15" is written in official minutes and emailed to all attendees, it's a commitment. When it's just something someone said during a rambling discussion, it's a hope.

• <strong>Protects against revisionism.</strong> Three weeks from now, when someone says "We never agreed to that timeline," documented minutes are your evidence. Without them, it's your word against theirs.

• <strong>Enables people who weren't present.</strong> Your manager who couldn't attend, the new team member who joined after the meeting, the stakeholder who needs to understand the decision-making process — all of them rely on written documentation to stay informed and aligned.

• <strong>Builds organisational memory.</strong> Projects fail when teams make the same decisions twice because nobody recorded the first one. Good documentation creates a searchable history of why decisions were made, not just what was decided.

<strong>Why this is an AI opportunity:</strong>

The reason most meetings go undocumented isn't that people don't value documentation — it's that creating good documentation takes 15-30 minutes per meeting. When you're attending 10 meetings a day, that's 2-5 hours of documentation work. Nobody has that time.

AI collapses that 15-30 minutes to 3-5 minutes. You paste raw notes, the AI structures them, you verify for 60-90 seconds, and you send. The bottleneck disappears. The question shifts from "Can I afford to document this meeting?" to "Can I afford not to?"

But here's the critical caveat: AI-generated documentation that contains errors is worse than no documentation at all. Wrong minutes create false accountability, incorrect attribution damages relationships, and invented action items waste people's time. That's why this module pairs the AI documentation skill with the verification skill — you need both.`
    },
    {
      type: 'content',
      title: 'The Meeting-to-Action Pipeline',
      content: `Every meeting follows the same transformation path from chaos to clarity. Understanding this 5-step pipeline helps you give AI the right instructions at each stage — and know what to check at each handoff point.

<strong>Step 1: Raw Capture</strong>
This is what you actually produce during a meeting — shorthand, half-sentences, abbreviations, arrows, names without context. It might be typed notes, a voice transcript, or a Slack thread summary. The key characteristic: it makes sense to you right now, but it won't make sense to anyone else (or to you in two weeks).

<em>Example:</em> "Sarah — dashboard Q2, Marcus API behind 2wks, phased launch? phase1=overview metrics, Tom mobile deprioritised, screenshots Mar15 Marcus Figma, Jenna widget NO q3, staging flaky Sarah escalate infra"

<strong>Step 2: Structure</strong>
AI takes the raw capture and identifies the underlying structure: who was present, what topics were discussed, what decisions were made, what remains unresolved. This is where AI shines — it's essentially a pattern-recognition task, extracting signal from noise.

<em>AI's role:</em> Identify speakers, separate topics, distinguish decisions from discussions, flag items that appear unresolved.

<strong>Step 3: Minutes</strong>
The structured information becomes formal meeting minutes — a document that anyone could read and understand what happened, what was decided, and why. This includes context that raw notes omit (because you knew it at the time but won't remember later).

<em>AI's role:</em> Draft professional prose that captures the key points, decisions, and rationale in a format suitable for distribution.

<strong>Step 4: Action Items</strong>
Every commitment made during the meeting gets extracted into a clear, trackable format: who is doing what, by when, and what "done" looks like. This is the most operationally critical output — it's what drives work forward after the meeting ends.

<em>AI's role:</em> Extract explicitly stated commitments with owners and deadlines. Flag items where ownership or timeline is ambiguous.

<strong>Step 5: Follow-up Communication</strong>
The final output: an email (or Slack message, or project update) that goes to all attendees and relevant stakeholders, summarising decisions and next steps. This closes the loop and creates the accountability chain.

<em>AI's role:</em> Draft a concise, professional communication that covers key decisions, action items, and any items requiring follow-up — in a tone appropriate for the audience.

<strong>Where AI handles each stage:</strong>

| Stage | AI Capability | Human Verification Needed |
|-------|--------------|--------------------------|
| Raw Capture → Structure | Excellent (pattern recognition) | Check speaker attribution |
| Structure → Minutes | Very Good (prose generation) | Verify accuracy of decisions |
| Minutes → Action Items | Good (extraction) | Confirm assignments were actually made |
| Action Items → Follow-up | Very Good (communication drafting) | Check tone, verify no false commitments |

<strong>The critical insight:</strong> AI gets progressively less reliable as you move down the pipeline. It's excellent at the mechanical work (structuring raw notes) and increasingly risky at the judgment work (deciding who committed to what). Your verification effort should scale accordingly — light touch at Step 2, careful scrutiny at Steps 4 and 5.`
    },
    {
      type: 'content',
      title: "AI's Strengths in Operational Writing",
      content: `Let's be specific about what AI does genuinely well in operational writing. These aren't hypothetical benefits — they're capabilities you can rely on consistently when you give AI clear input material to work with.

<strong>1. Extracting Structure from Chaos</strong>

Give AI a 2000-word stream-of-consciousness meeting transcript, and it will identify the 4 topics discussed, the 6 decisions made, and the 8 action items buried in the conversation. This is pure pattern recognition — the task AI was literally designed for. It doesn't get tired, doesn't lose focus halfway through, and doesn't forget the thing mentioned at minute 3 when processing minute 45.

<em>Real example:</em> A 45-minute product review meeting produces a transcript with 47 speaker turns, 12 tangents, 3 jokes, and 2 heated debates. A human would take 20 minutes to extract the key points. AI does it in 15 seconds — and catches the action item buried in the tangent at minute 38 that the human would have missed.

<strong>2. Identifying Action Items with Precision</strong>

AI is remarkably good at distinguishing between "things that were discussed" and "things someone actually committed to doing." It picks up linguistic cues: "I'll handle that," "Can you send me," "Let's make sure we," "The deadline is." When prompted correctly, it separates aspirational discussion from concrete commitments.

<em>Real example:</em> In the same meeting transcript, the AI correctly identifies that "We should think about mobile responsiveness" is a discussion point (no owner, no deadline, no commitment), while "Marcus, can you get mockups to product marketing by March 15?" is an action item with a clear owner and deadline.

<strong>3. Maintaining Consistent Formatting</strong>

Every meeting you document will follow exactly the same format — same heading structure, same action item layout, same follow-up email template. AI doesn't get lazy on meeting #47 of the month. It doesn't decide to skip the "Unresolved Items" section because it's Friday afternoon. Consistency builds trust with your audience: they know exactly where to look for the information they need.

<strong>4. Catching Missed Items</strong>

When you review AI-generated minutes against your raw notes, you'll often discover items you forgot to capture. The AI, working from a transcript or detailed notes, catches the brief mention of a deadline that you didn't write down, or the question that was asked but never answered. It serves as a completeness check on your own memory.

<strong>5. Tone Calibration for Different Audiences</strong>

The same meeting produces different documentation for different audiences. Your team gets detailed minutes with technical specifics. Your VP gets a 3-line executive summary. The client gets a carefully worded update that omits internal discussions. AI can produce all three versions from the same source material, adjusting tone, detail level, and framing for each audience — in seconds rather than the 30 minutes it would take to write each manually.

<strong>6. Speed That Changes Behaviour</strong>

This is the underrated benefit. When documentation takes 15-30 minutes, you skip it for "unimportant" meetings. When it takes 3 minutes, you document everything. Over time, this means your team has a complete record of decisions, not just a record of the meetings you deemed important enough to document. The meetings you think are unimportant today often turn out to be critical three months later.`
    },
    {
      type: 'content',
      title: "AI's Blind Spots — Where Verification is Non-Negotiable",
      content: `For every strength AI has in operational writing, there's a corresponding blind spot that can cause real damage if you're not watching for it. These aren't edge cases — they happen in the majority of AI-generated meeting documents.

<strong>1. Attribution Errors — Who Said What</strong>

AI frequently gets wrong who said what, who made which decision, and who committed to which action item. This happens because AI doesn't "know" the speakers as individuals — it's working from text patterns and making probabilistic guesses about which statement belongs to which person.

<em>Workplace scenario:</em> Your meeting notes say "Sarah suggested phased launch, Marcus agreed." AI generates minutes stating "Marcus proposed a phased launch approach, which Sarah endorsed." Now Marcus gets credit for Sarah's idea, and Sarah's contribution is erased. If Sarah reads these minutes, she'll question whether you were paying attention — or whether you're playing politics.

<em>Worse scenario:</em> AI attributes a controversial statement to the wrong person. "Tom expressed concerns about the timeline being unrealistic" — but it was actually the VP who said that. Now Tom looks like he's pushing back on leadership's plan, when he was actually supportive.

<strong>2. Invented Attendees and Participants</strong>

If your notes mention names without specifying roles or attendance, AI may add people to the attendee list who weren't present, or assign roles and titles that don't match reality. It fills gaps with plausible-sounding information rather than flagging uncertainty.

<em>Workplace scenario:</em> Your notes mention "Jenna's widget request." AI generates an attendee list that includes Jenna — but Jenna wasn't at the meeting. Her request was just referenced in discussion. Now Jenna gets a follow-up email about "action items from our meeting" and is confused because she never attended.

<strong>3. Context-Dependent Decisions That AI Can't Interpret</strong>

Many meeting decisions depend on unspoken context — organisational politics, previous conversations, relationship dynamics, budget constraints that everyone knows but nobody states explicitly. AI has no access to this context and may interpret ambiguous discussions in ways that miss the real meaning.

<em>Workplace scenario:</em> Someone says "Let's not scope creep on this one." To the people in the room, this is clearly a reference to the last project that failed because of uncontrolled scope expansion — everyone laughs knowingly. AI interprets it literally and generates minutes that say "The team decided to limit project scope" without capturing the strategic context that this is a deliberate response to a recent failure.

<strong>4. Organisational Hierarchy and Responsibility Assignment</strong>

AI doesn't know your org chart. It doesn't know that the intern can't approve budgets, that the contractor isn't authorised to commit to client timelines, or that the team lead — not the project manager — owns technical decisions. When AI assigns action items, it may assign them to people who don't have the authority to execute them.

<em>Workplace scenario:</em> AI generates an action item: "Alex to approve the vendor contract by end of week." But Alex is a project coordinator — they can't approve contracts. The actual approver is the department head, who wasn't mentioned by name in the meeting. You send the minutes, Alex panics because they think they're now responsible for something outside their authority, and the actual approver never gets the action item.

<strong>5. Distinguishing Decisions from Discussions</strong>

This is the subtlest and most dangerous blind spot. In many meetings, topics are discussed at length without reaching a formal decision. AI has difficulty distinguishing "we talked about this extensively" from "we decided this." The linguistic cues are subtle — "Let's go with option A" is a decision, but "I think option A makes the most sense" might just be one person's opinion that was never formally agreed to.

<em>Workplace scenario:</em> During a meeting, three people discuss whether to delay the launch by two weeks. No formal decision is reached — it's left for the project lead to decide after consulting with the client. AI generates minutes that state: "The team decided to delay the launch by two weeks." Now people start acting on a "decision" that was never actually made. The project lead is blindsided when team members reference "the decision we made in Tuesday's meeting."

<strong>The pattern across all blind spots:</strong> AI fills uncertainty with confidence. Where a human would write "unclear" or "to be confirmed," AI generates definitive-sounding statements. This is why verification isn't optional — it's the difference between documentation that helps your team and documentation that actively misleads them.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The Gold Standard',
      content: `AI structures, you verify. Never send AI-generated minutes without checking every attribution and every action item assignment against your actual notes. The 60-90 seconds this takes prevents the single most damaging failure: distributing official documentation that attributes decisions to wrong people, assigns tasks to people who never agreed to them, or records outcomes that were never actually decided. Your reputation as someone who produces reliable documentation is worth more than the 90 seconds you save by skipping verification.`
    },
    {
      type: 'activity',
      activityId: 'capture-to-minutes'
    },
    {
      type: 'content',
      title: 'Building a Verification Workflow',
      content: `Verification isn't about reading the entire document suspiciously — it's about knowing exactly where AI is most likely to fail and checking those spots systematically. Think of it as a 4-point inspection, not a complete re-read. Each check targets a specific category of AI error.

<strong>Check 1: Attribution Check (30 seconds)</strong>

Scan every instance where the minutes attribute a statement, decision, or opinion to a specific person. For each one, ask: "Did this person actually say this?"

What to look for:
• Statements assigned to the wrong speaker
• Ideas credited to someone who merely agreed, rather than the person who originated them
• People listed as "suggesting" or "proposing" things they only passively accepted
• Any person referenced who wasn't actually in the meeting

<em>Technique:</em> Read the AI output with your raw notes side by side. Every time you see a name, cross-reference it. This catches 80% of attribution errors.

<strong>Check 2: Completeness Check (20 seconds)</strong>

Compare the AI output against your mental model of what actually happened. Ask: "Is anything important missing?"

What to look for:
• Decisions that were made but aren't captured
• Action items that were assigned but got dropped
• Important context or caveats that were discussed but omitted
• Dissenting views that were expressed but smoothed over

<em>Technique:</em> Without looking at the AI output, list the 3-5 most important things that happened in the meeting. Then check if each one appears in the minutes. Missing items are often the subtle ones — the caveat someone added to a decision, the concern that was raised but not resolved.

<strong>Check 3: Accuracy Check (20 seconds)</strong>

Verify the specific details — dates, numbers, commitments, scope boundaries. Ask: "Are the facts correct?"

What to look for:
• Deadlines that are slightly wrong (March 15 vs March 12)
• Numbers that are rounded incorrectly or invented
• Scope that's been subtly expanded or contracted from what was actually discussed
• "Decisions" that were actually just discussions (the most common accuracy error)

<em>Technique:</em> Focus on anything quantitative or time-bound. If the AI says "by end of week," verify that's what was actually said — not "sometime next week" or "when they get a chance."

<strong>Check 4: Tone Check (15 seconds)</strong>

Read the follow-up email or distribution copy from the recipient's perspective. Ask: "Will this land correctly with the people who receive it?"

What to look for:
• Language that's more formal or informal than your organisation's norms
• Phrasing that could sound accusatory when reporting who's responsible for delays
• Commitments stated more strongly than they were actually made ("Sarah committed to..." vs "Sarah said she'd try to...")
• Missing acknowledgments or courtesies your team expects

<em>Technique:</em> Imagine the most sensitive person on the recipient list reading this document. Would anything make them uncomfortable, confused, or defensive? Adjust accordingly.

<strong>Total time: 60-90 seconds.</strong> This is not a significant overhead for a document that will be sent to 5-15 people and serve as the official record of what happened. It's the highest-value 90 seconds in your documentation workflow.`
    },
    {
      type: 'content',
      title: 'The QA Prompt Technique for Operational Docs',
      content: `One of the most powerful techniques for catching AI errors in operational documents is asking the AI to self-critique its own output. This isn't a replacement for human verification — but it's a remarkably effective first pass that takes 15 seconds and catches errors you might miss on a quick scan.

<strong>How it works:</strong>

After AI generates your meeting minutes or follow-up email, paste the output back and use a QA prompt that asks the model to identify its own weaknesses. The model can often recognise patterns of uncertainty in its own output when explicitly asked to look for them.

<strong>Example QA Prompts for Meeting Documentation:</strong>

<em>Prompt 1 — Attribution Audit:</em>
"Review the meeting minutes above. For each statement attributed to a specific person, rate your confidence (high/medium/low) that the attribution is correct. Flag any attribution where you're working from inference rather than explicit statement in the source notes."

<em>Prompt 2 — Invention Detection:</em>
"Compare the minutes you generated against the raw notes I provided. List any details in the minutes that do not appear in the original notes — including deadlines, commitments, attendee roles, or decisions that you may have inferred or added. Be honest about what you invented vs what was explicitly stated."

<em>Prompt 3 — Decision vs Discussion:</em>
"Review each 'decision' recorded in these minutes. For each one, indicate whether the source notes clearly show this was formally decided (explicit agreement by the group) or merely discussed (someone's suggestion without clear group consensus). Flag anything ambiguous."

<em>Prompt 4 — Completeness Self-Check:</em>
"Given the raw notes, are there any topics, decisions, or action items that were discussed but not captured in the minutes you generated? List anything you may have missed or deemed unimportant."

<em>Prompt 5 — Follow-up Email Risk Assessment:</em>
"Review the follow-up email draft above. Flag any sentence that could be interpreted as a commitment, promise, or deadline that wasn't explicitly stated in the meeting. Highlight any phrase that might create expectations or accountability that wasn't actually agreed upon."

<strong>Why this works:</strong>

LLMs generate text probabilistically — some parts of their output have higher confidence than others. When you ask the model to assess its own confidence, it can identify the places where it was "filling in" rather than directly transcribing. It won't catch everything, but it catches a surprising amount — especially invented details and uncertain attributions.

<strong>The workflow:</strong>
1. Generate minutes/email from raw notes
2. Run one QA prompt (pick the one most relevant to your situation)
3. Review the flagged items against your actual notes
4. Correct any errors found
5. Send with confidence

<strong>Time investment:</strong> 15 seconds to paste and run the QA prompt. 30 seconds to review its flags. Total: under a minute added to your workflow, and it catches errors that would take much longer to fix after distribution.`
    },
    {
      type: 'activity',
      activityId: 'qa-verification'
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'The Commitment Trap in Follow-up Emails',
      content: `AI-generated follow-up emails are uniquely dangerous because they often contain commitments nobody actually agreed to. The AI's tendency to sound definitive and action-oriented means it turns tentative discussions into firm promises. "We discussed possibly exploring a phased approach" becomes "The team committed to delivering Phase 1 by April 15." "Sarah mentioned she might be able to help" becomes "Sarah will lead the implementation effort." These invented commitments create false expectations, damage trust when unmet, and can put colleagues in impossible positions. Before sending any AI-generated follow-up email, check every verb: every "will," "committed to," "agreed," and "by [date]" must correspond to an actual agreement made in the meeting. If you wouldn't bet your reputation on it being true, soften the language or remove it entirely.`
    },
    {
      type: 'content',
      title: 'From Minutes to Decisions — The Documentation Chain',
      content: `Good meeting documentation isn't just a record of what happened today — it's a link in a chain that creates organisational memory. The teams and organisations that execute well are almost always the ones that document well. This isn't coincidence; it's causation.

<strong>How documentation drives project success:</strong>

<em>Decision traceability.</em> Six months from now, someone will ask "Why did we choose Vendor A over Vendor B?" If the decision rationale is documented in meeting minutes from June, you have an answer in 30 seconds. If it's not documented, you have a 45-minute archaeological expedition through email threads and Slack channels — if you can reconstruct it at all.

<em>Onboarding acceleration.</em> New team members can read the last 4-6 meeting minutes and understand the project's current state, recent decisions, and open issues without requiring a 2-hour brain dump from existing team members. Good documentation is a gift to your future colleagues.

<em>Accountability without conflict.</em> When action items are documented and distributed, accountability becomes a matter of record rather than a matter of confrontation. "Per the minutes from our March 12 meeting, this was assigned to you with a March 20 deadline" is much more effective (and less personal) than "I'm pretty sure you said you'd do this."

<em>Pattern recognition.</em> After 3-6 months of consistent documentation, you start seeing patterns: which decisions get revisited repeatedly (suggesting they weren't well-made), which action items consistently miss deadlines (suggesting resource or priority problems), and which topics generate the most discussion (suggesting unresolved strategic questions).

<strong>Building the chain — practical habits:</strong>

• <strong>Consistent naming convention.</strong> "[Team] Meeting Minutes — YYYY-MM-DD" makes minutes findable. AI can generate this formatting automatically.

• <strong>Cross-reference previous decisions.</strong> When a topic comes up that was discussed before, reference the previous minutes: "As decided on March 5 (see minutes), we agreed to..." AI can be prompted to identify and reference related previous meetings.

• <strong>Close the loop on action items.</strong> Every meeting should start with a status check on action items from the previous meeting. Document which ones are complete, which are in progress, and which are blocked. AI can generate this status tracking format automatically.

• <strong>Separate "decisions" from "discussions."</strong> In your minutes template, explicitly label which items are decided vs which are still under discussion. This prevents the ambiguity that causes the most team friction.

• <strong>Archive accessibly.</strong> Minutes that exist only in someone's inbox are nearly useless. Store them in a shared location (SharePoint, Google Drive, Notion, Confluence) where any team member can find them. AI can help you format for whatever platform you use.

<strong>The compound effect:</strong>

A single well-documented meeting is useful. Six months of well-documented meetings is transformative. You build a searchable knowledge base of every decision your team has made, every commitment that was agreed, and every rationale that was discussed. This is the kind of organisational infrastructure that separates high-performing teams from ones that are constantly reinventing the wheel.

And with AI handling 80% of the documentation work, maintaining this chain costs you 3-5 minutes per meeting rather than 20-30. The ROI is extraordinary — and it compounds over time as your documentation archive grows.`
    },
    {
      type: 'activity',
      activityId: 'module3-quiz'
    },
    {
      type: 'activity',
      activityId: 'module3-feedback'
    }
  ],
  activities: [
    {
      id: 'capture-to-minutes',
      title: 'Capture-to-Minutes Pack',
      type: 'form',
      description:
        'Transform raw meeting notes into official minutes with a structured action table, follow-up email, and a section for unknowns that need confirmation. Use the AI Chat to iterate on your prompts — paste your raw notes, refine your instructions, and produce polished output.',
      fields: [
        {
          id: 'source-material',
          label: 'Source Material',
          type: 'textarea',
          description: 'Paste or summarise the raw meeting notes / transcript here. The messier and more realistic, the better — this exercise is about transforming chaos into clarity.',
          minLength: 1,
          maxLength: 5000,
          required: true
        },
        {
          id: 'official-minutes',
          label: 'Official Minutes',
          type: 'textarea',
          description: 'Write the polished meeting minutes derived from the source material. Include: attendees, topics discussed, decisions made, and any important context.',
          minLength: 1,
          maxLength: 5000,
          required: true
        },
        {
          id: 'unknowns',
          label: 'Unknowns / Needs Confirmation',
          type: 'textarea',
          description: 'List items from the meeting that are unclear, unresolved, or require follow-up confirmation. This is where you capture ambiguity rather than letting AI fill it with invention.',
          minLength: 1,
          maxLength: 2000,
          required: true
        },
        {
          id: 'action-table',
          label: 'Action Table',
          type: 'structured_table',
          description: 'Record action items arising from the meeting. Only include items that were explicitly committed to — not suggestions or discussions.',
          columns: [
            { id: 'person', label: 'Responsible Person', type: 'text', maxLength: 200 },
            { id: 'description', label: 'Action Item Description', type: 'text', maxLength: 500 },
            { id: 'due-date', label: 'Due Date', type: 'text', maxLength: 50 },
            { id: 'status', label: 'Status', type: 'text', maxLength: 100 }
          ],
          minRows: 1,
          maxRows: 20,
          required: true
        },
        {
          id: 'follow-up-email',
          label: 'Follow-up Email',
          type: 'textarea',
          description: 'Draft the follow-up email to send to meeting attendees summarising decisions and actions. Check every commitment — does it match what was actually agreed?',
          minLength: 1,
          maxLength: 5000,
          required: true
        }
      ],
      completionRule: 'all_required_filled'
    },
    {
      id: 'qa-verification',
      title: 'QA Verification',
      type: 'form',
      description:
        'Verify the accuracy of AI-generated meeting minutes by using a QA prompt to self-critique the output, then recording your findings in a structured log. This builds the verification habit that separates reliable documentation from dangerous documentation.',
      fields: [
        {
          id: 'verification-prompt',
          label: 'Verification Prompt',
          type: 'textarea',
          description: 'Enter the QA prompt you used to ask the AI to self-critique or fact-check the minutes. Try one of the example prompts from the section above, or create your own.',
          minLength: 1,
          maxLength: 2000,
          required: true
        },
        {
          id: 'findings-log',
          label: 'Findings Log',
          type: 'structured_table',
          description: 'Log each item you checked against the original source material, the result of your verification, and any corrections needed.',
          columns: [
            { id: 'item', label: 'Item Checked', type: 'text', maxLength: 500 },
            {
              id: 'result',
              label: 'Result',
              type: 'select',
              options: ['confirmed accurate', 'error found', 'unable to verify']
            },
            { id: 'correction-note', label: 'Correction Note', type: 'text', maxLength: 500 }
          ],
          minRows: 1,
          maxRows: 20,
          required: true
        }
      ],
      completionRule: 'all_required_filled'
    },
    {
      id: 'module3-quiz',
      title: 'Quick Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of AI-assisted meeting documentation, verification practices, and operational writing.',
      questions: [
        {
          id: 'q1',
          text: 'What is the biggest risk of sending AI-generated meeting minutes without verification?',
          options: [
            { id: 'a', text: 'The formatting might not match your company template' },
            { id: 'b', text: 'The minutes might be too long for people to read' },
            { id: 'c', text: 'Statements and decisions may be attributed to the wrong people' },
            { id: 'd', text: 'The AI might use informal language' }
          ],
          correctAnswer: 'c',
          explanation: 'Misattribution is the most damaging AI error in meeting documentation. When decisions, opinions, or commitments are attributed to the wrong person, it creates false accountability, erases contributions, and can damage professional relationships. Unlike formatting or length issues, attribution errors affect people directly and are difficult to correct after distribution.'
        },
        {
          id: 'q2',
          text: 'When should you NOT use AI to generate meeting documentation?',
          options: [
            { id: 'a', text: 'When the meeting has more than 10 attendees' },
            { id: 'b', text: 'When the meeting contains confidential personnel discussions (performance reviews, disciplinary actions, salary negotiations)' },
            { id: 'c', text: 'When the meeting lasts longer than one hour' },
            { id: 'd', text: 'When the meeting is held remotely' }
          ],
          correctAnswer: 'b',
          explanation: 'Meetings containing confidential personnel information — performance feedback, disciplinary actions, salary discussions, or HR-sensitive matters — should not be processed through AI tools unless you are using an enterprise-deployed solution with appropriate data handling agreements. Pasting sensitive personnel information into consumer AI tools exposes it to third-party servers and potentially to model training data.'
        },
        {
          id: 'q3',
          text: 'What is the first thing to verify in AI-generated action items?',
          options: [
            { id: 'a', text: 'That the formatting is consistent across all items' },
            { id: 'b', text: 'That the deadlines are realistic' },
            { id: 'c', text: 'That the responsible person was actually assigned that task in the meeting' },
            { id: 'd', text: 'That the action items are sorted by priority' }
          ],
          correctAnswer: 'c',
          explanation: 'The most critical verification is confirming that each person listed as responsible actually committed to that action item during the meeting. AI frequently assigns tasks to people who merely discussed a topic, agreed with a suggestion, or were mentioned in passing — creating false obligations. A person receiving minutes that say they "committed" to something they never agreed to will lose trust in your documentation.'
        },
        {
          id: 'q4',
          text: 'What does the "attribution check" involve?',
          options: [
            { id: 'a', text: 'Checking that the AI properly cited its sources' },
            { id: 'b', text: 'Verifying that every statement attributed to a person in the minutes actually came from that person' },
            { id: 'c', text: 'Ensuring all attendees are credited as authors of the minutes' },
            { id: 'd', text: 'Confirming the meeting organiser is listed correctly' }
          ],
          correctAnswer: 'b',
          explanation: 'The attribution check is a systematic review of every place in the minutes where a statement, opinion, decision, or commitment is linked to a specific person. You verify each attribution against your raw notes or memory to confirm that person actually said or committed to what the minutes claim. This is the single most important verification step because attribution errors are both common in AI output and highly damaging to professional relationships.'
        },
        {
          id: 'q5',
          text: 'Your AI generates a follow-up email that states: "The team agreed to deliver the MVP by March 30th and Sarah will lead the client presentation." You recall that the March 30th date was discussed but not formally agreed, and Sarah said she "might be available" for the presentation. What should you do?',
          options: [
            { id: 'a', text: 'Send it as-is — the AI captured the spirit of the discussion' },
            { id: 'b', text: 'Delete the entire email and write it from scratch without AI' },
            { id: 'c', text: 'Soften both statements to reflect what was actually said: the date is "under discussion" and Sarah\'s involvement is "to be confirmed"' },
            { id: 'd', text: 'Just remove Sarah\'s name and keep the March 30th date since dates are less sensitive' }
          ],
          correctAnswer: 'c',
          explanation: 'The safest approach is to adjust the language to match the actual level of commitment. Sending definitive statements about uncommitted dates and unconfirmed responsibilities creates false expectations and can put colleagues in difficult positions. "Under discussion" and "to be confirmed" accurately represent reality and prevent the commitment trap where AI-generated language creates obligations nobody agreed to.'
        }
      ]
    },
    {
      id: 'module3-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Reflect on what you learned about AI-assisted operational writing and plan how you will apply these skills.',
      fields: [
        { id: 'application', label: 'What meeting this week will you first try AI-assisted documentation on? What specific output will you produce (minutes, action items, follow-up email)?', type: 'textarea', maxLength: 500, minLength: 1 },
        { id: 'verification-plan', label: 'What is your personal verification checklist? List the 3-4 checks you will run on every AI-generated operational document before sending.', type: 'textarea', maxLength: 500, minLength: 1 },
        { id: 'concern', label: 'What is your biggest concern about using AI for meeting documentation in your specific role or team? What would help address it?', type: 'textarea', maxLength: 500, minLength: 1 }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module3);

export default module3;
