/**
 * Module 9: Building Without Coding and AI Agents
 *
 * Activities:
 *   1. Main Lab (Build) — design a simple tool or agent using a no-code builder
 *   2. Mini-lab (Risk Review) — conduct a risk review of a partner's build
 *   3. Quick Quiz — 5-question multiple-choice knowledge check
 *   4. Reflection & Feedback — structured reflection entries
 *
 * The Mini-lab has a prerequisite: the participant must have submitted their
 * Main Lab build design before accessing the partner exchange.
 *
 * Round-robin partner assignment: participant at index i reviews the build
 * of participant at index (i + 1) % group_size.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { registerModule } from '../core/module-registry.js';

/**
 * Assign a partner for risk review using round-robin within a group.
 *
 * Given a list of participant IDs (sorted consistently) and the current
 * participant's ID, returns the ID of the participant whose build they
 * should review.
 *
 * @param {string[]} groupMemberIds - Sorted array of participant IDs in the group
 * @param {string} currentParticipantId - The current participant's ID
 * @returns {string|null} The partner's participant ID, or null if assignment is not possible
 */
export function assignRiskReviewPartner(groupMemberIds, currentParticipantId) {
  if (!Array.isArray(groupMemberIds) || groupMemberIds.length < 2) {
    return null;
  }

  const currentIndex = groupMemberIds.indexOf(currentParticipantId);
  if (currentIndex === -1) {
    return null;
  }

  const partnerIndex = (currentIndex + 1) % groupMemberIds.length;
  return groupMemberIds[partnerIndex];
}

/**
 * Check whether the Mini-lab prerequisite is met.
 *
 * The Mini-lab (Risk Review) is disabled until the participant has submitted
 * their Main Lab build design (all required fields filled).
 *
 * @param {object} mainLabResponses - The participant's responses for the Main Lab activity
 * @returns {boolean} True if the Main Lab has been submitted (prerequisite met)
 */
export function isMainLabSubmitted(mainLabResponses) {
  if (!mainLabResponses || typeof mainLabResponses !== 'object') {
    return false;
  }

  const requiredFields = ['purpose', 'platform', 'design-description', 'build-status', 'testing-notes'];

  return requiredFields.every(fieldId => {
    const response = mainLabResponses[fieldId];
    if (!response) return false;
    const value = typeof response === 'object' ? response.value : response;
    return value !== undefined && value !== null && String(value).trim().length > 0;
  });
}

