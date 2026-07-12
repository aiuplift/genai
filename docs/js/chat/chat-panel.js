/**
 * ChatPanel — Resizable sidebar for AI chat interactions.
 *
 * Renders a sidebar with:
 * - Resizable width (300-800px) via drag handle
 * - Open/close/minimize with sessionStorage persistence
 * - Scrollable message thread with auto-scroll
 * - Message input with send button (disabled during pending)
 * - Model selector from AIModelRegistry
 * - Compare toggle (dual-model dropdowns)
 * - Rate limit cooldown indicator
 * - Token count per message and model name on responses
 *
 * Requirements: 20.1, 20.2, 20.5, 20.6, 21.2, 21.3, 21.4, 24.1, 24.2, 25.3
 */

import { canSendPrompt, sendPrompt, sendComparisonPrompt } from './chat-service.js';
import AIModelRegistry from './ai-model-registry.js';
import TokenTracker from './token-tracker.js';

// --- Constants ---
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 400;
const STORAGE_KEY = 'chatPanel_state';
const RATE_LIMIT_COOLDOWN_MS = 2000;

// --- Internal State ---
let _panelEl = null;
let _state = {
  open: false,
  width: DEFAULT_WIDTH,
  compareMode: false,
  selectedModel: null,
  selectedModelB: null,
  messages: [],
  isPending: false
};
let _options = {};
let _modelUnsubscribe = null;
let _availableModels = [];
let _cooldownInterval = null;

// --- State Persistence ---

function _loadState() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      _state.open = parsed.open ?? false;
      _state.width = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed.width ?? DEFAULT_WIDTH));
      _state.compareMode = parsed.compareMode ?? false;
    }
  } catch (e) {
    // Ignore corrupted storage
  }
}

function _saveState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      open: _state.open,
      width: _state.width,
      compareMode: _state.compareMode
    }));
  } catch (e) {
    // Ignore storage errors
  }
}

// --- DOM Construction ---

