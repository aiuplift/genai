/**
 * Module 8: Visualisation and Presentation
 *
 * Activities:
 *   1. Image Generation Lab — describe a scenario, craft a prompt, evaluate AI-generated visuals
 *   2. Presentation Sprint — build a short slide deck outline, document tools used, peer feedback
 *   3. Module Quiz — 5-question knowledge check
 *   4. Reflection & Feedback — structured reflection entries
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

import { registerModule } from '../core/module-registry.js';

const module8 = {
  id: 'module8',
  title: 'Visualisation and Presentation',
  description: 'Create compelling visual content and presentations with AI assistance — from concept to delivery, with judgment about what works and what doesn\'t.',
  sections: [
    // ── 1. Welcome + Learning Objectives ────────────────────────────────────
    {
      type: 'content',
      title: 'Welcome to Module 8',
      content: `Welcome to Module 8 — where you'll learn to harness AI for visual communication and presentation design, while building the judgment to know when generated imagery is appropriate and when it crosses ethical lines.

<strong>What you'll walk away with:</strong>

• The ability to create effective AI prompts for visual content — understanding how image prompts differ fundamentally from text prompts
• A practical workflow for building complete presentations with AI assistance in a fraction of traditional time
• Clear understanding of the ethical boundaries of AI-generated images — when they're appropriate, when they're not, and why disclosure matters
• Experience with rapid presentation methodology that collapses what used to take a day into under an hour

Visual communication is changing faster than almost any other professional skill. AI can now generate images, suggest layouts, write slide content, and structure presentations — all from natural language descriptions. The professionals who thrive will be those who use these capabilities confidently while maintaining ethical standards and quality judgment.`
    },
    {
      type: 'callout',
      variant: 'tip',
      title: 'How This Module Works',
      content: `Use the AI Chat (💬 button) to experiment with prompts for visual descriptions and presentation outlines. For actual image generation, use tools like DALL-E, Midjourney, or Adobe Firefly alongside this module. Your work saves automatically.`
    },

    // ── 2. AI Visual Generation — What's Possible in 2025 ──────────────────
    {
      type: 'content',
      title: 'AI Visual Generation — What\'s Possible in 2025',
      content: `AI image generation has fundamentally changed the economics of visual communication. Understanding this shift — and its limits — is essential for any professional who creates presentations, reports, or client-facing materials.

<strong>Current capabilities: DALL-E, Midjourney, and Adobe Firefly</strong>

Each major platform has distinct strengths:

<em>DALL-E (OpenAI)</em> — Excels at concept illustrations, abstract visualizations, and following complex compositional instructions. Best for: professional concepts, infographics-style imagery, custom illustrations that need to match a specific brief. Integrates directly into ChatGPT conversations.

<em>Midjourney</em> — Produces the most aesthetically polished output. Best for: artistic quality, mood-heavy imagery, brand-style visuals, and anything where visual impact matters more than precision. Accessed through Discord.

<em>Adobe Firefly</em> — Trained exclusively on licensed content, making it the safest choice for commercial use. Best for: marketing materials, client-facing assets, and any context where licensing concerns matter. Integrates into Adobe Creative Cloud.

<strong>What AI image generation is good at:</strong>
• Concept illustrations and metaphor visualizations
• Mood boards and visual direction explorations
• Custom illustrations for presentations and training materials
• Mockups and wireframe visualizations
• Abstract and stylized imagery for backgrounds and headers
• Generating multiple variations quickly for stakeholder selection

<strong>What AI image generation is bad at:</strong>
• <em>Text in images</em> — AI consistently struggles to render readable text. Letters are garbled, misspelled, or visually broken.
• <em>Hands and fingers</em> — Improving but still unreliable. Extra fingers, merged fingers, anatomically wrong poses remain common.
• <em>Precision and technical accuracy</em> — Specific counts ("exactly 7 people"), precise spatial relationships ("logo in the top-left corner at 2cm"), and technical diagrams are unreliable.
• <em>Consistency across images</em> — Generating the same character or style across multiple images is difficult without specialized workflows.
• <em>Brand compliance</em> — AI cannot reliably reproduce specific brand colours, logo placements, or typography standards.
• <em>Real people or products</em> — Don't use AI to generate images of real individuals or specific branded products.

<strong>The practical implication:</strong> AI image generation is excellent for ideation, internal communications, and concept work. It's not yet a replacement for professional design when precision, brand compliance, or text rendering matters.`
    },

    // ── 3. Prompt Engineering for Visuals ──────────────────────────────────
    {
      type: 'content',
      title: 'Prompt Engineering for Visuals',
      content: `Prompting for images is fundamentally different from prompting for text. Understanding these differences is the key to getting useful visual outputs rather than generic or wrong ones.

<strong>How image prompts differ from text prompts:</strong>

Text prompts work with logical instructions: "Write a summary that includes X, Y, and Z in a professional tone." The AI follows sequential logic.

Image prompts work with descriptive composition: "A minimalist office workspace, soft natural lighting from the left, shallow depth of field, muted earth tones, clean lines." The AI interprets spatial, visual, and aesthetic descriptions simultaneously.

<strong>Key differences:</strong>
• Text prompts: instruction-based ("do this, then this")
• Image prompts: description-based ("this scene looks like this")
• Text prompts: logical structure matters
• Image prompts: spatial and visual relationships matter
• Text prompts: tone and format guide output
• Image prompts: style, lighting, composition, and colour palette guide output

<strong>The keywords that matter: Style, Composition, Lighting, Medium</strong>

<em>Style keywords:</em> "Professional," "minimalist," "flat illustration," "photorealistic," "watercolour," "isometric diagram," "vector art," "editorial illustration," "technical blueprint."

<em>Composition keywords:</em> "Subject centred," "rule of thirds," "wide establishing shot," "close-up detail," "overhead flat lay," "symmetrical," "negative space."

<em>Lighting keywords:</em> "Soft natural light," "dramatic side lighting," "golden hour warmth," "studio lighting," "backlit silhouette," "high-key bright."

<em>Medium keywords:</em> "Digital painting," "ink sketch," "3D render," "photograph," "collage," "paper cut-out," "charcoal drawing."

<strong>Before/after prompt examples:</strong>

<em>Before (vague):</em> "A team meeting"
<em>After (effective):</em> "Four professionals collaborating around a modern whiteboard, flat vector illustration style, bird's-eye composition, bright pastel colour palette, clean lines, no text, no cluttered background"

<em>Before (vague):</em> "Technology concept"
<em>After (effective):</em> "Abstract network of glowing nodes connected by thin lines, dark navy background, isometric perspective, subtle blue and teal gradient, minimalist style, suitable as a presentation header image, no text overlays"

<em>Before (vague):</em> "Business growth"
<em>After (effective):</em> "A single seedling growing from soil with gentle morning light from the right, photorealistic macro photography style, shallow depth of field, warm earth tones, metaphor for organic business growth, clean composition, no text"

<strong>Negative prompts — often more powerful than positive ones:</strong>

Tell the AI what NOT to include: "No text, no watermarks, no people, no cluttered backgrounds, no specific brand logos, no hands visible." Negative prompts prevent the most common AI image failures.

<strong>The iteration mindset:</strong>

Unlike text (where the first output is often usable), image generation typically requires 3-5 iterations. Adjust style, composition, or specific details with each round. Save your successful prompts as templates — they're reusable patterns for future projects.`
    },

    // ── 4. Ethical and Legal Considerations for AI Images ──────────────────
    {
      type: 'content',
      title: 'Ethical and Legal Considerations for AI Images',
      content: `AI-generated imagery raises ethical questions that every professional needs to navigate thoughtfully. These aren't theoretical concerns — they affect your reputation, your organisation's legal exposure, and the trust your stakeholders place in your work.

<strong>Deepfakes and consent:</strong>

AI can generate realistic images of people who don't exist — and modify images of people who do. The ethical line is clear: never generate images that depict identifiable real people without their explicit consent. This applies even for "positive" depictions — a generated image of your CEO giving a keynote, or a "before and after" using someone's likeness, violates their right to control how their image is used.

<strong>Representation and diversity:</strong>

AI image generators can create diverse representations easily — different ages, ethnicities, abilities, body types. This is positive when used authentically (showing the diversity of your actual team or audience) but problematic when used performatively (generating diverse imagery for marketing while your actual organisation isn't diverse). Consider: does this generated diversity reflect reality, or create a false impression?

<strong>Commercial licensing:</strong>

AI-generated images exist in a legal grey area. Key considerations:
• Training data often includes copyrighted images — some jurisdictions consider this fair use, others don't
• Most AI image tools grant commercial licences for their outputs, but the legal landscape is evolving
• If your generated image closely resembles a specific existing artwork or photograph, you may face infringement claims regardless of how it was generated
• Always check the terms of service of the specific tool you use

<strong>When NOT to use generated images:</strong>

• <strong>Images of real people:</strong> Never generate faces of identifiable individuals. Even composites that "look like" a specific person cross the line.
• <strong>Implied endorsement:</strong> Don't use generated images in ways that suggest a real person, organisation, or brand endorses something they haven't endorsed.
• <strong>Client-facing materials without disclosure:</strong> If a client would expect original photography or commissioned illustration, using AI-generated imagery without disclosure is deceptive.
• <strong>Evidence or documentation:</strong> Generated images should never appear in contexts where they could be mistaken for photographs documenting real events.
• <strong>Medical, scientific, or legal contexts:</strong> Where image accuracy has consequences for health, safety, or justice, generated imagery is inappropriate.

<strong>The disclosure principle:</strong>

When in doubt, disclose. A simple "Illustration generated with AI" in small text beneath an image, or "AI-generated concept visualization" in a slide footnote, eliminates most ethical concerns. The problems arise when audiences believe they're seeing something they're not.`
    },

    // ── 5. Activity: Image Generation Lab ───────────────────────────────────
    {
      type: 'activity',
      activityId: 'image-generation-lab'
    },

    // ── 6. AI-Assisted Presentation Building ───────────────────────────────
    {
      type: 'content',
      title: 'AI-Assisted Presentation Building',
      content: `AI doesn't just generate images — it can assist at every stage of presentation creation, from initial concept to final polish. The key is understanding which tasks to delegate to AI and which require your professional judgment.

<strong>Using AI for outline generation:</strong>

Start with your presentation goal: "I need to present our Q3 results to the leadership team in 15 minutes, emphasising the two areas where we exceeded targets and one area where we need investment." AI can generate a logical slide structure — opening hook, context, key results, deep dives, implications, ask. Your job: reorder based on your knowledge of what this specific audience cares about.

<strong>Using AI for slide content:</strong>

For each slide, AI can generate:
• Concise bullet points (rule: no more than 3-5 per slide, no more than 7 words each)
• Suggested data visualisations ("this data would work best as a waterfall chart showing sequential impact")
• Transition sentences that create narrative flow between slides
• Title options that are active and informative rather than generic ("Revenue grew 23% on enterprise expansion" vs "Q3 Revenue Results")

<strong>Using AI for speaker notes:</strong>

AI excels at generating speaker notes that expand on slide content — the context, examples, and narrative that you'll deliver verbally while the slide shows only key points. Prompt: "Write 2-3 sentences of speaker notes for each slide that add context beyond what's on the slide itself."

<strong>Using AI for visual suggestions:</strong>

For each slide, AI can recommend what visual would best support the content:
• "This comparison would benefit from a side-by-side layout"
• "This process could be illustrated as a flow diagram"
• "This data point deserves full-screen treatment for emphasis"
• "This section needs a palette cleanser — a simple quote slide or visual break"

<strong>The workflow: AI structures, you refine, AI polishes.</strong>

Round 1 — AI generates: Rough outline, initial slide content, structural suggestions
Round 2 — You refine: Reorder for your audience, add your knowledge, cut what doesn't serve the goal
Round 3 — AI polishes: Tighten language, improve transitions, generate speaker notes, suggest visuals

This three-round workflow typically produces a stronger presentation than either pure AI generation or pure manual creation. AI brings structure and completeness; you bring audience knowledge and professional judgment; AI brings polish and consistency.`
    },

    // ── 7. The Presentation Sprint Methodology ──────────────────────────────
    {
      type: 'content',
      title: 'The Presentation Sprint Methodology',
      content: `The Presentation Sprint is a structured 30-minute approach to building a complete presentation draft using AI. It's designed for situations where you need to present something quickly — a last-minute request, a lightning talk, a team update — and can't afford the traditional half-day investment.

<strong>The 30-Minute Rapid Presentation Build:</strong>

<strong>Minutes 0-5: Topic and Audience Lock</strong>
Define exactly three things: What is this presentation about? Who is the audience? What do you want them to do/think/feel after?

Prompt AI: "I'm presenting [topic] to [audience]. The goal is [action/understanding]. What are the 5-7 key points I must cover in [time limit]?"

<strong>Minutes 5-12: Outline Generation</strong>
Take AI's suggested structure and refine it. Add points you know matter to this specific audience. Remove anything that's filler. Reorder for maximum impact — usually: hook → problem → solution → evidence → ask.

Prompt AI: "Turn this outline into slide titles. Each title should be an active statement, not a label. For example, 'Revenue grew 23% on enterprise deals' not 'Revenue Update.'"

<strong>Minutes 12-22: Slide Content</strong>
For each slide, generate concise bullet points. Apply the 5x7 rule: maximum 5 bullets, maximum 7 words each. If a slide needs more, it should be two slides.

Prompt AI: "For each slide title, write 3-5 concise bullet points (max 7 words each). Then suggest what visual or data would best support this slide."

<strong>Minutes 22-27: Narrative Polish</strong>
Generate speaker notes and transitions. Check the overall story arc — does it flow? Does it build? Does it arrive at a clear conclusion or ask?

Prompt AI: "Write 2-sentence speaker notes for each slide that add context beyond what's written. Also write one transition sentence between each pair of slides."

<strong>Minutes 27-30: Peer Checkpoint</strong>
Share your outline with one colleague. Two questions: "Does this make sense?" and "Am I missing anything critical?" Even 3 minutes of external input catches major gaps.

<strong>How AI collapses the timeline:</strong>

Traditional presentation creation: Research (2 hours) → Outline (1 hour) → Draft slides (2 hours) → Polish (1 hour) → Practice (1 hour) = 7 hours

Sprint methodology: Topic lock (5 min) → AI-assisted outline (7 min) → AI-assisted content (10 min) → Polish (5 min) → Peer check (3 min) = 30 minutes for a solid first draft

The sprint won't produce a keynote-quality presentation. It will produce a clear, structured, complete presentation that effectively communicates your message. For 90% of professional presentations (team updates, stakeholder briefings, project reviews), that's exactly what's needed.`
    },

    // ── 8. Callout (tip) — Story Over Slides ──────────────────────────────
    {
      type: 'callout',
      variant: 'tip',
      title: 'Story Over Slides',
      content: `AI creates slides. You create stories. The audience remembers the story, not the slide. AI-generated presentation outlines are solid starting points — they give you structure, consistency, and completeness. But the narrative arc, the emotional connection, the "why should I care?" moment — that's yours to craft. The best presentations aren't collections of well-formatted slides; they're stories told with visual support.`
    },

    // ── 9. Activity: Presentation Sprint ────────────────────────────────────
    {
      type: 'activity',
      activityId: 'presentation-sprint'
    },

    // ── 10. Quiz ────────────────────────────────────────────────────────────
    {
      type: 'activity',
      activityId: 'module8-quiz'
    },

    // ── 11. Feedback ────────────────────────────────────────────────────────
    {
      type: 'activity',
      activityId: 'module8-feedback'
    }
  ],

  activities: [
    // ─── Activity 1: Image Generation Lab ───────────────────────────────────
    {
      id: 'image-generation-lab',
      title: 'Image Generation Lab',
      type: 'form',
      description: 'Describe a workplace scenario that would benefit from an AI-generated visual, craft a prompt using the framework (Subject + Style + Composition + Lighting/Mood + Negative constraints), then evaluate the output against your criteria.',
      fields: [
        {
          id: 'scenario',
          label: 'Workplace Scenario Description',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Describe a workplace scenario where an AI-generated visual would be useful (e.g. "I need a concept image for a slide about team collaboration in our remote-first culture")...'
        },
        {
          id: 'prompt',
          label: 'Image Generation Prompt',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          required: true,
          placeholder: 'Write your prompt using the framework: [Subject] + [Style] + [Composition] + [Lighting/Mood] + [Negative constraints]...'
        },
        {
          id: 'criteria',
          label: 'Evaluation Criteria',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Define your criteria: relevance to scenario, style appropriateness, composition for intended use (slide/report/social), ethical considerations...'
        },
        {
          id: 'notes',
          label: 'Evaluation Notes',
          type: 'textarea',
          maxLength: 1000,
          minLength: 1,
          required: true,
          placeholder: 'Evaluate the generated image (or imagined output) against your criteria. What worked? What would you adjust in the next iteration?...'
        }
      ],
      completionRule: 'all_fields_filled'
    },

    // ─── Activity 2: Presentation Sprint ────────────────────────────────────
    {
      id: 'presentation-sprint',
      title: 'Presentation Sprint',
      type: 'form',
      description: 'Build a complete presentation outline in 30 minutes using AI assistance. Define your topic, create slide content, document your AI tools and process, and receive peer feedback on the result.',
      fields: [
        {
          id: 'topic',
          label: 'Presentation Topic',
          type: 'text',
          maxLength: 200,
          minLength: 1,
          required: true,
          placeholder: 'Enter your presentation topic (be specific about audience and goal)...'
        },
        {
          id: 'slides',
          label: 'Slide Outline',
          type: 'structured_table',
          required: true,
          minRows: 3,
          maxRows: 10,
          columns: [
            { id: 'title', label: 'Slide Title (active statement)', type: 'text', maxLength: 100, minLength: 1 },
            { id: 'bullets', label: 'Bullet Points (max 5, max 7 words each)', type: 'textarea', maxLength: 300, minLength: 1 }
          ],
          placeholder: 'Add between 3 and 10 slides. Use active titles ("Revenue grew 23%") not labels ("Revenue Results").'
        },
        {
          id: 'tools-used',
          label: 'AI Tools and Process Used',
          type: 'textarea',
          maxLength: 500,
          minLength: 1,
          required: true,
          placeholder: 'Describe which AI tools you used at each stage (outline, content, visuals, polish) and how they helped...'
        },
        {
          id: 'peer-review-feedback',
          label: 'Peer-Review Feedback',
          type: 'textarea',
          maxLength: 500,
          minLength: 0,
          required: false,
          visibleAfterSubmission: true,
          placeholder: 'Feedback from peers will appear here after you submit your presentation...',
          hint: 'This field becomes available for other participants to provide feedback after you submit your presentation.'
        }
      ],
      completionRule: 'all_required_fields_filled',
      peerReviewEnabled: true,
      peerReviewField: 'peer-review-feedback',
      peerReviewMaxLength: 500
    },

    // ─── Activity 3: Module Quiz ────────────────────────────────────────────
    {
      id: 'module8-quiz',
      title: 'Knowledge Check',
      type: 'quiz',
      description: 'Test your understanding of AI-assisted visual communication, ethical boundaries, and presentation workflows.',
      questions: [
        {
          id: 'q1',
          text: 'When is it appropriate to use an AI-generated image in a professional presentation?',
          options: [
            { id: 'a', text: 'Always — AI images are indistinguishable from professional photography' },
            { id: 'b', text: 'For internal concept illustrations, training materials, and draft presentations — especially when clearly labelled as AI-generated in any context where audiences might assume otherwise' },
            { id: 'c', text: 'Never — AI images are always unethical to use' },
            { id: 'd', text: 'Only when no stock photography exists for your topic' }
          ],
          correctAnswer: 'b',
          explanation: 'AI-generated images are appropriate in contexts where they support communication without creating false impressions: internal materials, concept illustrations, training content, and drafts. The ethical concern isn\'t the technology itself — it\'s whether the audience would be misled about what they\'re seeing. Disclosure resolves most concerns.'
        },
        {
          id: 'q2',
          text: 'How does prompting for AI-generated images differ from prompting for text output?',
          options: [
            { id: 'a', text: 'There\'s no difference — the same prompting techniques work for both' },
            { id: 'b', text: 'Image prompts use descriptive composition (style, lighting, spatial relationships) rather than logical instructions (do this, then this)' },
            { id: 'c', text: 'Image prompts should be shorter than text prompts' },
            { id: 'd', text: 'Image prompts only work with technical photography terminology' }
          ],
          correctAnswer: 'b',
          explanation: 'Text prompts are instruction-based: "write X in Y format." Image prompts are description-based: "a scene that looks like X, in Y style, with Z lighting." You\'re describing a visual result rather than giving sequential instructions. This means specifying style, composition, lighting, mood, and negative constraints — a fundamentally different skill from text prompting.'
        },
        {
          id: 'q3',
          text: 'A colleague generates an AI image of a diverse team collaborating for a company blog post, but your actual team is not diverse. What ethical concern does this raise?',
          options: [
            { id: 'a', text: 'No concern — diverse representation in imagery is always positive' },
            { id: 'b', text: 'The image creates a false impression of your organisation\'s diversity, which is performative and potentially deceptive to job candidates or clients who might rely on it' },
            { id: 'c', text: 'AI shouldn\'t generate images of people at all' },
            { id: 'd', text: 'The concern is only about image quality, not representation' }
          ],
          correctAnswer: 'b',
          explanation: 'Using AI to generate diversity that doesn\'t reflect reality is performative representation. If a job candidate sees your blog imagery and expects a diverse workplace, then arrives to find something different, trust is broken. Authentic representation — showing your real team, or using abstract/non-people imagery — is more ethical than manufactured diversity.'
        },
        {
          id: 'q4',
          text: 'In the Presentation Sprint methodology, what is the recommended workflow for using AI?',
          options: [
            { id: 'a', text: 'Let AI create the entire presentation without human intervention' },
            { id: 'b', text: 'AI structures and generates first draft → you refine based on audience knowledge → AI polishes language and adds speaker notes' },
            { id: 'c', text: 'Create the presentation manually, then ask AI to check for spelling errors' },
            { id: 'd', text: 'Ask AI for images first, then build slides around whatever images it generates' }
          ],
          correctAnswer: 'b',
          explanation: 'The three-round workflow leverages each party\'s strengths: AI brings structural completeness and consistency (it won\'t forget to include an agenda slide or a summary). You bring audience knowledge and professional judgment (you know what this VP cares about). AI then polishes language and generates supporting content like speaker notes. Neither party could produce the best result alone.'
        },
        {
          id: 'q5',
          text: 'You generate an AI image for a presentation about your company\'s new product. The image looks great but depicts the product in a setting that implies features it doesn\'t actually have. What should you do?',
          options: [
            { id: 'a', text: 'Use it — audiences understand presentations are aspirational' },
            { id: 'b', text: 'Use it but add a small disclaimer on the slide' },
            { id: 'c', text: 'Don\'t use it — an image that implies capabilities your product doesn\'t have is misleading, especially in a context where audiences might make purchasing decisions based on the presentation' },
            { id: 'd', text: 'Edit the image to be less impressive' }
          ],
          correctAnswer: 'c',
          explanation: 'Images in professional presentations carry implicit claims. If an AI-generated image shows your product doing something it can\'t actually do, audiences will reasonably believe it can do that thing. This is particularly dangerous in sales, investor, or client-facing contexts where visual claims influence decisions. Regenerate with an accurate prompt, or use a clearly labelled concept illustration.'
        }
      ]
    },

    // ─── Activity 4: Reflection & Feedback ──────────────────────────────────
    {
      id: 'module8-feedback',
      title: 'Reflection & Feedback',
      type: 'structured_entries',
      description: 'Reflect on how you\'ll use AI for visual communication and presentation design in your professional work.',
      fields: [
        { id: 'visual-use-case', label: 'What\'s the first presentation or visual task you\'ll try with AI assistance?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'ethical-boundary', label: 'What\'s your personal rule for when AI-generated images need disclosure or replacement with professional assets?', type: 'textarea', maxLength: 400, minLength: 1 },
        { id: 'key-takeaway', label: 'What was the most useful technique or insight from this module?', type: 'textarea', maxLength: 400, minLength: 1 }
      ],
      minEntries: 1,
      maxEntries: 1,
      completionRule: 'min_entries_filled'
    }
  ]
};

// Self-register on import
registerModule(module8);

export default module8;
