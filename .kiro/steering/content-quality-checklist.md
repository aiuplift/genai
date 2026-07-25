---
inclusion: auto
---

# AI Skills Studio — Content Quality Checklist

Use this checklist before finalising any module content (both trainer slides and student exercises).

## 1. Content Ratio & Interactivity

- [ ] **40% Theory / 60% Practical** — every theory section is immediately followed by a hands-on activity
- [ ] **Interactive touchpoints** — students don't just read; they DO something (visit a tool, try a prompt, generate output, compare results)
- [ ] **External tool links** — where applicable, link students to real tools (e.g., OpenAI tokenizer, AI Studio, Prompt examples)
- [ ] **"Try It Now" moments** — every concept includes a specific instruction for students to try immediately using the AI Chat or an external tool
- [ ] **Progressive difficulty** — exercises build on each other; later activities assume skills from earlier ones

## 2. Visual & Typography Standards (Slides)

### Font Sizes (Minimum)
| Element | Minimum Size |
|---------|-------------|
| Slide title (h2) | 24px |
| Card title | 14px |
| Body text in cards | 12px |
| Footer / teaser text | 12px |
| Quiz question | 22px |
| Quiz option text | 14px |
| Agenda card title | 14px |
| Chapter number | 80px+ |
| Navigation bar | 11px |
| Tooltip content | 13px |
| Nothing below | **10px** |

