/**
 * Module 4: Privacy and Responsible Use
 *
 * Activities:
 *   1. Triage Exercise — classify workplace data scenarios for AI safety
 *   2. Safe Prompt Writing — rewrite sensitive snippets into safe prompts
 *   3. Module Quiz — 5-question knowledge check on data privacy and responsible use
 *   4. Reflection & Feedback — structured reflection entries
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { registerModule } from '../core/module-registry.js';

const module4 = {
  id: 'module4',
  title: 'Privacy and Responsible Use',
  description: 'Navigate the privacy and ethical landscape of AI use — learn what to share, what to protect, and how to build responsible habits.',
  sections: [
    {
      type: 'content',
      title: 'Welcome to Module 4',
      content: `This module is about the decisions you make <em>before</em> you hit Enter. Every time you paste text into an AI tool, you're making a data governance decision — whether you realize it or not.

<strong>By the end of this module, you'll be able to:</strong>

• Classify data sensitivity using a practical three-tier framework
• Anonymize content effectively — preserving utility while eliminating risk
• Understand what organizational AI governance looks like (and why your company cares)
• Build professional judgment about what belongs in an AI prompt and what doesn't

This isn't about fear. It's about <strong>professional risk management</strong>. The same way you wouldn't CC a competitor on an internal email, you shouldn't paste confidential data into an external AI tool. The difference is that the email mistake is obvious — the AI mistake often isn't.`
    },
    {
      type: 'content',
      title: 'The Data You\'re Feeding AI',
      content: `Every prompt you type is data transmitted to an external server. Let that sink in for a moment.

<strong>What happens to your input:</strong>

When you paste text into a consumer AI tool (ChatGPT Free, Claude Free, Gemini), here's what typically occurs:

• <strong>Data transmission:</strong> Your text travels over the internet to servers you don't control
• <strong>Storage:</strong> Most providers store your conversations — sometimes for 30 days, sometimes indefinitely
• <strong>Potential training use:</strong> Free-tier tools often reserve the right to use your inputs for model training (opt-out may be available, but it's not the default)
• <strong>Jurisdiction:</strong> Your data may be stored in a different country, subject to different legal frameworks
• <strong>Staff access:</strong> Provider employees may review conversations for safety monitoring or model improvement

<strong>Real consequences from AI data misuse:</strong>

• Samsung engineers pasted proprietary source code into ChatGPT in 2023 — the company subsequently banned AI tools and faced potential trade secret exposure
• Lawyers have submitted AI-generated briefs containing fabricated case citations, exposing confidential client strategy in the process
• Companies have discovered internal financial projections appearing in AI training data through prompt injection attacks

<strong>The uncomfortable truth:</strong> Unlike an email you accidentally sent to the wrong person, you often can't tell when your AI-submitted data has been compromised. There's no "unsubmit" button.

Enterprise AI tools (ChatGPT Enterprise, Azure OpenAI, AWS Bedrock) typically offer stronger data protections — no training on your data, data residency controls, and compliance certifications. But even with enterprise tools, the <em>content</em> you submit still matters. A data breach at the provider level would expose whatever you pasted in.`
    },
    {
      type: 'content',
      title: 'The Classification Framework',
      content: `Not all data carries the same risk. The key skill is <strong>rapid classification</strong> — knowing instantly whether something is safe to paste, needs cleaning first, or should never touch an AI tool.

<strong>Tier 1: Safe (Green Light)</strong>

This is information that's already public or carries no sensitivity. Paste freely.

• Published press releases, blog posts, and marketing materials
• Generic templates and boilerplate text
• Publicly available industry information
• Your own creative writing or brainstorming notes (with no client references)
• Open-source code and public documentation
• General knowledge questions ("How do I structure a project plan?")

<strong>Tier 2: Requires Redaction (Yellow Light)</strong>

This is useful content that's mixed with identifying details. You can use it — but you need to clean it first.

• Client emails where the task is useful but names/companies are identifiable
• Internal process documents that reference specific people or projects
• Performance data with employee names attached
• Financial requests that include specific figures and vendor names
• Meeting notes that reference individuals and their opinions
• Code snippets that contain API keys, internal URLs, or proprietary business logic

<strong>Tier 3: Must Avoid (Red Light)</strong>

This content is too sensitive to submit, even anonymized. The risk isn't worth it.

• Trade secrets and proprietary algorithms that define your competitive advantage
• Material under NDA — the NDA likely prohibits disclosure to third-party services
• Health records, medical information, or disability status of employees
• Legal proceedings, litigation strategy, or regulatory investigation details
• Authentication credentials, API keys, passwords, or access tokens
• Unreleased financial results or material non-public information (MNPI)
• Content where the <em>scenario itself</em> is so specific that anonymization doesn't help

<strong>The decision rule:</strong> When in doubt, move one tier stricter. It's always safer to over-protect than to under-protect.`
    },
    {
      type: 'content',
      title: 'Anonymization Techniques That Actually Work',
      content: `Anonymization isn't just "remove the names." It's about systematically stripping identifying information while preserving enough context for the AI to help you.

<strong>Technique 1: Replace Names with Roles</strong>

<em>Before:</em> "Sarah Chen from Marketing sent a complaint about James Rodriguez in Engineering not delivering the API documentation on time."
<em>After:</em> "A team member from the marketing department raised a concern about a colleague in engineering not delivering technical documentation on schedule."

<strong>Technique 2: Remove Specific Financial Figures</strong>

<em>Before:</em> "Our Q3 revenue was $4.7M, which is $800K below target. The enterprise sales team closed only 3 of 12 pipeline deals."
<em>After:</em> "Our quarterly revenue was significantly below target. The enterprise sales team closed roughly 25% of pipeline deals."

<strong>Technique 3: Generalize Dates and Timelines</strong>

<em>Before:</em> "The incident occurred on March 15, 2024, and affected 847 customers for 6 hours between 2am and 8am PST."
<em>After:</em> "A service incident affected several hundred customers for approximately half a business day."

<strong>Technique 4: Abstract Company-Specific Details</strong>

<em>Before:</em> "Meridian Healthcare's contract with us is worth $2.3M annually. Their CEO, Dr. Patricia Wong, has threatened to move to Competitor X if we don't resolve the billing disputes by June 30."
<em>After:</em> "A major client in the healthcare sector has expressed dissatisfaction with billing issues and is considering switching providers if the situation isn't resolved within the current quarter."

<strong>Technique 5: Preserve the Task, Remove the Context</strong>

The AI doesn't need to know <em>who</em> or <em>which company</em> — it needs to know <em>what kind of task</em> you need help with.

<em>Before:</em> "Write a performance improvement plan for Alex Chen (Employee ID: AC-4421) who has missed 3 deadlines on Project Phoenix and received complaints from clients Acme Corp and GlobalTech."
<em>After:</em> "Write a performance improvement plan for an employee who has missed multiple deadlines on a key project and received client complaints about responsiveness."

The AI produces equally useful output with the anonymized version — and you've exposed zero sensitive data.`
    },
    {
      type: 'callout',
      variant: 'warning',
      title: 'Contextual Re-identification Risk',
      content: `Even anonymized data can be re-identified through context. If the scenario is specific enough that a colleague could identify the people involved, it's not truly anonymized.

Example: "An employee in our 4-person data science team who joined last month and is the only remote worker..." — that's identifiable regardless of whether you removed the name. If your team or situation is small enough to narrow down, add more abstraction or avoid the prompt entirely.`
    },
    {
      type: 'activity',
      activityId: 'triage-exercise'
    },
    {
      type: 'content',
      title: 'The Safe Prompt Pattern',
      content: `Here's a repeatable framework for rewriting any sensitive prompt into a safe one. Follow these four steps every time:

<strong>Step 1: Identify the Task</strong>
What do you actually need AI help with? Separate the <em>task</em> from the <em>data</em>. You need "a resolution email for a billing dispute" — you don't need the AI to know which client or which invoice.

<strong>Step 2: Strip All Identifying Information</strong>
Remove every piece that could identify a person, company, project, or internal system. Names, email addresses, employee IDs, project codenames, client names, specific dollar amounts, dates that narrow down events.

<strong>Step 3: Replace Specifics with Generic Placeholders</strong>
Don't just delete — replace. The AI needs <em>some</em> context to help you effectively.
• "Sarah Chen" → "the team lead" or "Employee A"
• "Meridian Healthcare" → "a healthcare client"
• "$47,250" → "a disputed amount" or "approximately $50K"
• "Project Phoenix" → "a major internal project"
• "March 15, 2024" → "earlier this quarter"

<strong>Step 4: Verify the Prompt Achieves Your Goal</strong>
Read your cleaned prompt. Does it contain enough information for the AI to produce a useful response? If yes, submit it. If not, add back <em>generic</em> context — never the specifics you removed.

<strong>Worked Example:</strong>

<em>Original (unsafe):</em>
"Our client Meridian Healthcare (contact: Sarah Chen, sarah.chen@meridian.com) is disputing invoice #INV-2024-4471 for $47,250. They claim the consulting hours for the ERP migration project were over-reported by 35 hours in March. Draft a resolution email."

<em>Step 1 — The task:</em> Draft a billing dispute resolution email
<em>Step 2 — Strip:</em> Client name, contact name, email, invoice number, exact amount, project name, exact hours, month
<em>Step 3 — Replace:</em>

"A client in the healthcare sector is disputing a consulting invoice. They believe that hours were over-reported on a technology implementation project. Draft a professional resolution email that acknowledges their concern, explains we'll review the timesheet records, and proposes a fair resolution."

<em>Step 4 — Verify:</em> Does this give the AI enough to work with? Yes — it knows the industry, the dispute type, and the tone needed. It doesn't know anything that could identify the client, the amount, or the specific project.`
    },
    {
      type: 'activity',
      activityId: 'safe-prompt-writing'
    },
    {
      type: 'content',
      title: 'Organizational AI Governance — What Your Company Needs',
      content: `You don't need to write your company's AI policy from scratch — but you need to understand what good governance looks like so you can advocate for it, follow it, and recognize when it's missing.

<strong>1. Acceptable Use Policy</strong>
What's the company's position on AI tools? Which tasks are approved? Which are explicitly prohibited? A good policy doesn't just say "be careful" — it gives specific examples and decision criteria.

Key elements: approved use cases, prohibited use cases, consequences for violations, escalation paths for grey areas.

<strong>2. Approved Tool List</strong>
Not all AI tools are equal. Enterprise tools with data protection agreements (DPAs) are fundamentally different from free consumer tools. Your company should maintain a list of:
• Approved tools (with enterprise licenses and data protections)
• Conditionally approved tools (usable for non-sensitive tasks only)
• Prohibited tools (no data protections, unacceptable risk)

<strong>3. Data Classification Guidelines</strong>
The three-tier framework we discussed — but tailored to your company's specific data types. What counts as "confidential" varies significantly between a hospital, a law firm, and a tech startup.

<strong>4. Incident Response for AI Data Leaks</strong>
What happens when someone accidentally pastes confidential data into an AI tool? There should be a clear process:
• Who to notify (data protection officer, security team, manager)
• What documentation to create (what was submitted, which tool, when)
• What remediation steps to take (request deletion from provider, assess exposure)
• Whether regulatory notification is required (GDPR has a 72-hour reporting window)

<strong>5. Training Requirements</strong>
How does your organization ensure everyone understands the policy? One-time training isn't enough — AI tools evolve, policies update, and new employees join. Look for:
• Onboarding training for new staff
• Annual refreshers as policies evolve
• Role-specific guidance (HR handles different data than marketing)
• Easy-to-find quick-reference guides

<strong>If your company doesn't have these yet:</strong> That's common — AI governance is still maturing in most organizations. But it's worth raising with your manager or IT team. You can be the person who starts the conversation.`
    },
    {
      type: 'content',
      title: 'The Regulatory Landscape (2025)',
      content: `You don't need to be a lawyer — but you need to understand <em>why</em> your company cares about AI data handling. Here's the landscape that shapes corporate AI policies:

<strong>GDPR (EU/UK)</strong>
If your company handles data from EU or UK residents, the General Data Protection Regulation applies. Key implications for AI use:
• Personal data submitted to AI tools may constitute a "data transfer" to a third party
• The "right to erasure" means individuals can demand their data be deleted — including from AI systems
• Data processing requires a legal basis — "I wanted AI to help me draft an email" probably isn't one
• Fines can reach 4% of global annual turnover or €20M, whichever is higher

<strong>EU AI Act</strong>
The world's first comprehensive AI regulation, phasing in from 2024-2026:
• Classifies AI systems by risk level (unacceptable, high-risk, limited, minimal)
• High-risk AI systems (HR decisions, credit scoring, etc.) face strict requirements
• Transparency obligations: people must be told when they're interacting with AI
• Doesn't directly regulate <em>users</em> of AI tools — but shapes what tools can offer

<strong>Sector-Specific Rules</strong>
• <strong>Healthcare:</strong> HIPAA (US), patient data has specific protections that AI tools rarely meet
• <strong>Finance:</strong> SOX, PCI-DSS, and banking regulations restrict where financial data can be processed
• <strong>Legal:</strong> Attorney-client privilege may be waived if confidential information is shared with a third-party AI service
• <strong>Government:</strong> Security clearance levels and data classification schemes that prohibit external processing

<strong>The practical takeaway:</strong> Your company's AI policy exists because these regulations create real financial and legal consequences. A single employee pasting the wrong data into the wrong tool can trigger regulatory investigations, mandatory breach notifications, and significant fines. This isn't theoretical — regulators are actively investigating AI-related data breaches.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'The Front Page Test',
      content: `When in doubt, ask: "Would I be comfortable if this prompt appeared on the front page of a newspaper with my name attached?" If the answer is no, rewrite it. This simple gut check catches most privacy mistakes before they happen. It works because it forces you to consider: would this embarrass me, my company, or the people whose data I'm handling?`
    },
    {
      type: 'content',
      title: 'Building an AI Ethics Compass',
      content: `Rules and policies cover 80% of situations. The other 20% require professional judgment — the ability to navigate grey areas where something might be technically allowed but isn't professionally responsible.

<strong>The gap between "allowed" and "responsible":</strong>

• Your company's AI policy might not explicitly prohibit pasting competitor analysis from a confidential industry report — but doing so could damage a business relationship if discovered
• Using AI to draft a reference letter is probably allowed — but submitting it without disclosing AI involvement to the recipient might not be ethical
• Asking AI to summarize a colleague's performance data (anonymized) is technically clean — but if you're using it to build a case against them without their knowledge, the intent matters

<strong>Developing your compass:</strong>

1. <strong>Consider the stakeholders:</strong> Who could be affected by this data being exposed? Clients? Colleagues? Patients? If anyone could be harmed, that weighs heavily.

2. <strong>Apply the reversibility test:</strong> If this data were leaked or misused, could the damage be undone? Financial data can be changed; reputation damage and trust violations often can't be reversed.

3. <strong>Think about accumulation:</strong> One anonymized prompt might be safe. But submitting 50 anonymized prompts about the same project over a month might create a pattern that an AI provider could theoretically reconstruct.

4. <strong>Default to transparency:</strong> If you'd be uncomfortable explaining your AI usage to your manager, your client, or the person whose data you're handling — that discomfort is information. Listen to it.

<strong>The professional standard:</strong> The question isn't "will I get caught?" It's "am I treating other people's data with the same care I'd want applied to my own?" Privacy is ultimately about respect — for colleagues, clients, and the trust they've placed in your organization.`
    },
    {
      type: 'activity',
      activityId: 'module4-quiz'
    },
    {
      type: 'activity',
      activityId: 'module4-feedback'
    }
  ],
  activities: [
    {
      id: 'triage-exercise',
      title: 'Data Triage Exercise',
      type: 'scenario_classification',
      description: 'Review each workplace data scenario and classify whether it is safe to paste into an AI tool, requires redaction first, or must be avoided entirely. Justify each classification using the three-tier framework.',
      scenarios: [
        {
          id: 'scenario-1',
          text: 'A spreadsheet containing customer names, email addresses, and their recent purchase history that you need to analyse for sales trends.',
          fields: [
            {
              id: 'scenario-1-display',
              type: 'readonly_display',
              content: 'A spreadsheet containing customer names, email addresses, and their recent purchase history that you need to analyse for sales trends.'
            },
            {
              id: 'scenario-1-classification',
              label: 'Classification',
              type: 'select',
              required: true,
              options: [
                { value: '', label: '— Select classification —' },
                { value: 'safe', label: 'Safe to paste' },
                { value: 'redaction', label: 'Requires redaction' },
                { value: 'avoid', label: 'Must avoid' }
              ]
            },
            {
              id: 'scenario-1-justification',
              label: 'Justification',
              type: 'textarea',
              minLength: 10,
              maxLength: 500,
              required: true
            }
          ]
        },
        {
          id: 'scenario-2',
          text: 'Meeting notes from a team standup that mention a colleague is taking medical leave for a chronic health condition and will be absent for six weeks.',
          fields: [
            {
              id: 'scenario-2-display',
              type: 'readonly_display',
              content: 'Meeting notes from a team standup that mention a colleague is taking medical leave for a chronic health condition and will be absent for six weeks.'
            },
            {
              id: 'scenario-2-classification',
              label: 'Classification',
              type: 'select',
              required: true,
              options: [
                { value: '', label: '— Select classification —' },
                { value: 'safe', label: 'Safe to paste' },
                { value: 'redaction', label: 'Requires redaction' },
                { value: 'avoid', label: 'Must avoid' }
              ]
            },
            {
              id: 'scenario-2-justification',
              label: 'Justification',
              type: 'textarea',
              minLength: 10,
              maxLength: 500,
              required: true
            }
          ]
        },
        {
          id: 'scenario-3',
          text: 'A confidential product roadmap from an internal planning session that outlines unreleased features, projected timelines, and competitive positioning for the next fiscal year.',
          fields: [
            {
              id: 'scenario-3-display',
              type: 'readonly_display',
              content: 'A confidential product roadmap from an internal planning session that outlines unreleased features, projected timelines, and competitive positioning for the next fiscal year.'
            },
            {
              id: 'scenario-3-classification',
              label: 'Classification',
              type: 'select',
              required: true,
              options: [
                { value: '', label: '— Select classification —' },
                { value: 'safe', label: 'Safe to paste' },
                { value: 'redaction', label: 'Requires redaction' },
                { value: 'avoid', label: 'Must avoid' }
              ]
            },
            {
              id: 'scenario-3-justification',
              label: 'Justification',
              type: 'textarea',
              minLength: 10,
              maxLength: 500,
              required: true
            }
          ]
        },
        {
          id: 'scenario-4',
          text: 'A team email thread about organising a Friday afternoon social event, including suggestions for venues, dietary preferences, and a vote on timing.',
          fields: [
            {
              id: 'scenario-4-display',
              type: 'readonly_display',
              content: 'A team email thread about organising a Friday afternoon social event, including suggestions for venues, dietary preferences, and a vote on timing.'
            },
            {
              id: 'scenario-4-classification',
              label: 'Classification',
              type: 'select',
              required: true,
              options: [
                { value: '', label: '— Select classification —' },
                { value: 'safe', label: 'Safe to paste' },
                { value: 'redaction', label: 'Requires redaction' },
                { value: 'avoid', label: 'Must avoid' }
              ]
            },
            {
              id: 'scenario-4-justification',
              label: 'Justification',
              type: 'textarea',
              minLength: 10,
              maxLength: 500,
              required: true
            }
          ]
        },
        {
          id: 'scenario-5',
          text: 'A spreadsheet from HR containing employee names, job titles, annual salary figures, bonus amounts, and performance ratings for the entire department.',
          fields: [
            {
              id: 'scenario-5-display',
              type: 'readonly_display',
              content: 'A spreadsheet from HR containing employee names, job titles, annual salary figures, bonus amounts, and performance ratings for the entire department.'
            },
            {
              id: 'scenario-5-classification',
              label: 'Classification',
              type: 'select',
              required: true,
              options: [
                { value: '', label: '— Select classification —' },
                { value: 'safe', label: 'Safe to paste' },
                { value: 'redaction', label: 'Requires redaction' },
                { value: 'avoid', label: 'Must avoid' }
              ]
            },
            {
              id: 'scenario-5-justification',
              label: 'Justification',
              type: 'textarea',
              minLength: 10,
              maxLength: 500,
              required: true
            }
          ]
        },
        {
          id: 'scenario-6',
          text: 'A draft of a public company announcement about a new sustainability initiative, which has already been approved by legal and communications for external release.',
          fields: [
            {
              id: 'scenario-6-display',
              type: 'readonly_display',
              content: 'A draft of a public company announcement about a new sustainability initiative, which has already been approved by legal and communications for external release.'
            },
            {
              id: 'scenario-6-classification',
              label: 'Classification',
              type: 'select',
              required: true,
              options: [
                { value: '', label: '— Select classification —' },
                { value: 'safe', label: 'Safe to paste' },
                { value: 'redaction', label: 'Requires redaction' },
                { value: 'avoid', label: 'Must avoid' }
              ]
            },
            {
              id: 'scenario-6-justification',
              label: 'Justification',
              type: 'textarea',
              minLength: 10,
              maxLength: 500,
              required: true
            }
          ]
        }
      ],
      completionRule: 'all_scenarios_classified'
    },
    {
      id: 'safe-prompt-writing',
      title: 'Safe Prompt Writing',
      type: 'snippet_rewrite',
      description: 'Each snippet below contains sensitive workplace information. Rewrite it as a safe prompt that achieves the same goal without exposing private data. Then describe how you would verify the AI output is useful and doesn\'t reference any sensitive details.',
      snippets: [
        {
          id: 'snippet-1',
          text: 'Our client Meridian Healthcare (contact: Sarah Chen, sarah.chen@meridian.com) is disputing invoice #INV-2024-4471 for $47,250. They claim the consulting hours for the ERP migration project were over-reported by 35 hours in March. Please draft a resolution email that acknowledges the concern and proposes a credit.',
          fields: [
            {
              id: 'snippet-1-display',
              type: 'readonly_display',
              content: 'Our client Meridian Healthcare (contact: Sarah Chen, sarah.chen@meridian.com) is disputing invoice #INV-2024-4471 for $47,250. They claim the consulting hours for the ERP migration project were over-reported by 35 hours in March. Please draft a resolution email that acknowledges the concern and proposes a credit.'
            },
            {
              id: 'snippet-1-prompt',
              label: 'Safe Prompt Formulation',
              type: 'textarea',
              minLength: 10,
              maxLength: 1000,
              required: true
            },
            {
              id: 'snippet-1-verification',
              label: 'Verification Plan',
              type: 'textarea',
              minLength: 10,
              maxLength: 1000,
              required: true
            }
          ]
        },
        {
          id: 'snippet-2',
          text: 'Team performance review notes: James Rodriguez (Employee ID: JR-4892) received a rating of 2/5 this quarter. Key issues include three missed deadlines on the Athena project, two client complaints about response time, and an unresolved conflict with his line manager about remote working arrangements. Prepare talking points for his performance improvement meeting.',
          fields: [
            {
              id: 'snippet-2-display',
              type: 'readonly_display',
              content: 'Team performance review notes: James Rodriguez (Employee ID: JR-4892) received a rating of 2/5 this quarter. Key issues include three missed deadlines on the Athena project, two client complaints about response time, and an unresolved conflict with his line manager about remote working arrangements. Prepare talking points for his performance improvement meeting.'
            },
            {
              id: 'snippet-2-prompt',
              label: 'Safe Prompt Formulation',
              type: 'textarea',
              minLength: 10,
              maxLength: 1000,
              required: true
            },
            {
              id: 'snippet-2-verification',
              label: 'Verification Plan',
              type: 'textarea',
              minLength: 10,
              maxLength: 1000,
              required: true
            }
          ]
        },
        {
          id: 'snippet-3',
          text: 'Budget proposal for Q3: The marketing team (led by Director Priya Patel) is requesting $125,000 for the autumn campaign targeting the ANZ region. This includes $40,000 for influencer partnerships with @TechReviewsAU and @DigitalNomadNZ, $55,000 for paid search, and $30,000 for event sponsorship at SydneyTech Summit. Summarise this for the CFO.',
          fields: [
            {
              id: 'snippet-3-display',
              type: 'readonly_display',
              content: 'Budget proposal for Q3: The marketing team (led by Director Priya Patel) is requesting $125,000 for the autumn campaign targeting the ANZ region. This includes $40,000 for influencer partnerships with @TechReviewsAU and @DigitalNomadNZ, $55,000 for paid search, and $30,000 for event sponsorship at SydneyTech Summit. Summarise this for the CFO.'
            },
            {
              id: 'snippet-3-prompt',
              label: 'Safe Prompt Formulation',
              type: 'textarea',
              minLength: 10,
              maxLength: 1000,
              required: true
            },
            {
              id: 'snippet-3-verification',
              label: 'Verification Plan',
              type: 'textarea',
              minLength: 10,
              maxLength: 1000,
              required: true
            }
          ]
        }
      ],
      completionRule: 'all_snippets_completed'
    },
    {
      id: 'module4-quiz',
      title: 'Privacy & Responsible Use Quiz',
      type: 'quiz',
      description: 'Test your understanding of data privacy principles, classification frameworks, and responsible AI use with these scenario-based questions.',
      questions: [
        {
          id: 'q1',
          text: 'What happens to text you paste into consumer AI tools like ChatGPT Free?',
          options: [
            { id: 'a', text: 'It is processed and immediately deleted — nothing is stored' },
            { id: 'b', text: 'It may be stored on the provider\'s servers and potentially used for model training' },
            { id: 'c', text: 'It is encrypted and only visible to you — no one else can access it' },
            { id: 'd', text: 'It is automatically anonymized before being processed by the model' }
          ],
          correctAnswer: 'b',
          explanation: 'Consumer AI tools typically store your inputs for varying periods and may use them to improve their models. Free-tier services often include this in their terms of service. Enterprise tools usually offer opt-out from training use, but consumer tools generally default to retention and potential training use. Always assume your input is stored unless you have explicit contractual guarantees otherwise.'
        },
        {
          id: 'q2',
          text: 'A colleague wants to use AI to draft performance feedback for their direct reports. What\'s the safe approach?',
          options: [
            { id: 'a', text: 'Paste the full performance review including names — it\'s an internal HR document' },
            { id: 'b', text: 'Anonymize names and identifying details, use generic role descriptions, and focus on the type of feedback needed' },
            { id: 'c', text: 'Only use AI for positive feedback — negative feedback is too sensitive' },
            { id: 'd', text: 'Avoid AI entirely for any HR-related task' }
          ],
          correctAnswer: 'b',
          explanation: 'AI can be extremely helpful for structuring performance feedback — you just need to strip identifying details first. Replace "Sarah in Marketing" with "a team member in a client-facing role." The AI doesn\'t need to know who the person is to help you articulate constructive feedback clearly. This gives you useful output while protecting employee privacy.'
        },
        {
          id: 'q3',
          text: 'Which of the following is safe to paste into a public AI tool without any modification?',
          options: [
            { id: 'a', text: 'An internal email thread discussing a client\'s contract renewal' },
            { id: 'b', text: 'A public press release that has already been approved for external distribution' },
            { id: 'c', text: 'Meeting notes that mention team members by name and their project assignments' },
            { id: 'd', text: 'A draft budget proposal with specific vendor names and pricing' }
          ],
          correctAnswer: 'b',
          explanation: 'A press release that has been approved for external distribution is, by definition, public information. It\'s already intended for the world to see, so pasting it into an AI tool creates no additional exposure. All other options contain either personally identifiable information, confidential business details, or internal information not intended for external parties.'
        },
        {
          id: 'q4',
          text: 'What\'s the key difference between "requires redaction" and "must avoid" classifications?',
          options: [
            { id: 'a', text: 'Redaction is for small files; avoid is for large files' },
            { id: 'b', text: 'Redaction means the content is useful and can be cleaned of identifying details; avoid means the content is too sensitive to submit even when anonymized' },
            { id: 'c', text: 'Redaction is for text; avoid is for images and files' },
            { id: 'd', text: 'There is no meaningful difference — both mean you should be careful' }
          ],
          correctAnswer: 'b',
          explanation: 'The distinction is about whether anonymization can adequately reduce the risk. "Requires redaction" content has useful information mixed with identifying details that can be stripped out — after cleaning, it\'s safe to submit. "Must avoid" content is inherently sensitive regardless of anonymization — trade secrets, legal proceedings, health records, or credentials. No amount of name-swapping makes these safe for external AI tools.'
        },
        {
          id: 'q5',
          text: 'Scenario: You\'ve anonymized a prompt about a workplace conflict, replacing all names with generic labels. However, the situation describes a unique project with only three team members, and the conflict involves the only remote worker on the team. A colleague reading this prompt could easily identify the people involved. Is this safe to submit?',
          options: [
            { id: 'a', text: 'Yes — the names are removed, so it\'s properly anonymized' },
            { id: 'b', text: 'Yes — as long as you trust the AI provider\'s privacy policy' },
            { id: 'c', text: 'No — contextual re-identification is still a privacy risk, even without names' },
            { id: 'd', text: 'It depends on whether the AI tool has an enterprise license' }
          ],
          correctAnswer: 'c',
          explanation: 'Anonymization isn\'t just about removing names — it\'s about making individuals unidentifiable. If the scenario is specific enough that someone familiar with your workplace could figure out who\'s involved (small team, unique role, distinctive project), then the data isn\'t truly anonymized. You need to either add more abstraction (generalize the team size, remove the remote-work detail) or avoid submitting the prompt entirely.'
        }
      ]
    },
    {
      id: 'module4-feedback',
      title: 'Reflection & Next Steps',
      type: 'structured_entries',
      description: 'Reflect on how this module changes your approach to AI tools. These reflections help solidify your learning and create personal accountability.',
      fields: [
        {
          id: 'biggest-risk',
          label: 'What\'s the biggest data privacy risk in your current AI usage that you weren\'t fully aware of before this module?',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          placeholder: 'Think about the prompts you\'ve submitted recently — was there anything that should have been anonymized or avoided?'
        },
        {
          id: 'first-change',
          label: 'What\'s the first concrete change you\'ll make to how you use AI tools starting today?',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          placeholder: 'Be specific — a vague "I\'ll be more careful" is less useful than "I\'ll scan every prompt for client names before submitting"'
        },
        {
          id: 'team-conversation',
          label: 'If you could start one conversation with your team about AI data practices, what would it be about?',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          placeholder: 'Think about gaps in your team\'s current approach — missing policies, unclear guidelines, risky habits you\'ve observed...'
        }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module4);

export default module4;
