/**
 * Unit tests for AIModelRegistry
 * Tests model availability, subscription, provider mapping, and caching.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Track subscribe listeners so we can simulate config changes
const subscribeListeners = new Map();

vi.mock('../../public/js/core/sync-engine.js', () => {
  return {
    default: {
      subscribe: vi.fn((path, callback) => {
        subscribeListeners.set(path, callback);
        return () => {
          subscribeListeners.delete(path);
        };
      })
    }
  };
});

// Import after mock is set up
import {
  ALL_MODELS,
  getAvailableModels,
  onModelsChanged,
  getModelsForProvider,
  isModelAvailable,
  getDefaultModel,
  destroy
} from '../../public/js/chat/ai-model-registry.js';
import SyncEngine from '../../public/js/core/sync-engine.js';

// Helper to simulate Firebase config change
function simulateConfigChange(passcode, configData) {
  const path = `/sessions/${passcode}/chat/config`;
  const listener = subscribeListeners.get(path);
  if (listener) {
    listener(configData);
  }
}

// --- Tests ---

describe('AIModelRegistry - ALL_MODELS constant', () => {
  it('contains exactly 6 models', () => {
    expect(ALL_MODELS).toHaveLength(6);
  });

  it('contains the expected model IDs', () => {
    const ids = ALL_MODELS.map(m => m.id);
    expect(ids).toContain('gpt-4o');
    expect(ids).toContain('gpt-4o-mini');
    expect(ids).toContain('claude-sonnet');
    expect(ids).toContain('claude-haiku');
    expect(ids).toContain('gemini-pro');
    expect(ids).toContain('gemini-flash');
  });

  it('each model has id, name, provider, and displayName', () => {
    for (const model of ALL_MODELS) {
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('provider');
      expect(model).toHaveProperty('displayName');
      expect(typeof model.id).toBe('string');
      expect(typeof model.name).toBe('string');
      expect(typeof model.provider).toBe('string');
      expect(typeof model.displayName).toBe('string');
    }
  });

  it('models have correct provider assignments', () => {
    const openai = ALL_MODELS.filter(m => m.provider === 'openai');
    const anthropic = ALL_MODELS.filter(m => m.provider === 'anthropic');
    const google = ALL_MODELS.filter(m => m.provider === 'google');

    expect(openai).toHaveLength(2);
    expect(anthropic).toHaveLength(2);
    expect(google).toHaveLength(2);
  });

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(ALL_MODELS)).toBe(true);
  });
});

describe('AIModelRegistry - getModelsForProvider', () => {
  it('returns OpenAI models', () => {
    const models = getModelsForProvider('openai');
    expect(models).toEqual(['gpt-4o', 'gpt-4o-mini']);
  });

  it('returns Anthropic models', () => {
    const models = getModelsForProvider('anthropic');
    expect(models).toEqual(['claude-sonnet', 'claude-haiku']);
  });

  it('returns Google models', () => {
    const models = getModelsForProvider('google');
    expect(models).toEqual(['gemini-pro', 'gemini-flash']);
  });

  it('is case-insensitive for provider name', () => {
    expect(getModelsForProvider('OpenAI')).toEqual(['gpt-4o', 'gpt-4o-mini']);
    expect(getModelsForProvider('ANTHROPIC')).toEqual(['claude-sonnet', 'claude-haiku']);
    expect(getModelsForProvider('Google')).toEqual(['gemini-pro', 'gemini-flash']);
  });

  it('returns empty array for unknown provider', () => {
    expect(getModelsForProvider('unknown')).toEqual([]);
  });

  it('returns empty array for null input', () => {
    expect(getModelsForProvider(null)).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    expect(getModelsForProvider(undefined)).toEqual([]);
  });

  it('returns empty array for non-string input', () => {
    expect(getModelsForProvider(123)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(getModelsForProvider('')).toEqual([]);
  });
});

describe('AIModelRegistry - getAvailableModels', () => {
  beforeEach(() => {
    destroy();
    subscribeListeners.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    destroy();
  });

  it('returns empty array when no subscription is active', () => {
    const models = getAvailableModels('ABC123');
    expect(models).toEqual([]);
  });

  it('returns empty array for null passcode', () => {
    expect(getAvailableModels(null)).toEqual([]);
  });

  it('returns empty array for non-string passcode', () => {
    expect(getAvailableModels(123)).toEqual([]);
  });

  it('returns available models after subscription receives config', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'claude-sonnet', 'gemini-pro'],
      disabledModels: []
    });

    const models = getAvailableModels('ABC123');
    expect(models).toHaveLength(3);
    expect(models.map(m => m.id)).toEqual(['gpt-4o', 'claude-sonnet', 'gemini-pro']);
  });

  it('excludes disabled models from available list', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'gpt-4o-mini', 'claude-sonnet'],
      disabledModels: ['gpt-4o-mini']
    });

    const models = getAvailableModels('ABC123');
    expect(models).toHaveLength(2);
    expect(models.map(m => m.id)).toEqual(['gpt-4o', 'claude-sonnet']);
  });

  it('returns empty array when enabledModels is empty', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: [],
      disabledModels: []
    });

    expect(getAvailableModels('ABC123')).toEqual([]);
  });

  it('ignores unknown model IDs in enabledModels', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'unknown-model', 'claude-sonnet'],
      disabledModels: []
    });

    const models = getAvailableModels('ABC123');
    expect(models).toHaveLength(2);
    expect(models.map(m => m.id)).toEqual(['gpt-4o', 'claude-sonnet']);
  });

  it('returns full model objects with metadata', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o'],
      disabledModels: []
    });

    const models = getAvailableModels('ABC123');
    expect(models[0]).toEqual({
      id: 'gpt-4o',
      name: 'gpt-4o',
      provider: 'openai',
      displayName: 'GPT-4o'
    });
  });
});

describe('AIModelRegistry - onModelsChanged', () => {
  beforeEach(() => {
    destroy();
    subscribeListeners.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    destroy();
  });

  it('subscribes to Firebase config path via SyncEngine', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    expect(SyncEngine.subscribe).toHaveBeenCalledWith(
      '/sessions/ABC123/chat/config',
      expect.any(Function)
    );
  });

  it('notifies callback when config changes', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'claude-sonnet'],
      disabledModels: []
    });

    expect(callback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'gpt-4o' }),
        expect.objectContaining({ id: 'claude-sonnet' })
      ])
    );
  });

  it('returns an unsubscribe function', () => {
    const callback = vi.fn();
    const unsubscribe = onModelsChanged('ABC123', callback);

    expect(typeof unsubscribe).toBe('function');
  });

  it('stops receiving updates after unsubscribe', () => {
    const callback = vi.fn();
    const unsubscribe = onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o'],
      disabledModels: []
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe — this tears down the subscription since it's the only callback
    unsubscribe();

    // Listener is removed from subscribeListeners map by the mock's unsubscribe
    // So simulateConfigChange won't find it
    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'claude-sonnet'],
      disabledModels: []
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('supports multiple callbacks for the same passcode', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    onModelsChanged('ABC123', callback1);
    onModelsChanged('ABC123', callback2);

    simulateConfigChange('ABC123', {
      enabledModels: ['gemini-pro'],
      disabledModels: []
    });

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('returns no-op function for null passcode', () => {
    const callback = vi.fn();
    const unsub = onModelsChanged(null, callback);
    expect(typeof unsub).toBe('function');
    unsub(); // Should not throw
  });

  it('returns no-op function for non-function callback', () => {
    const unsub = onModelsChanged('ABC123', 'not-a-function');
    expect(typeof unsub).toBe('function');
    unsub(); // Should not throw
  });

  it('notifies callback immediately if cache is already populated', () => {
    const callback1 = vi.fn();
    onModelsChanged('ABC123', callback1);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o'],
      disabledModels: []
    });

    // Now register a second callback — should be called immediately with cached data
    const callback2 = vi.fn();
    onModelsChanged('ABC123', callback2);

    expect(callback2).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'gpt-4o' })
    ]);
  });

  it('handles null config data gracefully', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', null);

    expect(callback).toHaveBeenCalledWith([]);
  });

  it('handles config with missing enabledModels', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', { disabledModels: ['gpt-4o'] });

    expect(callback).toHaveBeenCalledWith([]);
  });

  it('does not notify when models have not changed', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    const config = {
      enabledModels: ['gpt-4o', 'claude-sonnet'],
      disabledModels: []
    };

    simulateConfigChange('ABC123', config);
    expect(callback).toHaveBeenCalledTimes(1);

    // Same config again — should not notify
    simulateConfigChange('ABC123', config);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('AIModelRegistry - isModelAvailable', () => {
  beforeEach(() => {
    destroy();
    subscribeListeners.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    destroy();
  });

  it('returns false when no cache exists', () => {
    expect(isModelAvailable('ABC123', 'gpt-4o')).toBe(false);
  });

  it('returns true for an enabled model', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'claude-sonnet'],
      disabledModels: []
    });

    expect(isModelAvailable('ABC123', 'gpt-4o')).toBe(true);
    expect(isModelAvailable('ABC123', 'claude-sonnet')).toBe(true);
  });

  it('returns false for a disabled model', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'gpt-4o-mini'],
      disabledModels: ['gpt-4o-mini']
    });

    expect(isModelAvailable('ABC123', 'gpt-4o-mini')).toBe(false);
  });

  it('returns false for a model not in enabledModels', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o'],
      disabledModels: []
    });

    expect(isModelAvailable('ABC123', 'claude-sonnet')).toBe(false);
  });

  it('returns false for null passcode', () => {
    expect(isModelAvailable(null, 'gpt-4o')).toBe(false);
  });

  it('returns false for null modelId', () => {
    expect(isModelAvailable('ABC123', null)).toBe(false);
  });

  it('returns false for non-string arguments', () => {
    expect(isModelAvailable(123, 'gpt-4o')).toBe(false);
    expect(isModelAvailable('ABC123', 456)).toBe(false);
  });
});

describe('AIModelRegistry - getDefaultModel', () => {
  beforeEach(() => {
    destroy();
    subscribeListeners.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    destroy();
  });

  it('returns null when no cache exists', () => {
    expect(getDefaultModel('ABC123')).toBeNull();
  });

  it('returns the first available model ID', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['claude-sonnet', 'gpt-4o', 'gemini-pro'],
      disabledModels: []
    });

    expect(getDefaultModel('ABC123')).toBe('claude-sonnet');
  });

  it('returns null when all models are disabled', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o'],
      disabledModels: ['gpt-4o']
    });

    expect(getDefaultModel('ABC123')).toBeNull();
  });

  it('skips disabled models and returns first available', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o', 'claude-sonnet', 'gemini-pro'],
      disabledModels: ['gpt-4o']
    });

    expect(getDefaultModel('ABC123')).toBe('claude-sonnet');
  });

  it('returns null for null passcode', () => {
    expect(getDefaultModel(null)).toBeNull();
  });

  it('returns null for non-string passcode', () => {
    expect(getDefaultModel(123)).toBeNull();
  });

  it('returns null for empty string passcode', () => {
    expect(getDefaultModel('')).toBeNull();
  });
});

describe('AIModelRegistry - destroy', () => {
  beforeEach(() => {
    subscribeListeners.clear();
    vi.clearAllMocks();
  });

  it('clears all cached data', () => {
    const callback = vi.fn();
    onModelsChanged('ABC123', callback);

    simulateConfigChange('ABC123', {
      enabledModels: ['gpt-4o'],
      disabledModels: []
    });

    expect(getAvailableModels('ABC123')).toHaveLength(1);

    destroy();

    expect(getAvailableModels('ABC123')).toEqual([]);
  });

  it('can be called multiple times safely', () => {
    destroy();
    destroy();
    destroy();
    // Should not throw
  });
});
