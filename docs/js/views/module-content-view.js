/**
 * ModuleContentView — Student exercise experience with AI chat panel
 *
 * Renders module content as a scrollable page with:
 * - Module title and description
 * - Instructional content sections
 * - Callout boxes (warnings, tips, etc.)
 * - Interactive activity forms (checklists, textareas)
 * - A floating "💬 AI Chat" button that toggles the chat sidebar
 * - "← Back to Modules" navigation
 *
 * Routes: #module/:moduleId
 */

import { getModule, getActivity } from '../core/module-registry.js';
import { registerView, navigate } from '../core/router.js';
import { isPreviewMode } from '../core/preview-mode.js';
import { createChatPanel, togglePanel, destroyPanel } from '../chat/chat-panel.js';
import { getActiveSession } from '../core/session-manager.js';

// --- Internal State ---
let _moduleId = null;
let _container = null;
let _chatPanelEl = null;
let _chatFab = null;

// --- Styles ---

const VIEW_STYLES = `
  /* --- Module Content View — AI-themed student exercise page --- */

  .module-content-view {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 24px 120px;
    font-family: system-ui, 'Segoe UI', sans-serif;
    line-height: 1.7;
    color: #1E1B4B;
    background: #F8F7FF;
    min-height: 100vh;
  }

  /* Progress indicator bar at the top */
  .module-progress-bar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: #EDE9FE;
    z-index: 100;
    margin: 0 -24px 0;
  }
  .module-progress-bar__fill {
    height: 100%;
    background: linear-gradient(90deg, #6C3AED, #0891B2);
    border-radius: 0 2px 2px 0;
    transition: width 0.4s ease;
  }

  /* Gradient header hero */
  .module-header-hero {
    background: linear-gradient(135deg, #6C3AED 0%, #0891B2 100%);
    margin: 0 -24px 40px;
    padding: 48px 32px 40px;
    border-radius: 0 0 24px 24px;
    position: relative;
    overflow: hidden;
  }
  .module-header-hero::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
  .module-header-hero::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
    border-radius: 50%;
  }

  .module-content-view__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 20px;
    transition: color 0.2s;
    position: relative;
    z-index: 1;
  }
  .module-content-view__back:hover {
    color: #ffffff;
  }

  .module-content-view__title {
    font-size: 2.2rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 12px;
    position: relative;
    z-index: 1;
    letter-spacing: -0.5px;
  }

  .module-content-view__description {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.8);
    margin: 0;
    position: relative;
    z-index: 1;
    max-width: 600px;
    line-height: 1.6;
  }

  /* Content sections */
  .module-section {
    margin-bottom: 48px;
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(108, 58, 237, 0.06);
    border: 1px solid #EDE9FE;
  }

  .module-section__title {
    font-size: 1.35rem;
    font-weight: 700;
    color: #6C3AED;
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #EDE9FE;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .module-section__title::before {
    content: '◆';
    color: #0891B2;
    font-size: 0.7em;
  }

  .module-section__content {
    font-size: 1rem;
    line-height: 1.8;
    color: #334155;
  }
  .module-section__content p {
    margin: 0 0 16px;
  }
  .module-section__content strong {
    color: #1E1B4B;
  }
  .module-section__content em {
    color: #6C3AED;
    font-style: italic;
  }

  /* Callout sections */
  .module-callout {
    margin-bottom: 48px;
    padding: 24px 28px;
    border-radius: 16px;
    border-left: 5px solid;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    position: relative;
  }
  .module-callout--warning {
    background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
    border-color: #F59E0B;
  }
  .module-callout--info {
    background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
    border-color: #3B82F6;
  }
  .module-callout--tip {
    background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
    border-color: #10B981;
  }
  .module-callout__icon {
    font-size: 1.3rem;
    margin-bottom: 8px;
  }
  .module-callout__title {
    font-size: 1.05rem;
    font-weight: 700;
    margin: 0 0 10px;
    color: #1E1B4B;
  }
  .module-callout__content {
    font-size: 0.95rem;
    line-height: 1.7;
    color: #334155;
  }

  /* Activity sections */
  .module-activity {
    margin-bottom: 48px;
    padding: 28px;
    background: #ffffff;
    border: 1px solid transparent;
    border-radius: 16px;
    position: relative;
    box-shadow: 0 4px 12px rgba(108, 58, 237, 0.08);
  }
  .module-activity::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 17px;
    background: linear-gradient(135deg, #DDD6FE 0%, #A5F3FC 100%);
    z-index: -1;
  }
  .module-activity__title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #6C3AED;
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .module-activity__title::before {
    content: '✏️';
    font-size: 1.1rem;
  }
  .module-activity__description {
    font-size: 0.95rem;
    color: #64748B;
    margin: 0 0 20px;
    line-height: 1.6;
  }

  /* Checklist activity — modern toggle style */
  .activity-checklist {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .activity-checklist__category {
    margin-bottom: 20px;
  }
  .activity-checklist__category-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #6C3AED;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 10px;
    padding: 4px 12px;
    background: #EDE9FE;
    border-radius: 20px;
    display: inline-block;
  }
  .activity-checklist__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    transition: background 0.2s, transform 0.15s;
    margin-bottom: 4px;
  }
  .activity-checklist__item:hover {
    background: #F5F3FF;
    transform: translateX(4px);
  }
  .activity-checklist__item input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #6C3AED;
    cursor: pointer;
    border-radius: 4px;
  }
  .activity-checklist__item label {
    font-size: 0.95rem;
    color: #334155;
    cursor: pointer;
    flex: 1;
  }

  /* Structured entries (textarea fields) */
  .activity-fields {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .activity-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .activity-field__label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4C1D95;
  }
  .activity-field__input {
    width: 100%;
    min-height: 90px;
    padding: 14px 16px;
    border: 2px solid #DDD6FE;
    border-radius: 12px;
    font-size: 0.95rem;
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #FAFAFE;
    color: #1E1B4B;
  }
  .activity-field__input:focus {
    outline: none;
    border-color: #6C3AED;
    box-shadow: 0 0 0 4px rgba(108, 58, 237, 0.1);
    background: #ffffff;
  }
  .activity-field__hint {
    font-size: 0.8rem;
    color: #6B6B80;
  }

  /* Quiz activity — game-like feel */
  .activity-quiz {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .quiz-question {
    padding: 20px;
    background: #F8F7FF;
    border-radius: 14px;
    border: 1px solid #EDE9FE;
  }
  .quiz-question__text {
    font-size: 1.05rem;
    font-weight: 600;
    color: #1E1B4B;
    margin: 0 0 16px;
  }
  .quiz-question__number {
    color: #6C3AED;
    font-weight: 800;
    font-size: 1.1em;
  }
  .quiz-options {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .quiz-option {
    padding: 14px 18px;
    border: 2px solid #EDE9FE;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.95rem;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #ffffff;
  }
  .quiz-option:hover:not(.quiz-option--disabled) {
    border-color: #6C3AED;
    background: #F5F3FF;
    transform: translateX(6px);
    box-shadow: 0 4px 12px rgba(108, 58, 237, 0.12);
  }
  .quiz-option__marker {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #EDE9FE, #E0F7FA);
    font-weight: 700;
    font-size: 0.85rem;
    color: #6C3AED;
    flex-shrink: 0;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .quiz-option:hover:not(.quiz-option--disabled) .quiz-option__marker {
    background: linear-gradient(135deg, #6C3AED, #0891B2);
    color: #ffffff;
  }
  .quiz-option--correct {
    border-color: #10B981;
    background: #ECFDF5;
  }
  .quiz-option--correct .quiz-option__marker {
    background: #10B981;
    color: #fff;
  }
  .quiz-option--incorrect {
    border-color: #EF4444;
    background: #FEF2F2;
  }
  .quiz-option--incorrect .quiz-option__marker {
    background: #EF4444;
    color: #fff;
  }
  .quiz-option--disabled {
    cursor: default;
    opacity: 0.7;
  }
  .quiz-option--disabled.quiz-option--correct {
    opacity: 1;
  }
  .quiz-explanation {
    margin-top: 14px;
    padding: 14px 18px;
    background: #ECFDF5;
    border-left: 4px solid #10B981;
    border-radius: 0 12px 12px 0;
    font-size: 0.9rem;
    color: #166534;
    line-height: 1.6;
    animation: quiz-explain-appear 0.3s ease-out;
  }
  .quiz-explanation--incorrect {
    background: #FEF2F2;
    border-color: #EF4444;
    color: #991B1B;
  }
  @keyframes quiz-explain-appear {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Floating chat button */
  .chat-fab {
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #6C3AED, #0891B2);
    color: #fff;
    font-size: 26px;
    cursor: pointer;
    box-shadow: 0 6px 24px rgba(108, 58, 237, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9000;
    transition: transform 0.2s, box-shadow 0.2s;
    animation: chat-fab-pulse 2.5s ease-in-out infinite;
  }
  .chat-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 32px rgba(108, 58, 237, 0.55);
  }
  .chat-fab:active {
    transform: scale(0.95);
  }

  @keyframes chat-fab-pulse {
    0%, 100% { box-shadow: 0 6px 24px rgba(108, 58, 237, 0.4); }
    50% { box-shadow: 0 6px 36px rgba(108, 58, 237, 0.65); }
  }

  /* Preloaded revision - quoted original */
  .preloaded-item {
    margin-bottom: 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid #EDE9FE;
  }
  .preloaded-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .preloaded-item__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #6C3AED;
    margin: 0 0 10px;
  }
  .preloaded-item__original {
    background: #F1F5F9;
    border-left: 4px solid #94A3B8;
    border-radius: 0 10px 10px 0;
    padding: 16px 20px;
    font-size: 0.9rem;
    font-style: italic;
    color: #475569;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  /* Scenario selection */
  .scenario-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .scenario-card {
    padding: 16px 20px;
    border: 2px solid #EDE9FE;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .scenario-card:hover {
    border-color: #DDD6FE;
    background: #FAFAFE;
  }
  .scenario-card--selected {
    border-color: #6C3AED;
    background: #F5F3FF;
    box-shadow: 0 0 0 3px rgba(108, 58, 237, 0.1);
  }
  .scenario-card--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .scenario-card__checkbox {
    width: 22px;
    height: 22px;
    accent-color: #6C3AED;
    margin-top: 2px;
    flex-shrink: 0;
  }
  .scenario-card__content {
    flex: 1;
  }
  .scenario-card__title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1E1B4B;
    margin: 0 0 4px;
  }
  .scenario-card__desc {
    font-size: 0.85rem;
    color: #64748B;
    line-height: 1.5;
    margin: 0;
  }
  .scenario-response {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #DDD6FE;
  }
  .scenario-limit-note {
    font-size: 0.8rem;
    color: #6C3AED;
    font-weight: 600;
    margin-bottom: 12px;
  }

  /* Peer review - rating circles */
  .peer-review-note {
    font-size: 0.9rem;
    color: #64748B;
    font-style: italic;
    margin-bottom: 20px;
    padding: 12px 16px;
    background: #F5F3FF;
    border-radius: 8px;
  }
  .peer-criterion {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #EDE9FE;
  }
  .peer-criterion:last-child {
    border-bottom: none;
  }
  .peer-criterion__label {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1E1B4B;
    margin: 0 0 4px;
  }
  .peer-criterion__desc {
    font-size: 0.8rem;
    color: #64748B;
    margin: 0 0 12px;
  }
  .peer-rating {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .peer-rating__circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #DDD6FE;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 700;
    color: #6C3AED;
    cursor: pointer;
    transition: all 0.2s;
    background: #FAFAFE;
  }
  .peer-rating__circle:hover {
    border-color: #6C3AED;
    background: #F5F3FF;
    transform: scale(1.1);
  }
  .peer-rating__circle--selected {
    background: #6C3AED;
    color: #fff;
    border-color: #6C3AED;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .module-content-view {
      padding: 0 16px 100px;
    }
    .module-header-hero {
      margin: 0 -16px 32px;
      padding: 32px 20px;
    }
    .module-content-view__title {
      font-size: 1.6rem;
    }
    .module-section {
      padding: 20px;
    }
    .module-activity {
      padding: 20px;
    }
  }
`;

