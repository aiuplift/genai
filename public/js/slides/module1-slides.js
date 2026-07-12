/**
 * Module 1 Slide Deck: AI Landscape and Tool Survey
 *
 * Returns Reveal.js section HTML for approximately 22 slides covering:
 *   Chapter 1: How Generative AI Works
 *   Chapter 2: AI vs Generative AI vs Embedded AI
 *   Chapter 3: Five Tool Categories
 *   Chapter 4: Key AI Risks
 *   Activities & Wrap-up
 */

export function getSlides() {
  return `
    <!-- ═══════════════════════════════════════════════════════════════
         TITLE SLIDE
         ═══════════════════════════════════════════════════════════════ -->
    <section>
      <div class="slide-title">
        <span class="slide-module-label">MODULE 1</span>
        <h1>AI Landscape &amp;<br>Tool Survey</h1>
        <p class="slide-subtitle">Understanding generative AI, tool categories,<br>and building your personal toolkit</p>
        <div class="slide-goals">
          <h3>🎯 Learning Goals</h3>
          <ul>
            <li class="fragment">Explain how generative AI produces output</li>
            <li class="fragment">Distinguish AI, generative AI, and embedded AI</li>
            <li class="fragment">Identify five practical tool categories</li>
            <li class="fragment">Recognize key AI risks and mitigation strategies</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════
         CHAPTER 1: How Generative AI Works
         ═══════════════════════════════════════════════════════════════ -->
    <section>
      <div class="slide-chapter-divider">
        <span class="chapter-number">01</span>
        <h2>How Generative<br>AI Works</h2>
        <p class="chapter-tagline">Pattern matching at extraordinary scale</p>
      </div>
    </section>

    <section>
      <h2>The "Advanced Autocomplete" Analogy</h2>
      <div class="slide-visual-concept">
        <div class="concept-card fragment">
          <div class="concept-icon">📱</div>
          <div class="concept-text">
            <strong>Phone Autocomplete</strong><br>
            Predicts your next <em>word</em>
          </div>
        </div>
        <div class="concept-arrow fragment">→</div>
        <div class="concept-card fragment highlight-card">
          <div class="concept-icon">🧠</div>
          <div class="concept-text">
            <strong>Generative AI</strong><br>
            Predicts your next <em>thousand</em> words
          </div>
        </div>
      </div>
      <p class="slide-note fragment">Same mechanism. Vastly larger scale.<br>Billions of pages of training data instead of your text history.</p>
    </section>

    <section>
      <h2>Pattern Matching ≠ Understanding</h2>
      <div class="slide-two-col">
        <div class="col-card fragment">
          <h3>🔍 What the AI Does</h3>
          <ul>
            <li>Identifies statistical patterns</li>
            <li>Predicts probable next tokens</li>
            <li>Generates text that <em>looks</em> thoughtful</li>
            <li>Matches your prompt to trained patterns</li>
          </ul>
        </div>
        <div class="col-card fragment">
          <h3>🚫 What the AI Does NOT Do</h3>
          <ul>
            <li>Understand meaning</li>
            <li>Reason about truth</li>
            <li>Know when it's wrong</li>
            <li>Access real-time information</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <div class="slide-key-insight">
        <div class="insight-icon">⚡</div>
        <h2>Critical Insight</h2>
        <blockquote class="fragment">
          "AI has no awareness of when it is wrong."
        </blockquote>
        <div class="insight-detail fragment">
          <p>A human expert who is unsure will hedge or say "I don't know."</p>
          <p>A generative AI produces output with the <strong>same confident tone</strong> whether the information is accurate or completely fabricated.</p>
        </div>
        <div class="insight-takeaway fragment">
          <strong>You bring the judgment. The AI brings speed and breadth.</strong>
        </div>
      </div>
    </section>

    <section>
      <h2>The Partnership Model</h2>
      <div class="slide-partnership">
        <div class="partner-card fragment">
          <div class="partner-icon">🤖</div>
          <h3>AI Brings</h3>
          <ul>
            <li>Speed &amp; breadth</li>
            <li>Pattern recognition</li>
            <li>Tireless drafting</li>
            <li>Multi-format output</li>
          </ul>
        </div>
        <div class="partner-plus fragment">+</div>
        <div class="partner-card fragment">
          <div class="partner-icon">👤</div>
          <h3>You Bring</h3>
          <ul>
            <li>Judgment &amp; context</li>
            <li>Fact-checking</li>
            <li>Domain expertise</li>
            <li>Ethical reasoning</li>
          </ul>
        </div>
        <div class="partner-equals fragment">=</div>
        <div class="partner-result fragment">
          <div class="partner-icon">✨</div>
          <strong>Real Value</strong>
        </div>
      </div>
    </section>

    <section data-quiz="ch1">
      <div class="slide-quiz">
        <h2>🧠 Quick Check</h2>
        <p class="quiz-question">Generative AI generates output by:</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong" data-option="A">
            <span class="option-letter">A</span>
            Understanding meaning
          </button>
          <button class="quiz-option" data-answer="correct" data-option="B">
            <span class="option-letter">B</span>
            Predicting statistically probable next tokens
          </button>
          <button class="quiz-option" data-answer="wrong" data-option="C">
            <span class="option-letter">C</span>
            Searching the internet
          </button>
          <button class="quiz-option" data-answer="wrong" data-option="D">
            <span class="option-letter">D</span>
            Copying from a database
          </button>
        </div>
        <div class="quiz-explanation" hidden>
          <p>✅ <strong>Correct: B</strong> — Generative AI predicts the most statistically probable next token based on patterns in its training data. It doesn't understand, search, or copy — it predicts.</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════
         CHAPTER 2: AI vs Generative AI vs Embedded AI
         ═══════════════════════════════════════════════════════════════ -->
    <section>
      <div class="slide-chapter-divider">
        <span class="chapter-number">02</span>
        <h2>AI vs Generative AI<br>vs Embedded AI</h2>
        <p class="chapter-tagline">Three terms, three different things</p>
      </div>
    </section>

    <section>
      <h2>Three Layers of AI</h2>
      <div class="slide-three-col">
        <div class="col-card fragment">
          <div class="col-header ai-header">🤖 AI</div>
          <p class="col-definition">Systems that mimic human intelligence for <strong>specific tasks</strong></p>
          <div class="col-examples">
            <span class="example-tag">Spam filter</span>
            <span class="example-tag">Netflix recs</span>
            <span class="example-tag">Fraud detection</span>
          </div>
        </div>
        <div class="col-card fragment">
          <div class="col-header genai-header">✨ Generative AI</div>
          <p class="col-definition">AI that <strong>creates new content</strong> — text, images, code, music</p>
          <div class="col-examples">
            <span class="example-tag">ChatGPT</span>
            <span class="example-tag">Claude</span>
            <span class="example-tag">DALL-E</span>
          </div>
        </div>
        <div class="col-card fragment">
          <div class="col-header embedded-header">🔌 Embedded AI</div>
          <p class="col-definition">AI capabilities <strong>built into existing tools</strong></p>
          <div class="col-examples">
            <span class="example-tag">Smart Compose</span>
            <span class="example-tag">Teams summaries</span>
            <span class="example-tag">Excel Insights</span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>Workplace Examples</h2>
      <div class="slide-example-grid">
        <div class="example-row fragment">
          <span class="example-scenario">📧 Gmail finishes your sentence</span>
          <span class="example-type embedded-badge">Embedded AI</span>
        </div>
        <div class="example-row fragment">
          <span class="example-scenario">💬 Asking Claude to draft a project plan</span>
          <span class="example-type genai-badge">Generative AI</span>
        </div>
        <div class="example-row fragment">
          <span class="example-scenario">🛡️ Credit card flags a suspicious charge</span>
          <span class="example-type ai-badge">Traditional AI</span>
        </div>
        <div class="example-row fragment">
          <span class="example-scenario">📝 Teams auto-generates meeting summary</span>
          <span class="example-type embedded-badge">Embedded AI</span>
        </div>
        <div class="example-row fragment">
          <span class="example-scenario">🎨 Using Midjourney to create a logo concept</span>
          <span class="example-type genai-badge">Generative AI</span>
        </div>
      </div>
    </section>

    <section data-quiz="ch2">
      <div class="slide-quiz">
        <h2>🧠 Quick Check</h2>
        <p class="quiz-question">Gmail suggesting the rest of your sentence is an example of:</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong" data-option="A">
            <span class="option-letter">A</span>
            Traditional AI
          </button>
          <button class="quiz-option" data-answer="wrong" data-option="B">
            <span class="option-letter">B</span>
            Generative AI
          </button>
          <button class="quiz-option" data-answer="correct" data-option="C">
            <span class="option-letter">C</span>
            Embedded AI feature
          </button>
          <button class="quiz-option" data-answer="wrong" data-option="D">
            <span class="option-letter">D</span>
            Search-grounded AI
          </button>
        </div>
        <div class="quiz-explanation" hidden>
          <p>✅ <strong>Correct: C</strong> — Smart Compose is AI built directly into Gmail. You don't open a separate tool — the intelligence is woven into your existing workflow.</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════
         CHAPTER 3: Five Tool Categories
         ═══════════════════════════════════════════════════════════════ -->
    <section>
      <div class="slide-chapter-divider">
        <span class="chapter-number">03</span>
        <h2>Five Tool<br>Categories</h2>
        <p class="chapter-tagline">Know which tool to reach for</p>
      </div>
    </section>

    <section>
      <h2>The AI Tool Landscape</h2>
      <div class="slide-category-grid">
        <div class="category-tile fragment" data-category="1">
          <span class="category-icon">💬</span>
          <span class="category-name">Chat &amp; Generate</span>
        </div>
        <div class="category-tile fragment" data-category="2">
          <span class="category-icon">🔍</span>
          <span class="category-name">Search-Grounded</span>
        </div>
        <div class="category-tile fragment" data-category="3">
          <span class="category-icon">📄</span>
          <span class="category-name">Document Q&amp;A</span>
        </div>
        <div class="category-tile fragment" data-category="4">
          <span class="category-icon">🎙️</span>
          <span class="category-name">Capture-to-Structure</span>
        </div>
        <div class="category-tile fragment" data-category="5">
          <span class="category-icon">🎨</span>
          <span class="category-name">Creative / Visual</span>
        </div>
      </div>
    </section>

    <section>
      <h2><span class="cat-number">1</span> Chat &amp; Generate</h2>
      <div class="slide-category-detail">
        <div class="category-description">
          <p>You provide a question, instruction, or task in natural language, and the tool generates text in response.</p>
        </div>
        <div class="category-info-grid">
          <div class="info-card fragment">
            <h4>📦 Examples</h4>
            <p>ChatGPT, Claude, Gemini, Microsoft Copilot</p>
          </div>
          <div class="info-card fragment">
            <h4>🎯 Best For</h4>
            <p>Open-ended creation, thinking through problems, first drafts of almost anything</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2><span class="cat-number">2</span> Search-Grounded</h2>
      <div class="slide-category-detail">
        <div class="category-description">
          <p>Combines generative AI with live web search. Answers include <strong>citations and source links</strong>, reducing hallucination risk.</p>
        </div>
        <div class="category-info-grid">
          <div class="info-card fragment">
            <h4>📦 Examples</h4>
            <p>Perplexity, Google AI Overviews, Bing Chat</p>
          </div>
          <div class="info-card fragment">
            <h4>🎯 Best For</h4>
            <p>Research with verifiable facts, current information, starting bibliographies</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2><span class="cat-number">3</span> Document Q&amp;A</h2>
      <div class="slide-category-detail">
        <div class="category-description">
          <p>Upload a document and ask questions about it. AI restricts answers to that content — <strong>less likely to hallucinate</strong>.</p>
        </div>
        <div class="category-info-grid">
          <div class="info-card fragment">
            <h4>📦 Examples</h4>
            <p>Google NotebookLM, ChatPDF, Copilot in document mode</p>
          </div>
          <div class="info-card fragment">
            <h4>🎯 Best For</h4>
            <p>Long reports, contract clauses, studying dense material</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2><span class="cat-number">4</span> Capture-to-Structure</h2>
      <div class="slide-category-detail">
        <div class="category-description">
          <p>Takes messy, unstructured input — recordings, handwritten notes, voice memos — and transforms into <strong>structured, usable output</strong>.</p>
        </div>
        <div class="category-info-grid">
          <div class="info-card fragment">
            <h4>📦 Examples</h4>
            <p>Otter.ai, Notion AI, Teams transcription, Fireflies.ai</p>
          </div>
          <div class="info-card fragment">
            <h4>🎯 Best For</h4>
            <p>Meeting notes, brainstorm-to-action plans, research organization</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2><span class="cat-number">5</span> Creative / Visual</h2>
      <div class="slide-category-detail">
        <div class="category-description">
          <p>Generates images, presentations, music, video, or design assets from <strong>text descriptions</strong> or minimal input.</p>
        </div>
        <div class="category-info-grid">
          <div class="info-card fragment">
            <h4>📦 Examples</h4>
            <p>DALL-E, Midjourney, Canva AI, Gamma, Suno</p>
          </div>
          <div class="info-card fragment">
            <h4>🎯 Best For</h4>
            <p>Quick mockups, presentation drafts, social graphics, concept exploration</p>
          </div>
        </div>
      </div>
    </section>

    <section data-quiz="ch3">
      <div class="slide-quiz">
        <h2>🧠 Quick Check</h2>
        <p class="quiz-question">You need to research a topic with verifiable sources. Which category is best?</p>
        <div class="quiz-options">
          <button class="quiz-option" data-answer="wrong" data-option="A">
            <span class="option-letter">A</span>
            Chat &amp; Generate
          </button>
          <button class="quiz-option" data-answer="correct" data-option="B">
            <span class="option-letter">B</span>
            Search-grounded
          </button>
          <button class="quiz-option" data-answer="wrong" data-option="C">
            <span class="option-letter">C</span>
            Document Q&amp;A
          </button>
          <button class="quiz-option" data-answer="wrong" data-option="D">
            <span class="option-letter">D</span>
            Creative / Visual
          </button>
        </div>
        <div class="quiz-explanation" hidden>
          <p>✅ <strong>Correct: B</strong> — Search-grounded tools combine AI with live web search and provide citations, making them ideal when you need verifiable facts and current information.</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════
         CHAPTER 4: Key AI Risks
         ═══════════════════════════════════════════════════════════════ -->
    <section>
      <div class="slide-chapter-divider">
        <span class="chapter-number">04</span>
        <h2>Key AI Risks</h2>
        <p class="chapter-tagline">Use AI with your eyes open</p>
      </div>
    </section>

    <section>
      <h2>Four Risks to Manage</h2>
      <div class="slide-risk-grid">
        <div class="risk-card fragment">
          <div class="risk-icon">🎯</div>
          <h3>Accuracy</h3>
          <p class="risk-desc">AI confidently states things that are wrong</p>
          <p class="risk-rule"><strong>Rule:</strong> Never publish AI facts without verifying them</p>
        </div>
        <div class="risk-card fragment">
          <div class="risk-icon">⚖️</div>
          <h3>Bias</h3>
          <p class="risk-desc">Models reflect training data biases</p>
          <p class="risk-rule"><strong>Rule:</strong> Be vigilant when output affects or describes people</p>
        </div>
        <div class="risk-card fragment">
          <div class="risk-icon">🔒</div>
          <h3>Privacy</h3>
          <p class="risk-desc">Data pasted into AI may be stored or used</p>
          <p class="risk-rule"><strong>Rule:</strong> Never share confidential data without checking policy</p>
        </div>
        <div class="risk-card fragment">
          <div class="risk-icon">🛡️</div>
          <h3>Security</h3>
          <p class="risk-desc">Prompt injection and data exposure</p>
          <p class="risk-rule"><strong>Rule:</strong> Review AI code for vulnerabilities before deploying</p>
        </div>
      </div>
    </section>

    <section>
      <h2>Risk Mitigation: Quick Rules</h2>
      <div class="slide-rules-list">
        <div class="rule-item fragment">
          <span class="rule-number">1</span>
          <span class="rule-text">A hallucinated statistic looks identical to a real one — <strong>always verify</strong></span>
        </div>
        <div class="rule-item fragment">
          <span class="rule-number">2</span>
          <span class="rule-text">Check data policies <strong>before</strong> pasting anything into a consumer AI tool</span>
        </div>
        <div class="rule-item fragment">
          <span class="rule-number">3</span>
          <span class="rule-text">Be especially careful when AI output will <strong>affect or describe people</strong></span>
        </div>
        <div class="rule-item fragment">
          <span class="rule-number">4</span>
          <span class="rule-text">Don't feed AI tools documents from <strong>untrusted sources</strong></span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════
         ACTIVITIES
         ═══════════════════════════════════════════════════════════════ -->
    <section>
      <div class="slide-activity">
        <div class="activity-badge">🏋️ ACTIVITY</div>
        <h2>Tool Survey</h2>
        <p class="activity-instruction">Explore the current AI tool landscape by reviewing tools across five categories.</p>
        <div class="activity-steps">
          <div class="step fragment">
            <span class="step-num">1</span>
            <span>Open each tool category in the activity panel</span>
          </div>
          <div class="step fragment">
            <span class="step-num">2</span>
            <span>Check off tools you've tried or are aware of</span>
          </div>
          <div class="step fragment">
            <span class="step-num">3</span>
            <span>Try at least one new tool you haven't used before</span>
          </div>
        </div>
        <p class="activity-note fragment">💡 No minimum — just explore with curiosity!</p>
      </div>
    </section>

    <section>
      <div class="slide-activity">
        <div class="activity-badge">🏋️ ACTIVITY</div>
        <h2>Personal Tool Map</h2>
        <p class="activity-instruction">Build a reference document you'll use beyond this course.</p>
        <div class="activity-capture">
          <h3 class="fragment">For each tool, capture:</h3>
          <div class="capture-grid">
            <div class="capture-item fragment">
              <span class="capture-icon">✅</span>
              <strong>What it's good for</strong><br>
              <span class="capture-detail">Be specific — not "writing" but "drafting client emails"</span>
            </div>
            <div class="capture-item fragment">
              <span class="capture-icon">❌</span>
              <strong>Where it fails</strong><br>
              <span class="capture-detail">Document weaknesses now to save frustration later</span>
            </div>
            <div class="capture-item fragment">
              <span class="capture-icon">🚫</span>
              <strong>Data restrictions</strong><br>
              <span class="capture-detail">What should never be shared with this tool?</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════
         WRAP-UP
         ═══════════════════════════════════════════════════════════════ -->
    <section>
      <h2>Key Takeaways</h2>
      <div class="slide-takeaways">
        <div class="takeaway-item fragment">
          <span class="takeaway-icon">🎯</span>
          <p>Generative AI is <strong>statistical prediction at scale</strong> — powerful but not understanding</p>
        </div>
        <div class="takeaway-item fragment">
          <span class="takeaway-icon">🔌</span>
          <p><strong>Embedded AI</strong> in tools you already use may offer the fastest productivity gains</p>
        </div>
        <div class="takeaway-item fragment">
          <span class="takeaway-icon">🗂️</span>
          <p>Five tool categories help you <strong>pick the right tool</strong> for the job</p>
        </div>
        <div class="takeaway-item fragment">
          <span class="takeaway-icon">⚠️</span>
          <p>Always <strong>verify, check privacy, watch for bias</strong> — you bring the judgment</p>
        </div>
      </div>
    </section>

    <section>
      <div class="slide-next-module">
        <span class="next-label">NEXT MODULE</span>
        <h2>Prompt Engineering &amp;<br>Professional Writing</h2>
        <p class="next-preview">Learn to write prompts that get consistently useful output — structure, specificity, and the art of iterating.</p>
        <div class="next-arrow">→</div>
      </div>
    </section>
  `;
}

export default { getSlides };