function _buildPanel() {
  const panel = document.createElement('aside');
  panel.className = 'chat-panel';
  panel.setAttribute('role', 'complementary');
  panel.setAttribute('aria-label', 'AI Chat');
  panel.id = 'chat-panel';

  panel.innerHTML = `
    <div class="chat-panel__resize-handle" role="separator" aria-label="Resize chat panel" tabindex="0"></div>
    <div class="chat-panel__container">
      <header class="chat-panel__header">
        <div class="chat-panel__header-left">
          <span class="chat-panel__icon" aria-hidden="true">🤖</span>
          <h2 class="chat-panel__title">AI Chat</h2>
        </div>
        <div class="chat-panel__header-controls">
          <div class="chat-panel__model-selector">
            <select class="chat-panel__model-select form-select" aria-label="Select AI model" id="chat-model-select-a">
              <option value="">Loading models...</option>
            </select>
          </div>
          <div class="chat-panel__model-selector-b" style="display:none;">
            <select class="chat-panel__model-select form-select" aria-label="Select comparison model" id="chat-model-select-b">
              <option value="">Model B...</option>
            </select>
          </div>
          <button class="chat-panel__compare-btn btn btn--ghost btn--sm" aria-pressed="false" title="Compare models">
            Compare
          </button>
          <button class="chat-panel__close-btn btn btn--ghost btn--sm" aria-label="Close chat panel" title="Close">✕</button>
        </div>
      </header>
      <div class="chat-panel__cooldown" aria-live="polite" style="display:none;">
        <span class="chat-panel__cooldown-text">Please wait...</span>
      </div>
      <div class="chat-panel__messages" role="log" aria-live="polite" aria-label="Chat messages">
        <div class="chat-panel__empty-state">
          <p>Ask the AI a question about this activity. Your conversation history will appear here.</p>
        </div>
      </div>
      <div class="chat-panel__input-area">
        <div class="chat-panel__input-wrapper">
          <textarea
            class="chat-panel__input form-input"
            placeholder="Type your prompt..."
            aria-label="Chat message input"
            rows="2"
          ></textarea>
          <button class="chat-panel__send-btn btn btn--primary btn--sm" aria-label="Send message" title="Send">
            <span class="chat-panel__send-icon">▶</span>
            <span class="chat-panel__send-loading" style="display:none;">⏳</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return panel;
}

// --- Rendering ---

function _renderMessages() {
  if (!_panelEl) return;
  const container = _panelEl.querySelector('.chat-panel__messages');
  if (!container) return;

  if (_state.messages.length === 0) {
    container.innerHTML = `
      <div class="chat-panel__empty-state">
        <p>Ask the AI a question about this activity. Your conversation history will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = _state.messages.map((msg, idx) => {
    if (msg.role === 'user') {
      return `
        <div class="chat-panel__message chat-panel__message--user" data-index="${idx}">
          <div class="chat-panel__message-content">${_escapeHtml(msg.content)}</div>
        </div>
      `;
    } else if (msg.role === 'assistant') {
      const tokenHtml = msg.tokens
        ? `<div class="chat-panel__token-info" aria-label="Token usage: ${msg.tokens.input} input, ${msg.tokens.output} output">⚡ ${msg.tokens.input} in / ${msg.tokens.output} out</div>`
        : '';
      const modelHtml = msg.model
        ? `<span class="chat-panel__model-label">(${_escapeHtml(msg.model)})</span>`
        : '';
      return `
        <div class="chat-panel__message chat-panel__message--assistant" data-index="${idx}">
          <div class="chat-panel__message-content">${_escapeHtml(msg.content)} ${modelHtml}</div>
          ${tokenHtml}
        </div>
      `;
    } else if (msg.role === 'error') {
      return `
        <div class="chat-panel__message chat-panel__message--error" data-index="${idx}">
          <div class="chat-panel__message-content">⚠️ ${_escapeHtml(msg.content)}</div>
        </div>
      `;
    }
    return '';
  }).join('');

  // Auto-scroll to bottom
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

function _renderModels() {
  if (!_panelEl) return;

  const selectA = _panelEl.querySelector('#chat-model-select-a');
  const selectB = _panelEl.querySelector('#chat-model-select-b');

  if (!selectA || !selectB) return;

  const buildOptions = (selectedId) => {
    if (_availableModels.length === 0) {
      return '<option value="">No models available</option>';
    }
    return _availableModels.map(m =>
      `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${_escapeHtml(m.displayName)}</option>`
    ).join('');
  };

  selectA.innerHTML = buildOptions(_state.selectedModel);
  selectB.innerHTML = buildOptions(_state.selectedModelB);

  // Set selected model if not already set
  if (!_state.selectedModel && _availableModels.length > 0) {
    _state.selectedModel = _availableModels[0].id;
  }
  if (!_state.selectedModelB && _availableModels.length > 1) {
    _state.selectedModelB = _availableModels[1].id;
  } else if (!_state.selectedModelB && _availableModels.length > 0) {
    _state.selectedModelB = _availableModels[0].id;
  }
}

function _updatePanelVisibility() {
  if (!_panelEl) return;

  if (_state.open) {
    _panelEl.classList.add('chat-panel--open');
    _panelEl.style.width = `${_state.width}px`;
  } else {
    _panelEl.classList.remove('chat-panel--open');
  }
}

function _updateCompareMode() {
  if (!_panelEl) return;

  const selectorB = _panelEl.querySelector('.chat-panel__model-selector-b');
  const compareBtn = _panelEl.querySelector('.chat-panel__compare-btn');

  if (selectorB) {
    selectorB.style.display = _state.compareMode ? 'block' : 'none';
  }
  if (compareBtn) {
    compareBtn.setAttribute('aria-pressed', String(_state.compareMode));
    compareBtn.classList.toggle('chat-panel__compare-btn--active', _state.compareMode);
  }
}

function _updateSendButton() {
  if (!_panelEl) return;

  const sendBtn = _panelEl.querySelector('.chat-panel__send-btn');
  const sendIcon = _panelEl.querySelector('.chat-panel__send-icon');
  const sendLoading = _panelEl.querySelector('.chat-panel__send-loading');

  if (sendBtn) {
    sendBtn.disabled = _state.isPending;
    sendBtn.setAttribute('aria-disabled', String(_state.isPending));
  }
  if (sendIcon) {
    sendIcon.style.display = _state.isPending ? 'none' : 'inline';
  }
  if (sendLoading) {
    sendLoading.style.display = _state.isPending ? 'inline' : 'none';
  }
}

// --- Cooldown Indicator ---

function _showCooldown() {
  if (!_panelEl) return;

  const cooldownEl = _panelEl.querySelector('.chat-panel__cooldown');
  const cooldownText = _panelEl.querySelector('.chat-panel__cooldown-text');

  if (!cooldownEl || !cooldownText) return;

  cooldownEl.style.display = 'flex';
  let remaining = RATE_LIMIT_COOLDOWN_MS;

  const update = () => {
    remaining -= 100;
    if (remaining <= 0) {
      cooldownEl.style.display = 'none';
      clearInterval(_cooldownInterval);
      _cooldownInterval = null;
    } else {
      cooldownText.textContent = `Rate limit: wait ${(remaining / 1000).toFixed(1)}s`;
    }
  };

  cooldownText.textContent = `Rate limit: wait ${(remaining / 1000).toFixed(1)}s`;
  _cooldownInterval = setInterval(update, 100);
}

// --- Event Handlers ---

function _setupEventListeners() {
  if (!_panelEl) return;

  // Close button
  const closeBtn = _panelEl.querySelector('.chat-panel__close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }

  // Compare toggle
  const compareBtn = _panelEl.querySelector('.chat-panel__compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      _state.compareMode = !_state.compareMode;
      _updateCompareMode();
      _saveState();
    });
  }

  // Model selectors
  const selectA = _panelEl.querySelector('#chat-model-select-a');
  if (selectA) {
    selectA.addEventListener('change', (e) => {
      _state.selectedModel = e.target.value;
    });
  }

  const selectB = _panelEl.querySelector('#chat-model-select-b');
  if (selectB) {
    selectB.addEventListener('change', (e) => {
      _state.selectedModelB = e.target.value;
    });
  }

  // Send button
  const sendBtn = _panelEl.querySelector('.chat-panel__send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', _handleSend);
  }

  // Input - send on Enter (Shift+Enter for newline)
  const input = _panelEl.querySelector('.chat-panel__input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        _handleSend();
      }
    });
  }

  // Resize handle
  _setupResizeHandler();
}