// --- Render Functions ---

/**
 * Render the module content view.
 * @param {object} params - Route parameters { moduleId }
 * @param {HTMLElement} container - The app container
 */
function render(params, container) {
  _cleanup();

  _moduleId = params.moduleId;
  _container = container;

  const moduleDef = getModule(_moduleId);

  container.innerHTML = '';

  // Inject scoped styles
  const styleEl = document.createElement('style');
  styleEl.textContent = VIEW_STYLES;
  container.appendChild(styleEl);

  // Main content wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'module-content-view';
  wrapper.setAttribute('role', 'main');

  // Progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'module-progress-bar';
  const progressFill = document.createElement('div');
  progressFill.className = 'module-progress-bar__fill';
  progressFill.style.width = '0%';
  progressBar.appendChild(progressFill);
  wrapper.appendChild(progressBar);

  // Gradient header hero
  const heroSection = document.createElement('div');
  heroSection.className = 'module-header-hero';

  // Back link (inside hero)
  const backLink = document.createElement('a');
  backLink.href = '#modules';
  backLink.className = 'module-content-view__back';
  backLink.textContent = '← Back to Modules';
  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('#modules');
  });
  heroSection.appendChild(backLink);

  // Module not found
  if (!moduleDef) {
    const errorMsg = document.createElement('p');
    errorMsg.textContent = 'Module not found.';
    errorMsg.style.color = '#ef4444';
    heroSection.appendChild(errorMsg);
    wrapper.appendChild(heroSection);
    container.appendChild(wrapper);
    return;
  }

  // Module title (inside hero)
  const title = document.createElement('h1');
  title.className = 'module-content-view__title';
  title.textContent = moduleDef.title;
  heroSection.appendChild(title);

  // Module description (inside hero)
  if (moduleDef.description) {
    const desc = document.createElement('p');
    desc.className = 'module-content-view__description';
    desc.textContent = moduleDef.description;
    heroSection.appendChild(desc);
  }

  wrapper.appendChild(heroSection);

  // Render sections
  if (Array.isArray(moduleDef.sections)) {
    moduleDef.sections.forEach((section) => {
      const sectionEl = _renderSection(section, moduleDef);
      if (sectionEl) {
        wrapper.appendChild(sectionEl);
      }
    });
  }

  container.appendChild(wrapper);

  // Create chat panel and FAB
  _initChatPanel();

  // Set up scroll-based progress indicator
  _initProgressTracking(wrapper, progressFill);
}

