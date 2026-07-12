/**
 * Unit tests for ChatPanel component
 *
 * Tests DOM construction, open/close/toggle, state persistence,
 * model selector rendering, compare mode toggle, resize handle,
 * send button behavior, and cooldown display.
 *
 * Requirements: 20.1, 20.2, 20.5, 20.6, 21.2, 21.3, 21.4, 24.1, 24.2, 25.3
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing ChatPanel
vi.mock('../../public/js/chat/chat-service.js', () => ({
  canSendPrompt: vi.fn(() => true),
  sendPrompt: vi.fn(),
  sendComparisonPrompt: vi.fn()
}));

vi.mock('../../public/js/chat/ai-model-registry.js', () => ({
  default: {
    ALL_MODELS: [
      { id: 'gpt-4o', name: 'gpt-4o', provider: 'openai', displayName: 'GPT-4o' },
      { id: 'claude-sonnet', name: 'claude-sonnet', provider: 'anthropic', displayName: 'Claude Sonnet' }
    ],
    getAvailableModels: vi.fn(() => [
      { id: 'gpt-4o', name: 'gpt-4o', provider: 'openai', displayName: 'GPT-4o' },
      { id: 'claude-sonnet', name: 'claude-sonnet', provider: 'anthropic', displayName: 'Claude Sonnet' }
    ]),
    onModelsChanged: vi.fn(() => vi.fn()),
    getDefaultModel: vi.fn(() => 'gpt-4o'),
    isModelAvailable: vi.fn(() => true),
    destroy: vi.fn()
  }
}));

vi.mock('../../public/js/chat/token-tracker.js', () => ({
  default: {
    recordUsage: vi.fn()
  }
}));

import { createChatPanel, openPanel, closePanel, togglePanel, destroyPanel } from '../../public/js/chat/chat-panel.js';
import { canSendPrompt, sendPrompt } from '../../public/js/chat/chat-service.js';

describe('ChatPanel', () => {
  let panel;

  beforeEach(() => {
    sessionStorage.clear();
    panel = createChatPanel({ participantId: 'test-user', passcode: 'ABC123' });
    document.body.appendChild(panel);
  });

  afterEach(() => {
    destroyPanel();
    document.body.innerHTML = '';
    sessionStorage.clear();
  });

  describe('DOM structure', () => {
    it('creates an aside element with chat-panel class', () => {
      expect(panel.tagName).toBe('ASIDE');
      expect(panel.classList.contains('chat-panel')).toBe(true);
    });

    it('has role="complementary" and aria-label', () => {
      expect(panel.getAttribute('role')).toBe('complementary');
      expect(panel.getAttribute('aria-label')).toBe('AI Chat');
    });

    it('contains a resize handle', () => {
      const handle = panel.querySelector('.chat-panel__resize-handle');
      expect(handle).not.toBeNull();
      expect(handle.getAttribute('role')).toBe('separator');
    });

    it('contains a header with title', () => {
      const title = panel.querySelector('.chat-panel__title');
      expect(title).not.toBeNull();
      expect(title.textContent).toBe('AI Chat');
    });

    it('contains a model selector dropdown', () => {
      const select = panel.querySelector('#chat-model-select-a');
      expect(select).not.toBeNull();
      expect(select.tagName).toBe('SELECT');
    });

    it('contains a compare button', () => {
      const btn = panel.querySelector('.chat-panel__compare-btn');
      expect(btn).not.toBeNull();
      expect(btn.textContent.trim()).toBe('Compare');
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });

    it('contains a close button', () => {
      const btn = panel.querySelector('.chat-panel__close-btn');
      expect(btn).not.toBeNull();
      expect(btn.getAttribute('aria-label')).toBe('Close chat panel');
    });

    it('contains a messages area with role="log"', () => {
      const messages = panel.querySelector('.chat-panel__messages');
      expect(messages).not.toBeNull();
      expect(messages.getAttribute('role')).toBe('log');
    });

    it('contains an input textarea and send button', () => {
      const input = panel.querySelector('.chat-panel__input');
      const sendBtn = panel.querySelector('.chat-panel__send-btn');
      expect(input).not.toBeNull();
      expect(input.tagName).toBe('TEXTAREA');
      expect(sendBtn).not.toBeNull();
    });

    it('shows empty state message when no messages', () => {
      const empty = panel.querySelector('.chat-panel__empty-state');
      expect(empty).not.toBeNull();
      expect(empty.textContent).toContain('Ask the AI a question');
    });
  });

  describe('open/close/toggle', () => {
    it('panel is closed by default (no open class)', () => {
      expect(panel.classList.contains('chat-panel--open')).toBe(false);
    });

    it('openPanel adds the open class', () => {
      openPanel();
      expect(panel.classList.contains('chat-panel--open')).toBe(true);
    });

    it('closePanel removes the open class', () => {
      openPanel();
      closePanel();
      expect(panel.classList.contains('chat-panel--open')).toBe(false);
    });

    it('togglePanel toggles open state', () => {
      togglePanel();
      expect(panel.classList.contains('chat-panel--open')).toBe(true);
      togglePanel();
      expect(panel.classList.contains('chat-panel--open')).toBe(false);
    });
  });

  describe('state persistence in sessionStorage', () => {
    it('saves open state to sessionStorage', () => {
      openPanel();
      const stored = JSON.parse(sessionStorage.getItem('chatPanel_state'));
      expect(stored.open).toBe(true);
    });

    it('saves closed state to sessionStorage', () => {
      openPanel();
      closePanel();
      const stored = JSON.parse(sessionStorage.getItem('chatPanel_state'));
      expect(stored.open).toBe(false);
    });

    it('restores open state from sessionStorage on create', () => {
      sessionStorage.setItem('chatPanel_state', JSON.stringify({ open: true, width: 450 }));
      destroyPanel();
      document.body.innerHTML = '';

      panel = createChatPanel({ participantId: 'test-user', passcode: 'ABC123' });
      document.body.appendChild(panel);

      expect(panel.classList.contains('chat-panel--open')).toBe(true);
      expect(panel.style.width).toBe('450px');
    });
  });

  describe('compare mode', () => {
    it('second model selector is hidden by default', () => {
      const selectorB = panel.querySelector('.chat-panel__model-selector-b');
      expect(selectorB.style.display).toBe('none');
    });

    it('clicking compare button shows second model selector', () => {
      const btn = panel.querySelector('.chat-panel__compare-btn');
      btn.click();

      const selectorB = panel.querySelector('.chat-panel__model-selector-b');
      expect(selectorB.style.display).toBe('block');
    });

    it('compare button aria-pressed toggles on click', () => {
      const btn = panel.querySelector('.chat-panel__compare-btn');
      const initialState = btn.getAttribute('aria-pressed');
      btn.click();
      const toggledState = btn.getAttribute('aria-pressed');
      expect(toggledState).not.toBe(initialState);
      btn.click();
      expect(btn.getAttribute('aria-pressed')).toBe(initialState);
    });
  });

  describe('send button behavior', () => {
    it('send button is enabled by default', () => {
      const sendBtn = panel.querySelector('.chat-panel__send-btn');
      expect(sendBtn.disabled).toBe(false);
    });

    it('does not send when input is empty', async () => {
      const sendBtn = panel.querySelector('.chat-panel__send-btn');
      sendBtn.click();
      expect(sendPrompt).not.toHaveBeenCalled();
    });

    it('disables send button while request is pending', async () => {
      sendPrompt.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve({ content: 'Hello', model: 'gpt-4o', tokens: { input: 5, output: 10 } }), 50);
      }));

      const input = panel.querySelector('.chat-panel__input');
      const sendBtn = panel.querySelector('.chat-panel__send-btn');

      input.value = 'Hello AI';
      sendBtn.click();

      // Button should be disabled during pending state
      expect(sendBtn.disabled).toBe(true);
    });
  });

  describe('rate limit cooldown', () => {
    it('shows cooldown indicator when canSendPrompt returns false', () => {
      canSendPrompt.mockReturnValueOnce(false);

      const input = panel.querySelector('.chat-panel__input');
      const sendBtn = panel.querySelector('.chat-panel__send-btn');
      input.value = 'Hello';
      sendBtn.click();

      const cooldown = panel.querySelector('.chat-panel__cooldown');
      expect(cooldown.style.display).toBe('flex');
    });
  });

  describe('resize handle', () => {
    it('handle has tabindex for keyboard access', () => {
      const handle = panel.querySelector('.chat-panel__resize-handle');
      expect(handle.getAttribute('tabindex')).toBe('0');
    });

    it('handle has aria-label', () => {
      const handle = panel.querySelector('.chat-panel__resize-handle');
      expect(handle.getAttribute('aria-label')).toBe('Resize chat panel');
    });
  });

  describe('close button', () => {
    it('clicking close button closes the panel', () => {
      openPanel();
      expect(panel.classList.contains('chat-panel--open')).toBe(true);

      const closeBtn = panel.querySelector('.chat-panel__close-btn');
      closeBtn.click();

      expect(panel.classList.contains('chat-panel--open')).toBe(false);
    });
  });
});