function _setupResizeHandler() {
  const handle = _panelEl.querySelector('.chat-panel__resize-handle');
  if (!handle) return;

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  const onMouseMove = (e) => {
    if (!isResizing) return;
    const diff = startX - e.clientX;
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + diff));
    _state.width = newWidth;
    _panelEl.style.width = `${newWidth}px`;
  };

  const onMouseUp = () => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    _panelEl.classList.remove('chat-panel--resizing');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    _saveState();
  };

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startWidth = _state.width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    _panelEl.classList.add('chat-panel--resizing');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Keyboard resize support
  handle.addEventListener('keydown', (e) => {
    const step = 20;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      _state.width = Math.min(MAX_WIDTH, _state.width + step);
      _panelEl.style.width = `${_state.width}px`;
      _saveState();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      _state.width = Math.max(MIN_WIDTH, _state.width - step);
      _panelEl.style.width = `${_state.width}px`;
      _saveState();
    }
  });
}

async function _handleSend() {
  if (_state.isPending) return;

  const input = _panelEl.querySelector('.chat-panel__input');
  if (!input) return;

  const prompt = input.value.trim();
  if (!prompt) return;

  // Check rate limit
  if (!canSendPrompt()) {
    _showCooldown();
    return;
  }

  // Add user message
  _state.messages.push({ role: 'user', content: prompt });
  input.value = '';
  _renderMessages();

  // Disable send
  _state.isPending = true;
  _updateSendButton();

  try {
    const { participantId, passcode, context } = _options;

    if (_state.compareMode && _state.selectedModel && _state.selectedModelB) {
      // Comparison mode
      const result = await sendComparisonPrompt({
        prompt,
        models: [_state.selectedModel, _state.selectedModelB],
        context: context ? context() : null,
        participantId,
        passcode
      });

      for (const resp of result.responses) {
        if (resp.error) {
          _state.messages.push({ role: 'error', content: resp.error });
        } else {
          _state.messages.push({
            role: 'assistant',
            content: resp.content,
            model: resp.model,
            tokens: resp.tokens
          });
          // Record token usage
          if (resp.tokens) {
            TokenTracker.recordUsage(participantId, passcode, resp.tokens);
          }
        }
      }
    } else {
      // Single model
      const result = await sendPrompt({
        prompt,
        model: _state.selectedModel,
        context: context ? context() : null,
        participantId,
        passcode
      });

      _state.messages.push({
        role: 'assistant',
        content: result.content,
        model: result.model,
        tokens: result.tokens
      });

      // Record token usage
      if (result.tokens) {
        TokenTracker.recordUsage(participantId, passcode, result.tokens);
      }
    }
  } catch (err) {
    _state.messages.push({ role: 'error', content: err.message || 'An error occurred.' });
  } finally {
    _state.isPending = false;
    _updateSendButton();
    _renderMessages();
  }
}