/**
 * Render a single section based on its type.
 * @param {object} section - Section definition
 * @param {object} moduleDef - The full module definition
 * @returns {HTMLElement|null}
 */
function _renderSection(section, moduleDef) {
  switch (section.type) {
    case 'content':
      return _renderContentSection(section);
    case 'callout':
      return _renderCalloutSection(section);
    case 'activity':
      return _renderActivitySection(section, moduleDef);
    default:
      return null;
  }
}

/**
 * Render an instructional content section.
 * @param {object} section - { type: 'content', title, content }
 * @returns {HTMLElement}
 */
function _renderContentSection(section) {
  const el = document.createElement('div');
  el.className = 'module-section';

  if (section.title) {
    const heading = document.createElement('h2');
    heading.className = 'module-section__title';
    heading.textContent = section.title;
    el.appendChild(heading);
  }

  if (section.content) {
    const content = document.createElement('div');
    content.className = 'module-section__content';
    // Content may contain HTML formatting (strong, em, etc.)
    content.innerHTML = _formatContent(section.content);
    el.appendChild(content);
  }

  return el;
}

/**
 * Render a callout/highlighted box section.
 * @param {object} section - { type: 'callout', variant, title, content }
 * @returns {HTMLElement}
 */
function _renderCalloutSection(section) {
  const variant = section.variant || 'info';
  const el = document.createElement('div');
  el.className = `module-callout module-callout--${variant}`;
  el.setAttribute('role', 'note');

  if (section.title) {
    const heading = document.createElement('h3');
    heading.className = 'module-callout__title';
    heading.textContent = section.title;
    el.appendChild(heading);
  }

  if (section.content) {
    const content = document.createElement('div');
    content.className = 'module-callout__content';
    content.innerHTML = _formatContent(section.content);
    el.appendChild(content);
  }

  return el;
}