const module9 = {
  id: 'module9',
  title: 'Building Without Coding and AI Agents',
  description: 'Build functional AI tools without writing code — from custom chatbots to automated workflows — with the risk assessment discipline to deploy them responsibly.',
  sections: [
    {
      type: 'content',
      title: 'Welcome to Module 9',
      content: `Welcome to Module 9 — where you move from using AI tools to building with them. By the end of this session, you won't just understand what no-code AI tools can do — you'll have designed and built one yourself, and you'll know how to assess whether it's safe to deploy.

<strong>What you'll walk away with:</strong>

• The ability to build functional tools without writing a single line of code
• An understanding of no-code AI platforms and when each one is appropriate
• A systematic framework for assessing deployment risks before they cause harm
• Hands-on experience designing, building, and testing your own AI tool or agent
• The judgment to know when no-code is sufficient and when you need a developer

This module bridges the gap between "I use AI" and "I build with AI." You don't need to be a programmer. You need to think clearly about what you want to automate, choose the right platform, and — critically — assess the risks before putting your creation in front of real users.`
    },
    {
      type: 'content',
      title: 'The No-Code Revolution',
      content: `<strong>You Don't Need to Code to Build Useful Tools</strong>

Five years ago, if you wanted to automate a workflow or build a custom tool, you had two options: learn to code, or convince a developer to build it for you. Both took weeks or months. Today, a non-technical professional can build a functional tool in an afternoon — and that's not an exaggeration.

The no-code movement has matured from simple "if this, then that" triggers into sophisticated platforms that can handle complex logic, data transformations, and even AI-powered decision-making. Here's what's available:

<strong>Workflow Automation Platforms</strong>

<em>Zapier</em> — Connects 6,000+ apps with "if this happens, do that" logic. A marketing manager built a system that automatically pulls new customer reviews from Google, runs them through sentiment analysis, and routes negative reviews to a support Slack channel within 2 minutes of posting. No code. Setup time: 45 minutes.

<em>Make (formerly Integromat)</em> — More powerful than Zapier for complex multi-step workflows with branching logic. An operations team built a system that processes incoming invoices: extracts key data with AI, routes to the right approver based on amount and department, sends reminders if not approved within 48 hours, and logs everything to their accounting system. The alternative was hiring a developer for 3 months.

<strong>Application Builders</strong>

<em>Bubble</em> — Full web application builder with database, user authentication, and custom logic. A consulting firm built their entire client portal — document sharing, project timelines, invoice management — without a developer. It handles 200+ active clients.

<em>Retool</em> — Internal tool builder for teams that need dashboards, admin panels, and data management interfaces. Particularly strong when you need to connect to existing databases and APIs. IT teams use it to build custom admin tools in days instead of quarters.

<strong>AI-Native Builders</strong>

<em>Custom GPTs (OpenAI)</em> — Build specialized AI assistants with custom instructions, knowledge bases, and connected tools. An HR team built a "Policy Assistant" GPT that answers employee questions by referencing their actual policy documents — reducing HR inbox volume by 40%.

<em>Langflow / Flowise</em> — Visual builders for AI pipelines. Drag-and-drop interfaces for building chains of AI operations: take input → process with AI → check against rules → format output → deliver result. Think of them as Zapier specifically for AI workflows.

<em>Microsoft Copilot Studio</em> — Build custom AI agents within the Microsoft ecosystem. Particularly powerful for organizations already using Teams, SharePoint, and Dynamics — the agent can access and act on data across all of these.

<strong>Real Examples of Professionals Building Useful Automation</strong>

• A project manager built a Zapier workflow that monitors their project management tool, detects when tasks are overdue by more than 2 days, and sends a personalized nudge to the assignee with context about the deadline. Previously, they spent 30 minutes every morning manually checking and chasing. Now it's automatic.

• A recruiter built a Custom GPT trained on their company's job descriptions, culture values, and interview framework. It generates tailored interview questions for each role and candidate background. The recruiter still reviews every question, but the first draft takes 30 seconds instead of 15 minutes.

• A finance analyst built a Make workflow that pulls daily sales data from three different systems, consolidates it, generates a one-page summary using AI, and emails it to leadership by 7am. The manual version took 90 minutes every morning.

• A customer success manager built a Retool dashboard that surfaces at-risk accounts by combining usage data, support ticket frequency, and contract renewal dates. Previously, this analysis happened quarterly in spreadsheets. Now it's real-time.

<strong>The common thread:</strong> None of these people are developers. They're professionals who identified a repetitive pain point in their work and used no-code tools to eliminate it. The technical barrier to building useful automation has effectively disappeared — the remaining barrier is knowing what to build and how to assess whether it's safe.`
    },
    {
      type: 'content',
      title: 'AI Agents — Beyond Chat',
      content: `<strong>From Conversation to Action</strong>

When most people think of AI, they think of chatbots — you type a question, you get an answer. That's useful, but it's fundamentally passive. An AI agent is something different: it's an AI system that takes actions in the real world on your behalf.

The distinction matters because it changes the risk profile entirely.

<strong>Chatbot vs Agent — The Key Difference</strong>

A <em>chatbot</em> generates text in response to input. You ask a question, you get words back. If those words are wrong, the damage is limited — you read bad information, maybe waste some time.

An <em>agent</em> takes actions. It sends emails. It moves data between systems. It triggers workflows. It makes decisions and executes them without waiting for your approval on each step. If an agent makes a wrong decision, things happen in the real world — emails go to wrong people, data gets corrupted, processes get triggered inappropriately.

<strong>Examples of AI Agents in Practice</strong>

<em>Email Sorter Agent:</em> Reads incoming emails, categorizes them by urgency and topic, drafts responses for routine inquiries, and flags items that need human attention. It doesn't just suggest — it moves emails to folders, assigns labels, and sends pre-approved responses automatically.

<em>Research Assistant Agent:</em> Given a research question, it searches multiple sources, synthesizes findings, identifies contradictions between sources, and produces a structured briefing document. More advanced versions can follow up on leads, track changes to sources over time, and alert you when new relevant information appears.

<em>Data Pipeline Monitor:</em> Watches data flows between systems, detects anomalies (unexpected volume changes, format errors, missing records), and takes corrective action — retrying failed transfers, alerting the right person, or temporarily pausing a pipeline to prevent data corruption from spreading.

<em>Customer Onboarding Agent:</em> When a new customer signs up, the agent creates their account across multiple systems, sends personalized welcome sequences based on their plan type, schedules check-in reminders for the account manager, and flags if the customer hasn't completed setup steps within expected timeframes.

<em>Meeting Scheduler Agent:</em> Goes beyond simple calendar tools — it understands meeting priorities, travel time between locations, energy management (no back-to-back demanding meetings), and team preferences. It doesn't just find open slots; it makes judgment calls about scheduling quality.

<strong>The Spectrum from Chatbot to Autonomous Agent</strong>

Think of it as a spectrum:

1. <strong>Chatbot</strong> — Responds when asked. No persistent memory. No actions.
2. <strong>Assistant</strong> — Responds when asked. Remembers context. Suggests actions.
3. <strong>Supervised Agent</strong> — Takes actions, but asks permission first. "I'd like to send this email — approve?"
4. <strong>Autonomous Agent</strong> — Takes actions within defined boundaries without asking. Reports what it did afterward.

Most no-code builders let you create tools in categories 2-3. Fully autonomous agents (category 4) typically require more careful engineering and monitoring — but even supervised agents can save enormous amounts of time.

<strong>Why Agents Are More Powerful — and More Dangerous</strong>

The power of agents is obvious: they do work while you do other things. But the risk is proportional. When an agent sends an email, you can't unsend it. When it modifies a database record, the old value might be gone. When it triggers a workflow, downstream systems react immediately.

This is why Module 9 pairs building with risk assessment. The ability to build is now easy. The judgment to build safely is the differentiator between professionals who create value and professionals who create incidents.`
    },
    {
      type: 'content',
      title: 'Building Your First Tool',
      content: `<strong>The Practical Workflow: From Idea to Working Tool</strong>

Building your first no-code AI tool follows a predictable path. Here's the workflow that experienced builders use — and the mistakes that first-timers typically make at each stage.

<strong>Step 1: Identify a Pain Point</strong>

Don't start with "What can I build?" Start with "What annoys me every week?" The best first automation targets are:
• Tasks you do repeatedly (weekly or more often)
• Tasks that follow a predictable pattern (same steps each time)
• Tasks where the input and output are well-defined
• Tasks that are important but not critical (low consequence if something goes wrong during testing)

<em>Bad first project:</em> "I'll build an AI agent that handles all customer complaints." Too complex, too high-stakes, too many edge cases.

<em>Good first project:</em> "I'll build a workflow that takes my weekly meeting notes and formats them into a consistent template, then posts to our team Slack channel." Simple, repetitive, low-risk, easy to verify.

<strong>Step 2: Choose a Platform</strong>

Match your platform to your task:
• <em>Connecting existing apps?</em> → Zapier or Make
• <em>Building a custom internal tool?</em> → Retool or Bubble
• <em>Creating a specialized AI assistant?</em> → Custom GPTs or Copilot Studio
• <em>Building an AI processing pipeline?</em> → Langflow or Flowise

For your first build, choose the simplest platform that handles your use case. Don't pick the most powerful option — pick the one with the shortest learning curve for what you need.

<strong>Step 3: Design the Logic</strong>

Before touching the platform, sketch your workflow on paper:
• What triggers the automation? (New email? Scheduled time? Manual button?)
• What are the inputs? (Where does data come from?)
• What processing happens? (AI summarization? Data formatting? Decision logic?)
• What are the outputs? (Where does the result go?)
• What error handling exists? (What if an input is missing or malformed?)

This sketch saves hours of rework. Most first-time builders jump straight into the platform and discover halfway through that they haven't thought through a critical step.

<strong>Step 4: Build</strong>

Start with the simplest possible version — the "minimum viable automation." Get the basic flow working end-to-end before adding complexity. Common mistakes at this stage:
• Trying to handle every edge case from the start (ship the happy path first)
• Building complex branching logic before confirming the basic flow works
• Not testing with real data (synthetic test data hides real-world problems)

<strong>Step 5: Test</strong>

Testing no-code tools is different from testing traditional software:
• Run it with real inputs, not just your carefully constructed test case
• Try inputs that are slightly wrong — missing fields, unexpected formats, extra-long text
• Test what happens when a connected service is slow or unavailable
• Check the output quality across 10+ runs, not just one

<strong>Step 6: Iterate</strong>

Your first version won't be perfect. That's expected. After testing, you'll discover:
• Edge cases you didn't anticipate
• Outputs that need formatting adjustments
• Steps that should be reordered
• Conditions that need additional branching

<strong>The Importance of Starting Simple</strong>

The number one reason first-time builders abandon their projects: they tried to build something too ambitious. A working tool that handles 80% of cases is infinitely more valuable than a perfect tool that's never finished. Ship something simple, use it for a week, then improve it based on real experience.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'Your Ideal First Automation',
      content: `Start with a problem you face every week that takes 30+ minutes of repetitive work. That's your ideal first automation candidate. Look for tasks where: you follow the same steps each time, the inputs come from a predictable source, and the output format is consistent. If you can describe the task to a colleague in under 60 seconds, a no-code tool can probably handle it.`
    },
    {
      type: 'activity',
      activityId: 'main-lab-build'
    },
    {
      type: 'content',
      title: 'Risk Assessment for AI Tools',
      content: `<strong>Why Risk Assessment Happens BEFORE Deployment — Not After</strong>

Here's a pattern that causes real harm: someone builds an AI tool, gets excited that it works, deploys it immediately, and discovers the risks only when something goes wrong. By then, the damage is done — data has leaked, wrong decisions have been made, or users have been harmed.

Risk assessment is not a bureaucratic checkbox. It's the difference between a tool that creates value and a tool that creates an incident report.

<strong>The 4 Categories of Risk</strong>

Every AI tool — whether it's a simple automation or a complex agent — carries risk in four categories. You must assess all four before deploying to real users.

<strong>1. Data Privacy</strong>

What data does your tool access, process, or store? Key questions:
• What personal or sensitive information flows through the tool?
• Where is that data sent? (Third-party APIs? Cloud services? AI model providers?)
• Who can see the data at each stage of processing?
• Is the data retained anywhere after processing?
• Does data handling comply with relevant regulations (GDPR, HIPAA, internal policies)?

<em>Real example of failure:</em> A team built an AI meeting summarizer that sent full meeting transcripts to a consumer AI API. Those transcripts contained employee names, performance discussions, salary negotiations, and client contract details. The API provider's terms of service allowed them to use input data for model training. Sensitive company information was potentially exposed to model training pipelines with no way to retrieve it.

<strong>2. Failure Modes</strong>

What happens when your tool doesn't work correctly? Key questions:
• What if the AI generates wrong output? What's the downstream impact?
• What if a connected service is unavailable? Does the tool fail gracefully or catastrophically?
• What if input data is malformed, missing, or unexpectedly large?
• Is there a fallback when the tool fails? Can work still get done manually?
• How will you know when it fails? (Monitoring, alerts, error logging)

<em>Real example of failure:</em> An automated customer response system had no fallback for when the AI couldn't understand a query. Instead of escalating to a human, it generated a confident-sounding response that was completely unrelated to the customer's issue. Customers received nonsensical answers and escalated their complaints — creating more work than the tool saved.

<strong>3. Unintended Outputs</strong>

AI systems can produce outputs you never anticipated. Key questions:
• Could the AI generate offensive, biased, or harmful content?
• Could outputs be misleading even if technically accurate? (True but missing critical context)
• What happens if adversarial users intentionally try to manipulate the tool?
• Are there scenarios where correct-looking output leads to wrong decisions?
• Could the tool be used for purposes you didn't intend?

<em>Real example of failure:</em> A company deployed an AI tool that generated job descriptions. The tool consistently used gendered language that discouraged female applicants — phrases like "dominant personality" and "competitive warrior mindset" appeared in the outputs. The bias wasn't in the instructions; it was in the patterns the AI learned from historical job postings. The company didn't discover this until their applicant diversity metrics dropped 25%.

<strong>4. Access Control</strong>

Who can use your tool, and what can they do with it? Key questions:
• Who should have access to this tool? Who shouldn't?
• Can users access data through the tool that they shouldn't normally see?
• What prevents misuse by authorized users? (Rate limits, audit logs, usage monitoring)
• If the tool has admin functions, are they properly restricted?
• Could a compromised account use this tool to cause escalated damage?

<em>Real example of failure:</em> An internal AI assistant was deployed to help employees find information across company systems. The tool had the same database access as an admin — meaning any employee could ask it questions that revealed information above their access level. An intern asked "What's the CEO's compensation package?" and got a detailed answer because the tool had no concept of information access tiers.

<strong>Why Risk Assessment Must Happen Before Deployment</strong>

Each of these failures has something in common: the risk was obvious in hindsight but not assessed before deployment. The builders were focused on "Does it work?" without asking "What could go wrong?"

Post-deployment risk discovery means:
• Real people have already been affected
• Real data has already been exposed
• Real decisions have already been made on bad information
• Trust has already been damaged
• The fix is reactive (damage control) rather than proactive (prevention)

Pre-deployment risk assessment costs 30 minutes of structured thinking. Post-deployment incident response costs days, weeks, or permanent reputation damage.`
    },
    {
      type: 'content',
      title: 'The Risk Review Framework',
      content: `<strong>How to Systematically Assess Each Risk Category</strong>

A good risk assessment isn't just "think about what could go wrong." It's a structured process that ensures you consider each category thoroughly, rate the severity honestly, and make deliberate decisions about what's acceptable.

<strong>The Assessment Process</strong>

For each of the 4 risk categories (Data Privacy, Failure Modes, Unintended Outputs, Access Control), work through these steps:

<em>1. Identify specific risks</em> — What concrete things could go wrong in this category? Be specific, not general. "Data could leak" is too vague. "Employee email addresses in the input are sent to OpenAI's API which may retain them for 30 days" is actionable.

<em>2. Assess likelihood</em> — How probable is this risk? Is it an edge case that requires unusual circumstances, or is it something that will definitely happen eventually? Consider both normal operation and adversarial scenarios.

<em>3. Assess impact</em> — If this risk materializes, how bad is the consequence? A wrong formatting in an internal report is low impact. A data breach of customer financial information is catastrophic.

<em>4. Rate overall severity</em> — Combine likelihood and impact:
• <strong>Low:</strong> Unlikely to occur AND consequences are minor if it does. Example: AI formats a date incorrectly in an internal draft.
• <strong>Medium:</strong> Reasonably likely OR consequences are significant (but not catastrophic). Example: AI occasionally generates slightly biased language in customer communications.
• <strong>High:</strong> Likely to occur AND/OR consequences are severe. Example: Sensitive data is sent to a third-party API without user awareness.

<strong>Decision Framework by Severity</strong>

<em>Low risk:</em> Accept and monitor. Document the risk, deploy the tool, and check periodically that the risk hasn't escalated.

<em>Medium risk:</em> This is the critical decision point. Medium risks require one of two responses:
• <strong>Mitigate</strong> — Can you reduce the risk to Low with a specific change? (Add a content filter, restrict access, add human review step) If yes, implement the mitigation and deploy.
• <strong>Accept with conditions</strong> — If mitigation isn't practical, you can accept the risk but with explicit conditions: monitoring is in place, a human reviews output before it reaches end users, usage is limited to specific scenarios, and there's a kill switch if problems emerge.

<em>High risk:</em> Do not deploy until the risk is reduced. High risk in any single category is a blocker. Options:
• Redesign the tool to eliminate the risk
• Add safeguards that reduce severity to Medium
• Restrict the tool's scope to scenarios where the risk doesn't apply
• Decide not to deploy — some tools shouldn't exist

<strong>Questions to Ask in Each Category</strong>

<em>Data Privacy:</em>
• "If I showed the data flow diagram to our privacy team, would they approve?"
• "What's the worst thing that could happen if all the data this tool processes became public?"
• "Am I sending data to any service I haven't personally reviewed the privacy policy for?"

<em>Failure Modes:</em>
• "What happens to the user's workflow if this tool is completely unavailable for 24 hours?"
• "If the AI generates completely wrong output, will anyone catch it before it causes harm?"
• "Is there a manual fallback for every automated step?"

<em>Unintended Outputs:</em>
• "Have I tested this with inputs that a creative teenager would try?"
• "Could someone use this tool in a way I didn't intend that would cause harm?"
• "If I put this tool in front of 100 diverse users, would any of them receive offensive or biased output?"

<em>Access Control:</em>
• "Does this tool give users access to anything they wouldn't have without it?"
• "If a user's account was compromised, what could an attacker do with this tool?"
• "Is there an audit trail of who uses this tool and what they do with it?"

<strong>Documenting Your Assessment</strong>

Write down your assessment. Don't just think about it — document it. This serves three purposes:
1. It forces you to be specific (vague risks in your head become concrete risks on paper)
2. It creates accountability (you've explicitly acknowledged and accepted certain risks)
3. It enables review (others can evaluate your risk assessment and catch blind spots)

The risk review exercise that follows gives you practice with this exact process — assessing a peer's tool across all four categories.`
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'The Simplest Agent Can Cause the Most Damage',
      content: `The simplest AI agent can cause the most damage if it has access to the wrong data or can take actions without human approval. A complex agent with proper guardrails is safer than a simple one deployed without any risk assessment. Before you deploy anything — no matter how small — ask: "What's the worst this could do if it malfunctions?" If the answer makes you uncomfortable, add a human-in-the-loop step.`
    },
    {
      type: 'activity',
      activityId: 'mini-lab-risk-review'
    },
    {
      type: 'activity',
      activityId: 'module9-quiz'
    },
    {
      type: 'activity',
      activityId: 'module9-feedback'
    }
  ],
  activities: [
    {
      id: 'main-lab-build',
      title: 'Main Lab (Build)',
      type: 'form',
      description: 'Design a simple tool or agent using a no-code builder. Document your purpose, platform choice, design, build progress, and testing notes.',
      fields: [
        {
          id: 'purpose',
          label: 'Tool or Agent Purpose',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Describe the purpose of the tool or agent you are building...'
        },
        {
          id: 'platform',
          label: 'Platform or Builder Used',
          type: 'text',
          maxLength: 200,
          minLength: 1,
          required: true,
          placeholder: 'Name the no-code platform or builder you are using...'
        },
        {
          id: 'design-description',
          label: 'Design Description',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          required: true,
          placeholder: 'Describe the design of your tool or agent — inputs, outputs, logic flow...'
        },
        {
          id: 'build-status',
          label: 'Build Status',
          type: 'select',
          required: true,
          options: [
            { value: '', label: '— Select status —' },
            { value: 'Not Started', label: 'Not Started' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' }
          ]
        },
        {
          id: 'testing-notes',
          label: 'Testing Notes',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          required: true,
          placeholder: 'Document how you tested the tool — what worked, what did not, edge cases tried...'
        }
      ],
      completionRule: 'all_fields_filled'
    },
    {
      id: 'mini-lab-risk-review',
      title: 'Mini-lab (Risk Review)',
      type: 'form',
      description: 'Review a partner\'s build design and assess risks across four categories. Each category requires a risk level and supporting notes.',
      prerequisite: 'main-lab-build',
      prerequisiteMessage: 'You must submit your Main Lab build design before accessing the risk review partner exchange.',
      partnerAssignment: 'round-robin',
      fields: [
        {
          id: 'risk-data-privacy-level',
          label: 'Data Privacy — Risk Level',
          type: 'select',
          required: true,
          category: 'Data Privacy',
          options: [
            { value: '', label: '— Select risk level —' },
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' }
          ]
        },
        {
          id: 'risk-data-privacy-notes',
          label: 'Data Privacy — Notes',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          category: 'Data Privacy',
          placeholder: 'Explain data privacy risks — what data is collected, stored, or shared...'
        },
        {
          id: 'risk-failure-modes-level',
          label: 'Failure Modes — Risk Level',
          type: 'select',
          required: true,
          category: 'Failure Modes',
          options: [
            { value: '', label: '— Select risk level —' },
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' }
          ]
        },
        {
          id: 'risk-failure-modes-notes',
          label: 'Failure Modes — Notes',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          category: 'Failure Modes',
          placeholder: 'Identify potential failure modes — what could go wrong, edge cases, graceful degradation...'
        },
        {
          id: 'risk-unintended-outputs-level',
          label: 'Unintended Outputs — Risk Level',
          type: 'select',
          required: true,
          category: 'Unintended Outputs',
          options: [
            { value: '', label: '— Select risk level —' },
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' }
          ]
        },
        {
          id: 'risk-unintended-outputs-notes',
          label: 'Unintended Outputs — Notes',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          category: 'Unintended Outputs',
          placeholder: 'Assess unintended output risks — hallucinations, bias, harmful content, off-topic responses...'
        },
        {
          id: 'risk-access-control-level',
          label: 'Access Control — Risk Level',
          type: 'select',
          required: true,
          category: 'Access Control',
          options: [
            { value: '', label: '— Select risk level —' },
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' }
          ]
        },
        {
          id: 'risk-access-control-notes',
          label: 'Access Control — Notes',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          category: 'Access Control',
          placeholder: 'Evaluate access control risks — who can use the tool, authentication, authorisation, misuse potential...'
        }
      ],
      riskCategories: ['Data Privacy', 'Failure Modes', 'Unintended Outputs', 'Access Control'],
      completionRule: 'all_fields_filled'
    },
    {
      id: 'module9-quiz',
      title: 'Quick Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of no-code building and AI risk assessment. These questions focus on practical judgment, not memorization.',
      questions: [
        {
          id: 'q1',
          text: 'What is the key difference between an AI chatbot and an AI agent?',
          options: [
            { id: 'a', text: 'Agents are more expensive to run than chatbots' },
            { id: 'b', text: 'Agents take actions in external systems; chatbots only generate text responses' },
            { id: 'c', text: 'Chatbots use older AI models while agents use newer ones' },
            { id: 'd', text: 'Agents can only be built by professional developers' }
          ],
          correctAnswer: 'b',
          explanation: 'The fundamental distinction is action vs. response. A chatbot generates text — you ask, it answers. An agent takes actions: sending emails, moving data, triggering workflows, making decisions that affect external systems. This difference is what makes agents more powerful and more risky.'
        },
        {
          id: 'q2',
          text: 'Your team wants to automate a complex, high-stakes financial approval workflow that requires integration with 8 different internal systems and handles sensitive client data. What\'s the best approach?',
          options: [
            { id: 'a', text: 'Build it entirely with Zapier — no-code can handle anything' },
            { id: 'b', text: 'Use a Custom GPT since it involves decision-making' },
            { id: 'c', text: 'This likely needs professional developers — no-code tools have limits for complex, high-stakes, multi-system integrations with sensitive data' },
            { id: 'd', text: 'Start with no-code and hope it scales' }
          ],
          correctAnswer: 'c',
          explanation: 'No-code tools are powerful but have limits. Complex multi-system integrations with high-stakes decisions and sensitive data typically require professional development for proper error handling, security, auditing, and reliability. Knowing when no-code isn\'t appropriate is as important as knowing when it is.'
        },
        {
          id: 'q3',
          text: 'Which of the following is NOT one of the 4 risk assessment categories for AI tools?',
          options: [
            { id: 'a', text: 'Data Privacy' },
            { id: 'b', text: 'Failure Modes' },
            { id: 'c', text: 'Development Cost' },
            { id: 'd', text: 'Access Control' }
          ],
          correctAnswer: 'c',
          explanation: 'The 4 risk categories are: Data Privacy, Failure Modes, Unintended Outputs, and Access Control. Development cost is a business consideration but not a safety risk category. Risk assessment focuses on what could go wrong for users and data, not how much it costs to build.'
        },
        {
          id: 'q4',
          text: 'Your risk assessment rates "Data Privacy" as High for your AI tool. What should you do?',
          options: [
            { id: 'a', text: 'Deploy anyway but monitor closely' },
            { id: 'b', text: 'Do not deploy until the risk is reduced — High risk in any category is a deployment blocker' },
            { id: 'c', text: 'Ask your manager to accept the risk on your behalf' },
            { id: 'd', text: 'Add a disclaimer to the tool warning users about the privacy risk' }
          ],
          correctAnswer: 'b',
          explanation: 'High risk in any single category is a blocker for deployment. You must either redesign the tool to eliminate the risk, add safeguards that reduce severity to Medium, restrict the tool\'s scope, or decide not to deploy. Monitoring doesn\'t prevent harm — it only detects it after it happens.'
        },
        {
          id: 'q5',
          text: 'You build an AI tool that generates perfect summaries in all your tests. You deploy it to your team. Within a week, users report the tool is producing biased summaries that emphasize contributions from certain team members while minimizing others. What went wrong?',
          options: [
            { id: 'a', text: 'The AI model was updated after deployment' },
            { id: 'b', text: 'Testing didn\'t cover the diversity of real-world inputs — the tool worked in controlled conditions but failed with the variety of actual usage patterns' },
            { id: 'c', text: 'Users are using the tool incorrectly' },
            { id: 'd', text: 'The no-code platform has a bug' }
          ],
          correctAnswer: 'b',
          explanation: 'This is a classic "works in testing, fails in production" scenario. Testing with controlled inputs doesn\'t reveal how the tool behaves with the full variety of real-world data. The Unintended Outputs risk category specifically addresses this — AI tools can produce biased or harmful content when exposed to inputs that weren\'t represented in testing.'
        }
      ]
    },
    {
      id: 'module9-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Reflect on your experience building without code and assessing risks. This helps solidify your learning and gives your facilitator valuable feedback.',
      fields: [
        { id: 'build-experience', label: 'What was your experience designing and building your tool? What surprised you about the process?', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'Reflect on the build process — what was easier or harder than expected?' },
        { id: 'risk-insight', label: 'What did you learn from the risk assessment process? Did reviewing a peer\'s tool reveal blind spots?', type: 'textarea', maxLength: 500, minLength: 1, placeholder: 'What risks did you discover that you hadn\'t initially considered?' },
        { id: 'next-build', label: 'What\'s the next tool or automation you want to build after this course?', type: 'textarea', maxLength: 300, minLength: 1, placeholder: 'Describe the next real-world automation you plan to create...' }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module9);

export default module9;