// --- Utility ---

function _escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Public API ---

/**
 * Create the chat panel element and attach event listeners.
 *
 * @param {Object} options
 * @param {string} options.participantId - Current participant ID
 * @param {string} options.passcode - Session passcode
 * @param {function|null} [options.context] - Function returning context document text
 * @returns {HTMLElement} The chat panel element to insert into the DOM
 */
export function createChatPanel(options = {}) {
  _options = options;
  _loadState();

  _panelEl = _buildPanel();
  _setupEventListeners();
  _updatePanelVisibility();
  _updateCompareMode();

  // Subscribe to model changes
  if (options.passcode) {
    _modelUnsubscribe = AIModelRegistry.onModelsChanged(options.passcode, (models) => {
      _availableModels = models;
      _renderModels();
    });

    // Also try to get initial models
    const initial = AIModelRegistry.getAvailableModels(options.passcode);
    if (initial.length > 0) {
      _availableModels = initial;
      _renderModels();
    }
  } else {
    // No passcode (preview/demo mode) — show demo models immediately
    const demoModels = AIModelRegistry.getAvailableModels('');
    if (demoModels.length > 0) {
      _availableModels = demoModels;
      _renderModels();
    }
  }

  return _panelEl;
}

/**
 * Open the chat panel.
 */
export function openPanel() {
  _state.open = true;
  _updatePanelVisibility();
  _saveState();

  // Focus the input when opened
  if (_panelEl) {
    const input = _panelEl.querySelector('.chat-panel__input');
    if (input) {
      requestAnimationFrame(() => input.focus());
    }
  }
}

/**
 * Close the chat panel.
 */
export function closePanel() {
  _state.open = false;
  _updatePanelVisibility();
  _saveState();
}

/**
 * Toggle the chat panel open/closed.
 */
export function togglePanel() {
  if (_state.open) {
    closePanel();
  } else {
    openPanel();
  }
}

/**
 * Destroy the panel and clean up subscriptions.
 */
export function destroyPanel() {
  if (_modelUnsubscribe) {
    _modelUnsubscribe();
    _modelUnsubscribe = null;
  }
  if (_cooldownInterval) {
    clearInterval(_cooldownInterval);
    _cooldownInterval = null;
  }
  if (_panelEl && _panelEl.parentNode) {
    _panelEl.parentNode.removeChild(_panelEl);
  }
  _panelEl = null;
  _state.messages = [];
}

// --- Default Export ---
const ChatPanel = {
  createChatPanel,
  openPanel,
  closePanel,
  togglePanel,
  destroyPanel
};

export default ChatPanel;