/**
 * Render an activity section with interactive form fields.
 * @param {object} section - { type: 'activity', activityId }
 * @param {object} moduleDef - Full module definition
 * @returns {HTMLElement|null}
 */
function _renderActivitySection(section, moduleDef) {
  const activityDef = getActivity(_moduleId, section.activityId);
  if (!activityDef) return null;

  const el = document.createElement('div');
  el.className = 'module-activity';
  el.setAttribute('aria-label', `Activity: ${activityDef.title}`);

  // Activity title
  const heading = document.createElement('h3');
  heading.className = 'module-activity__title';
  heading.textContent = activityDef.title;
  el.appendChild(heading);

  // Activity description
  if (activityDef.description) {
    const desc = document.createElement('p');
    desc.className = 'module-activity__description';
    desc.textContent = activityDef.description;
    el.appendChild(desc);
  }

  // Render based on activity type
  switch (activityDef.type) {
    case 'checklist':
      el.appendChild(_renderChecklist(activityDef));
      break;
    case 'structured_entries':
      el.appendChild(_renderStructuredEntries(activityDef));
      break;
    case 'quiz':
      el.appendChild(_renderQuiz(activityDef));
      break;
    case 'form':
      el.appendChild(_renderStructuredEntries(activityDef));
      break;
    case 'preloaded_revision':
      el.appendChild(_renderPreloadedRevision(activityDef));
      break;
    case 'scenario_selection':
      el.appendChild(_renderScenarioSelection(activityDef));
      break;
    case 'peer_review':
      el.appendChild(_renderPeerReview(activityDef));
      break;
    default:
      // Generic fallback for other activity types
      if (Array.isArray(activityDef.fields)) {
        el.appendChild(_renderStructuredEntries(activityDef));
      }
      break;
  }

  return el;
}