### Visual Enhancement
- [ ] **Icons/emojis** — every card and section has a visual anchor (icon, emoji, or colour marker)
- [ ] **Gradients** — use purple-to-teal gradients for emphasis elements (borders, headers, CTAs)
- [ ] **Colour system** — consistent: navy (#1E1045), purple (#6C3AED), teal (#0891B2), dark-bg (#0F0A2E)
- [ ] **Layout fills space** — no large empty areas; content uses the full 1280×720 viewport
- [ ] **Animations** — use Reveal.js fragments (fade-up, scale-in) for progressive reveal
- [ ] **Infographics** — at least 2 infographic-style slides per module (data flow, comparison, pipeline visualisation)
- [ ] **No overflow** — every slide fits within viewport without scrolling in fullscreen
- [ ] **Tooltips** — hover/tap tooltips for technical terms using `.tip` class with `.tip-content` overlay
- [ ] **Level/status cards** — use coloured top-bar cards for categorisation (green/yellow/red zones)

### Tooltips Implementation
```css
.tip { position: relative; border-bottom: 1px dashed var(--mint); cursor: help; }
.tip .tip-content {
  display: none; position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--navy); color: var(--text-light);
  padding: 14px 18px; border-radius: 10px; font-size: 13px;
  width: 320px; max-width: 90vw; border: 2px solid var(--mint);
  z-index: 10000; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.tip:hover .tip-content { display: block; }
```
- Use dark variant (navy bg, light text) on dark slides
- Use light variant (white bg, navy text) on light slides
- Always include 💡 icon prefix in tooltip content
- Add tap-to-toggle JS for mobile support

### Fragment & Build Order
- [ ] **Fragments grouped logically** — related items reveal together
- [ ] **CTA always last** — footer bars, teasers, and action prompts reveal after content
- [ ] **Key insight highlighted** — the most important point on each slide gets visual emphasis (glow, border, larger font)
- [ ] **Progressive complexity** — simpler items reveal first, complex last

## 3. Slide Structure Patterns

| Content Type | Layout Pattern |
|-------------|---------------|
| **Recap (opening)** | Summary card (2-col: prior module key points) + 3-4 quiz slides from previous modules |
| Concept introduction | Chapter slide (big number + title + subtitle) |
| Comparison (A vs B) | 2-column grid with contrasting colours |
| List of items (3-6) | Card grid (2×3 or 3-col) |
| Process/pipeline | Numbered steps with icons (loop-steps pattern) |
| Case study | Quote + scenario cards |
| Quiz | Full-width question + 2×2 option grid |
| Activity prompt | Highlighted card with timer/instructions on #1A1050 background |
| Transition | Chapter slide with rule line |

### Recap Slide Standard (Module 3+)
Every module from Module 3 onward MUST open with:
1. **Recap summary slide** — 2-column card layout with bullet-point key takeaways from ALL prior modules
2. **3-4 recap quiz slides** — one question per slide, mixing concepts from prior modules, with explanations that bridge to the current module's topic
3. This section takes ~5-6 minutes and serves as warm-up + knowledge validation

### Example & Scenario Guidelines
- All examples MUST be industry-agnostic (finance, HR, admin, law, teaching, operations)
- NEVER use software engineering examples (no APIs, sprints, deployments, code reviews)
- Use recurring characters: Rachel (dept head/CFO), Amit (operations), Priya (finance/accounts), Kenji (HR)
- Scenarios should feel familiar to professionals in ANY white-collar role
- Include variety: meetings, emails, reports, proposals, performance reviews, budgets, compliance

## 4. Student Exercise View Standards

- [ ] **Light background** (#F8F7FF) with white cards — all text clearly visible
- [ ] **Gradient hero header** — module title on purple-to-teal gradient
- [ ] **Progress bar** — scroll-based progress indicator at top
- [ ] **Activity cards with gradient borders** — visual distinction from content sections
- [ ] **Interactive elements** — checkboxes hover-animate, quiz options slide on hover, textareas have focus glow
- [ ] **Chat FAB visible** — floating 💬 button always accessible
- [ ] **Mobile responsive** — single column below 640px

## 5. Speaker Notes & Sample Answers

For every module, the following must exist:

- [ ] **Speaker notes on every slide** — `<aside class="notes">` with talking points, timing, facilitation tips
- [ ] **Transition guidance** — notes explain how to bridge from one slide to the next
- [ ] **Discussion prompts** — at least 3 per module where facilitator asks audience a question
- [ ] **Sample answers** — for every student exercise/activity, a reference answer exists (stored in a separate file or in module comments)
- [ ] **Timing guide** — estimated minutes per section (total should sum to 60-90 minutes per module)

## 6. Per-Module Deliverables

For each completed module, these files must exist:

| File | Purpose |
|------|---------|
| `public/js/modules/moduleN.js` | Student exercise definitions + rich sections |
| `public/decks/moduleN.html` | Trainer slide deck (Reveal.js) |
| `.kiro/content/moduleN-speaker-notes.md` | Full speaker script with timing |
| `.kiro/content/moduleN-sample-answers.md` | Reference answers for all exercises |
| `.kiro/content/moduleN-references.md` | External links, tools, resources cited |

## 7. Technical Verification

- [ ] **Section count** — slides have correct number of `<section>` tags matching nav links
- [ ] **Nav links match** — session nav bar links point to correct slide indices
- [ ] **Quiz JS works** — clicking options shows correct/incorrect feedback + explanation
- [ ] **Fragments load** — all `.fragment` elements animate on advance
- [ ] **No console errors** — page loads without JavaScript errors
- [ ] **Passcode gate works** — deck requires G2026 to access
- [ ] **Student view renders** — `#module/moduleN` shows all sections and activities

## 8. Accessibility

- [ ] **Contrast ratio** — all text meets WCAG 2.1 AA (4.5:1 normal, 3:1 large text/UI)
- [ ] **Keyboard navigable** — all interactive elements reachable via Tab + Enter/Space
- [ ] **ARIA labels** — quiz options, form fields, and navigation have proper labels
- [ ] **No content cut off** — nothing hidden by overflow in any viewport

## 9. Content Quality Gates

- [ ] **Real tool names** — use actual product names (ChatGPT, Claude, Gemini, not "AI tool")
- [ ] **Current information** — tool capabilities and pricing reflect 2025 reality
- [ ] **Professional context** — every example relates to workplace scenarios professionals encounter
- [ ] **Industry-agnostic examples** — use scenarios from general administration, finance, HR, law, teaching, operations — NOT software engineering. Professionals from any field should see themselves in the examples.
- [ ] **Engagement prompts** — at least 3 "pause and think" or "discuss with your neighbour" moments per module
- [ ] **No filler** — every paragraph earns its place; cut anything that doesn't teach or prompt action
- [ ] **Recap at start** — every module from Module 3 onward starts with: 1 recap summary slide (prior modules' key points) + 3-4 quiz questions from previous modules
- [ ] **Consistent characters** — use recurring professional characters across modules (Rachel/CFO, Amit/ops, Priya/finance, Kenji/HR) to build familiarity

## 10. Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Content overflows in fullscreen | Reduce to max 5 items per card grid, shrink padding, split into 2 slides |
| Text too small to read from back of room | Minimum 14px for any body text on slides; 22px+ for key points |
| Students don't know what to DO | Every theory section ends with explicit "Now try this:" instruction |
| Quiz answers not clickable | Verify `onclick` handler and correct answer index in `quizAnswer()` |
| Empty space on slides | Add footer-bar, teaser, or infographic to fill; use flex-grow |
| Chat panel shows "Loading models" | Ensure demo models fallback is working (check ai-model-registry.js) |
| Slide nav bar links wrong | Count `<section>` tags from 0, update chapter indices in nav `onclick` |