/**
 * Render a checklist activity with checkboxes.
 * @param {object} activityDef - Activity definition with categories
 * @returns {HTMLElement}
 */
function _renderChecklist(activityDef) {
  const container = document.createElement('div');
  container.className = 'activity-checklist';

  if (!Array.isArray(activityDef.categories)) return container;

  activityDef.categories.forEach((category) => {
    const catEl = document.createElement('div');
    catEl.className = 'activity-checklist__category';

    const catTitle = document.createElement('div');
    catTitle.className = 'activity-checklist__category-title';
    catTitle.textContent = category.title;
    catEl.appendChild(catTitle);

    if (Array.isArray(category.items)) {
      category.items.forEach((item) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'activity-checklist__item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `check-${category.id}-${item.id}`;
        checkbox.name = item.id;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = item.label;

        itemEl.appendChild(checkbox);
        itemEl.appendChild(label);
        catEl.appendChild(itemEl);
      });
    }

    container.appendChild(catEl);
  });

  return container;
}

/**
 * Render structured entry fields (textareas).
 * @param {object} activityDef - Activity definition with fields array
 * @returns {HTMLElement}
 */
function _renderStructuredEntries(activityDef) {
  const container = document.createElement('div');
  container.className = 'activity-fields';

  if (!Array.isArray(activityDef.fields)) return container;

  activityDef.fields.forEach((field) => {
    const fieldEl = document.createElement('div');
    fieldEl.className = 'activity-field';

    const label = document.createElement('label');
    label.className = 'activity-field__label';
    label.htmlFor = `field-${field.id}`;
    label.textContent = field.label;
    fieldEl.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.className = 'activity-field__input';
    textarea.id = `field-${field.id}`;
    textarea.name = field.id;
    textarea.placeholder = `Enter your ${field.label.toLowerCase()}...`;
    if (field.maxLength) textarea.maxLength = field.maxLength;
    fieldEl.appendChild(textarea);

    if (field.maxLength) {
      const hint = document.createElement('span');
      hint.className = 'activity-field__hint';
      hint.textContent = `Max ${field.maxLength} characters`;
      fieldEl.appendChild(hint);
    }

    container.appendChild(fieldEl);
  });

  return container;
}

/**
 * Render a quiz activity with multiple-choice questions.
 * @param {object} activityDef - Activity definition with questions array
 * @returns {HTMLElement}
 */
function _renderQuiz(activityDef) {
  const container = document.createElement('div');
  container.className = 'activity-quiz';

  if (!Array.isArray(activityDef.questions)) return container;

  activityDef.questions.forEach((question, index) => {
    const questionEl = document.createElement('div');
    questionEl.className = 'quiz-question';

    // Question text
    const questionText = document.createElement('p');
    questionText.className = 'quiz-question__text';
    questionText.innerHTML = `<span class="quiz-question__number">Q${index + 1}.</span> ${question.text}`;
    questionEl.appendChild(questionText);

    // Options
    const optionsList = document.createElement('div');
    optionsList.className = 'quiz-options';
    optionsList.setAttribute('role', 'radiogroup');
    optionsList.setAttribute('aria-label', `Question ${index + 1}`);

    let answered = false;

    question.options.forEach((option) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'quiz-option';
      optionEl.setAttribute('role', 'radio');
      optionEl.setAttribute('aria-checked', 'false');
      optionEl.setAttribute('tabindex', '0');

      const marker = document.createElement('span');
      marker.className = 'quiz-option__marker';
      marker.textContent = option.id.toUpperCase();
      optionEl.appendChild(marker);

      const text = document.createElement('span');
      text.textContent = option.text;
      optionEl.appendChild(text);

      const handleSelect = () => {
        if (answered) return;
        answered = true;

        const isCorrect = option.id === question.correctAnswer;

        // Mark selected option
        optionEl.classList.add(isCorrect ? 'quiz-option--correct' : 'quiz-option--incorrect');

        // If incorrect, also highlight the correct answer
        if (!isCorrect) {
          const allOptions = optionsList.querySelectorAll('.quiz-option');
          allOptions.forEach((opt, i) => {
            if (question.options[i].id === question.correctAnswer) {
              opt.classList.add('quiz-option--correct');
            }
          });
        }

        // Disable all options
        const allOptions = optionsList.querySelectorAll('.quiz-option');
        allOptions.forEach((opt) => {
          opt.classList.add('quiz-option--disabled');
          opt.setAttribute('aria-checked', 'false');
          opt.removeAttribute('tabindex');
        });
        optionEl.setAttribute('aria-checked', 'true');

        // Show explanation
        if (question.explanation) {
          const explanationEl = document.createElement('div');
          explanationEl.className = `quiz-explanation${isCorrect ? '' : ' quiz-explanation--incorrect'}`;
          explanationEl.textContent = isCorrect
            ? `✓ Correct! ${question.explanation}`
            : `✗ Not quite. ${question.explanation}`;
          questionEl.appendChild(explanationEl);
        }
      };

      optionEl.addEventListener('click', handleSelect);
      optionEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });

      optionsList.appendChild(optionEl);
    });

    questionEl.appendChild(optionsList);
    container.appendChild(questionEl);
  });

  return container;
}

/**
 * Render a preloaded revision activity with original content and response fields.
 * @param {object} activityDef - Activity definition with preloadedItems and fieldsPerItem
 * @returns {HTMLElement}
 */
function _renderPreloadedRevision(activityDef) {
  const container = document.createElement('div');
  container.className = 'activity-fields';

  if (!Array.isArray(activityDef.preloadedItems)) return container;

  activityDef.preloadedItems.forEach((item) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'preloaded-item';

    // Item title
    const titleEl = document.createElement('h4');
    titleEl.className = 'preloaded-item__title';
    titleEl.textContent = item.title;
    itemEl.appendChild(titleEl);

    // Original content (read-only quote)
    const originalEl = document.createElement('div');
    originalEl.className = 'preloaded-item__original';
    originalEl.textContent = item.content;
    itemEl.appendChild(originalEl);

    // Response fields per item
    if (Array.isArray(activityDef.fieldsPerItem)) {
      activityDef.fieldsPerItem.forEach((field) => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'activity-field';

        const label = document.createElement('label');
        label.className = 'activity-field__label';
        label.htmlFor = `field-${item.id}-${field.id}`;
        label.textContent = field.label;
        fieldEl.appendChild(label);

        const textarea = document.createElement('textarea');
        textarea.className = 'activity-field__input';
        textarea.id = `field-${item.id}-${field.id}`;
        textarea.name = `${item.id}-${field.id}`;
        textarea.placeholder = field.placeholder || `Enter your ${field.label.toLowerCase()}...`;
        if (field.maxLength) textarea.maxLength = field.maxLength;
        fieldEl.appendChild(textarea);

        if (field.maxLength) {
          const hint = document.createElement('span');
          hint.className = 'activity-field__hint';
          hint.textContent = `Max ${field.maxLength} characters`;
          fieldEl.appendChild(hint);
        }

        itemEl.appendChild(fieldEl);
      });
    }

    container.appendChild(itemEl);
  });

  return container;
}

/**
 * Render a scenario selection activity with selectable cards.
 * @param {object} activityDef - Activity definition with scenarios and responseFields
 * @returns {HTMLElement}
 */
function _renderScenarioSelection(activityDef) {
  const container = document.createElement('div');

  if (!Array.isArray(activityDef.scenarios)) return container;

  const maxSelect = activityDef.selectCount || 2;
  const selectedSet = new Set();

  // Instruction note
  const limitNote = document.createElement('div');
  limitNote.className = 'scenario-limit-note';
  limitNote.textContent = `Select exactly ${maxSelect} scenarios`;
  container.appendChild(limitNote);

  // Scenario grid
  const grid = document.createElement('div');
  grid.className = 'scenario-grid';

  activityDef.scenarios.forEach((scenario) => {
    const card = document.createElement('div');
    card.className = 'scenario-card';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'scenario-card__checkbox';
    checkbox.id = `scenario-${scenario.id}`;
    checkbox.name = scenario.id;
    card.appendChild(checkbox);

    const content = document.createElement('div');
    content.className = 'scenario-card__content';

    const title = document.createElement('h4');
    title.className = 'scenario-card__title';
    title.textContent = scenario.title;
    content.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'scenario-card__desc';
    desc.textContent = scenario.description;
    content.appendChild(desc);

    // Response area (hidden until selected)
    const responseArea = document.createElement('div');
    responseArea.className = 'scenario-response';
    responseArea.style.display = 'none';

    if (Array.isArray(activityDef.responseFields)) {
      activityDef.responseFields.forEach((field) => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'activity-field';

        const label = document.createElement('label');
        label.className = 'activity-field__label';
        label.htmlFor = `field-${scenario.id}-${field.id}`;
        label.textContent = field.label;
        fieldEl.appendChild(label);

        const textarea = document.createElement('textarea');
        textarea.className = 'activity-field__input';
        textarea.id = `field-${scenario.id}-${field.id}`;
        textarea.name = `${scenario.id}-${field.id}`;
        textarea.placeholder = field.placeholder || `Enter your ${field.label.toLowerCase()}...`;
        if (field.maxLength) textarea.maxLength = field.maxLength;
        fieldEl.appendChild(textarea);

        responseArea.appendChild(fieldEl);
      });
    }

    content.appendChild(responseArea);
    card.appendChild(content);

    // Toggle selection
    const updateSelection = () => {
      if (checkbox.checked) {
        selectedSet.add(scenario.id);
        card.classList.add('scenario-card--selected');
        responseArea.style.display = 'block';
      } else {
        selectedSet.delete(scenario.id);
        card.classList.remove('scenario-card--selected');
        responseArea.style.display = 'none';
      }

      // Disable/enable remaining cards based on selection count
      const allCards = grid.querySelectorAll('.scenario-card');
      allCards.forEach((c) => {
        const cb = c.querySelector('.scenario-card__checkbox');
        if (!cb.checked && selectedSet.size >= maxSelect) {
          c.classList.add('scenario-card--disabled');
          cb.disabled = true;
        } else {
          c.classList.remove('scenario-card--disabled');
          cb.disabled = false;
        }
      });
    };

    checkbox.addEventListener('change', updateSelection);
    card.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      if (!checkbox.checked && selectedSet.size >= maxSelect) return;
      checkbox.checked = !checkbox.checked;
      updateSelection();
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);
  return container;
}

/**
 * Render a peer review activity with rating circles and comment fields.
 * @param {object} activityDef - Activity definition with criteria array
 * @returns {HTMLElement}
 */
function _renderPeerReview(activityDef) {
  const container = document.createElement('div');

  if (!Array.isArray(activityDef.criteria)) return container;

  // Info note
  const note = document.createElement('div');
  note.className = 'peer-review-note';
  note.textContent = 'This activity requires viewing another group member\'s work (available during live sessions). For now, practice with the rating form below.';
  container.appendChild(note);

  // Criteria
  activityDef.criteria.forEach((criterion) => {
    const criterionEl = document.createElement('div');
    criterionEl.className = 'peer-criterion';

    const label = document.createElement('h4');
    label.className = 'peer-criterion__label';
    label.textContent = criterion.label;
    criterionEl.appendChild(label);

    if (criterion.description) {
      const desc = document.createElement('p');
      desc.className = 'peer-criterion__desc';
      desc.textContent = criterion.description;
      criterionEl.appendChild(desc);
    }

    // Rating circles (1-5)
    const ratingRow = document.createElement('div');
    ratingRow.className = 'peer-rating';

    const min = criterion.ratingMin || 1;
    const max = criterion.ratingMax || 5;

    for (let i = min; i <= max; i++) {
      const circle = document.createElement('button');
      circle.type = 'button';
      circle.className = 'peer-rating__circle';
      circle.textContent = i;
      circle.setAttribute('aria-label', `Rate ${criterion.label} ${i} out of ${max}`);

      circle.addEventListener('click', () => {
        // Deselect all circles in this row
        ratingRow.querySelectorAll('.peer-rating__circle').forEach((c) => {
          c.classList.remove('peer-rating__circle--selected');
        });
        // Select this one
        circle.classList.add('peer-rating__circle--selected');
      });

      ratingRow.appendChild(circle);
    }

    criterionEl.appendChild(ratingRow);

    // Comment textarea
    const fieldEl = document.createElement('div');
    fieldEl.className = 'activity-field';

    const commentLabel = document.createElement('label');
    commentLabel.className = 'activity-field__label';
    commentLabel.htmlFor = `peer-comment-${criterion.id}`;
    commentLabel.textContent = 'Comment';
    fieldEl.appendChild(commentLabel);

    const textarea = document.createElement('textarea');
    textarea.className = 'activity-field__input';
    textarea.id = `peer-comment-${criterion.id}`;
    textarea.name = `peer-comment-${criterion.id}`;
    textarea.placeholder = `Provide specific feedback on ${criterion.label.toLowerCase()}...`;
    if (criterion.commentMaxLength) textarea.maxLength = criterion.commentMaxLength;
    fieldEl.appendChild(textarea);

    criterionEl.appendChild(fieldEl);
    container.appendChild(criterionEl);
  });

  return container;
}

// --- Chat Panel ---

/**
 * Initialize the chat panel and floating action button.
 */
function _initChatPanel() {
  const session = getActiveSession();
  const passcode = session ? session.passcode : '';
  const participantId = session ? session.participantId : ('demo-' + Math.random().toString(36).slice(2, 10));

  // Create and append chat panel to body
  _chatPanelEl = createChatPanel({
    moduleId: _moduleId,
    context: 'exercise',
    passcode,
    participantId
  });
  document.body.appendChild(_chatPanelEl);

  // Create the floating chat button
  _chatFab = document.createElement('button');
  _chatFab.className = 'chat-fab';
  _chatFab.setAttribute('aria-label', 'Open AI Chat');
  _chatFab.setAttribute('title', 'AI Chat');
  _chatFab.textContent = '💬';
  _chatFab.addEventListener('click', () => {
    togglePanel();
  });
  document.body.appendChild(_chatFab);
}

// --- Helpers ---

/**
 * Format content text into HTML paragraphs, preserving inline HTML.
 * Splits on double newlines to create paragraphs.
 * @param {string} text - Raw content text
 * @returns {string} HTML string
 */
function _formatContent(text) {
  if (!text) return '';
  // Split into paragraphs on double newlines
  const paragraphs = text.split(/\n\n+/);
  return paragraphs
    .map(p => `<p>${p.trim()}</p>`)
    .join('');
}

/**
 * Initialize scroll-based progress tracking.
 * Updates the progress bar as the user scrolls through content.
 * @param {HTMLElement} wrapper - The content wrapper
 * @param {HTMLElement} fillEl - The progress bar fill element
 */
function _initProgressTracking(wrapper, fillEl) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      fillEl.style.width = `${progress}%`;
    }
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  // Store for cleanup
  wrapper._progressHandler = updateProgress;
}

/**
 * Clean up view state and DOM elements when navigating away.
 */
function _cleanup() {
  // Remove scroll progress listener
  if (_container) {
    const wrapper = _container.querySelector('.module-content-view');
    if (wrapper && wrapper._progressHandler) {
      window.removeEventListener('scroll', wrapper._progressHandler);
    }
  }

  // Remove chat panel
  if (_chatPanelEl) {
    destroyPanel();
    if (_chatPanelEl.parentNode) {
      _chatPanelEl.remove();
    }
    _chatPanelEl = null;
  }

  // Remove chat FAB
  if (_chatFab) {
    _chatFab.remove();
    _chatFab = null;
  }

  _moduleId = null;
  _container = null;
}

// --- Register with Router ---

registerView('module', render);

// --- Exports ---

export { render, _cleanup };

export default { render };
