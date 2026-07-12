/**
 * AIModelRegistry — Manages available AI models based on facilitator config
 *
 * Reads enabled/disabled models from Firebase config at
 * /sessions/{passcode}/chat/config and provides methods to query
 * model availability. Uses SyncEngine.subscribe for real-time updates.
 *
 * Requirements: 21.1, 21.2, 21.5, 22.3, 22.4
 */

import SyncEngine from '../core/sync-engine.js';

// --- Static Model Definitions ---

/**
 * Complete registry of all supported models with metadata.
 * @type {Array<{id: string, name: string, provider: string, displayName: string}>}
 */
export const ALL_MODELS = Object.freeze([
  { id: 'gpt-4o', name: 'gpt-4o', provider: 'openai', displayName: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'gpt-4o-mini', provider: 'openai', displayName: 'GPT-4o Mini' },
  { id: 'claude-sonnet', name: 'claude-sonnet', provider: 'anthropic', displayName: 'Claude Sonnet' },
  { id: 'claude-haiku', name: 'claude-haiku', provider: 'anthropic', displayName: 'Claude Haiku' },
  { id: 'gemini-pro', name: 'gemini-pro', provider: 'google', displayName: 'Gemini Pro' },
  { id: 'gemini-flash', name: 'gemini-flash', provider: 'google', displayName: 'Gemini Flash' }
]);

/**
 * Static mapping of provider names to their model IDs.
 * @type {Object<string, string[]>}
 */
const PROVIDER_MODELS = Object.freeze({
  openai: ['gpt-4o', 'gpt-4o-mini'],
  anthropic: ['claude-sonnet', 'claude-haiku'],
  google: ['gemini-pro', 'gemini-flash']
});

// --- Demo Mode Fallback Models ---

/**
 * Demo model definitions shown when no Firebase config is available.
 * All models route to Gemini regardless of selection.
 * @type {Array<{id: string, name: string, provider: string, displayName: string, isDemo: boolean}>}
 */
export const DEMO_MODELS = Object.freeze([
  { id: 'chatgpt', name: 'chatgpt', provider: 'openai', displayName: 'ChatGPT', isDemo: true },
  { id: 'claude', name: 'claude', provider: 'anthropic', displayName: 'Claude', isDemo: true },
  { id: 'gemini', name: 'gemini', provider: 'google', displayName: 'Gemini', isDemo: true }
]);

/**
 * Tracks whether we've fallen back to demo mode per session.
 * @type {Map<string, boolean>}
 */
const _demoModeActive = new Map();

// --- Internal State ---

/**
 * Cache of available models per session passcode.
 * @type {Map<string, string[]>}
 */
const _availableModelsCache = new Map();

/**
 * Active subscriptions per passcode (for cleanup).
 * @type {Map<string, function>}
 */
const _activeSubscriptions = new Map();

/**
 * Callbacks registered for model changes per passcode.
 * @type {Map<string, Set<function>>}
 */
const _changeCallbacks = new Map();

// --- Public API ---

/**
 * Get all models currently enabled for a session.
 * Computes available models as: enabledModels - disabledModels.
 * Returns cached result if available, otherwise reads from current state.
 *
 * @param {string} passcode - Session passcode
 * @returns {Array<{id: string, name: string, provider: string, displayName: string}>}
 */
export function getAvailableModels(passcode) {
  if (!passcode || typeof passcode !== 'string') {
    return [...DEMO_MODELS];
  }

  const cachedIds = _availableModelsCache.get(passcode);
  if (cachedIds && cachedIds.length > 0) {
    return ALL_MODELS.filter(model => cachedIds.includes(model.id));
  }

  // If the subscription fired but returned empty models, activate demo mode
  if (_demoModeActive.get(passcode)) {
    return [...DEMO_MODELS];
  }

  // No cache yet — return demo models so UI doesn't show "Loading..." forever
  return [...DEMO_MODELS];
}

/**
 * Subscribe to model availability changes for a session.
 * Sets up a Firebase listener on the chat config path and notifies
 * the callback whenever the available models change.
 *
 * @param {string} passcode - Session passcode
 * @param {function} callback - Called with updated ModelDefinition[] on change
 * @returns {function} Unsubscribe function
 */
export function onModelsChanged(passcode, callback) {
  if (!passcode || typeof passcode !== 'string' || typeof callback !== 'function') {
    return () => {};
  }

  // Register the callback
  if (!_changeCallbacks.has(passcode)) {
    _changeCallbacks.set(passcode, new Set());
  }
  _changeCallbacks.get(passcode).add(callback);

  // Set up the Firebase subscription if not already active
  if (!_activeSubscriptions.has(passcode)) {
    _setupSubscription(passcode);
  }

  // If we already have cached data, notify immediately
  const cachedIds = _availableModelsCache.get(passcode);
  if (cachedIds && cachedIds.length > 0) {
    try {
      callback(ALL_MODELS.filter(model => cachedIds.includes(model.id)));
    } catch (err) {
      console.error('AIModelRegistry: Error in model change callback:', err);
    }
  } else {
    // Provide demo models immediately so the UI doesn't hang on "Loading..."
    try {
      callback([...DEMO_MODELS]);
    } catch (err) {
      console.error('AIModelRegistry: Error in model change callback (demo fallback):', err);
    }
  }

  // Return unsubscribe function
  return () => {
    const callbacks = _changeCallbacks.get(passcode);
    if (callbacks) {
      callbacks.delete(callback);
      // If no more callbacks for this passcode, tear down subscription
      if (callbacks.size === 0) {
        _changeCallbacks.delete(passcode);
        _teardownSubscription(passcode);
      }
    }
  };
}

/**
 * Get model IDs for a given provider.
 * Static mapping — does not depend on session config.
 *
 * @param {string} provider - Provider name ('openai', 'anthropic', 'google')
 * @returns {string[]} Array of model IDs for the provider, or empty array if unknown
 */
export function getModelsForProvider(provider) {
  if (!provider || typeof provider !== 'string') {
    return [];
  }
  return PROVIDER_MODELS[provider.toLowerCase()] || [];
}

/**
 * Check if a specific model is currently available in a session.
 *
 * @param {string} passcode - Session passcode
 * @param {string} modelId - Model identifier to check
 * @returns {boolean} True if the model is available
 */
export function isModelAvailable(passcode, modelId) {
  if (!passcode || typeof passcode !== 'string' || !modelId || typeof modelId !== 'string') {
    return false;
  }

  const cachedIds = _availableModelsCache.get(passcode);
  if (!cachedIds) {
    return false;
  }

  return cachedIds.includes(modelId);
}

/**
 * Get the first available model for a session (default selection).
 * Returns null if no models are available.
 *
 * @param {string} passcode - Session passcode
 * @returns {string|null} Model ID of the first available model, or null
 */
export function getDefaultModel(passcode) {
  if (!passcode || typeof passcode !== 'string') {
    return DEMO_MODELS[0].id;
  }

  const cachedIds = _availableModelsCache.get(passcode);
  if (!cachedIds || cachedIds.length === 0) {
    return DEMO_MODELS[0].id;
  }

  return cachedIds[0];
}

/**
 * Clear all cached data and subscriptions.
 * Used for cleanup when leaving a session or in tests.
 */
export function destroy() {
  // Tear down all subscriptions
  for (const passcode of _activeSubscriptions.keys()) {
    _teardownSubscription(passcode);
  }
  _availableModelsCache.clear();
  _changeCallbacks.clear();
}

// --- Internal Helpers ---

/**
 * Set up a Firebase subscription for a session's chat config.
 * Listens to the config path and updates the cache on changes.
 *
 * @param {string} passcode
 * @private
 */
function _setupSubscription(passcode) {
  const configPath = `/sessions/${passcode}/chat/config`;

  const unsubscribe = SyncEngine.subscribe(configPath, (configData) => {
    const availableIds = _computeAvailableModels(configData);
    const previousIds = _availableModelsCache.get(passcode);

    // Update cache
    _availableModelsCache.set(passcode, availableIds);

    // Notify callbacks if the available models changed
    if (!_arraysEqual(previousIds, availableIds)) {
      _notifyCallbacks(passcode, availableIds);
    }
  });

  _activeSubscriptions.set(passcode, unsubscribe);
}

/**
 * Tear down the Firebase subscription for a session.
 *
 * @param {string} passcode
 * @private
 */
function _teardownSubscription(passcode) {
  const unsubscribe = _activeSubscriptions.get(passcode);
  if (unsubscribe) {
    unsubscribe();
    _activeSubscriptions.delete(passcode);
  }
  _availableModelsCache.delete(passcode);
}

/**
 * Compute available models from config data.
 * Available = enabledModels - disabledModels.
 * If enabledModels is not set or empty, no models are available.
 *
 * @param {object|null} configData - Raw config from Firebase
 * @returns {string[]} Array of available model IDs
 * @private
 */
function _computeAvailableModels(configData) {
  if (!configData) {
    return [];
  }

  const enabledModels = Array.isArray(configData.enabledModels)
    ? configData.enabledModels
    : [];

  const disabledModels = Array.isArray(configData.disabledModels)
    ? configData.disabledModels
    : [];

  // Filter: only include models that are in enabledModels and NOT in disabledModels
  // Also ensure the model ID is a known model
  const allModelIds = ALL_MODELS.map(m => m.id);

  return enabledModels.filter(
    modelId => allModelIds.includes(modelId) && !disabledModels.includes(modelId)
  );
}

/**
 * Check if a passcode session is in demo mode (no real models configured).
 * @param {string} passcode - Session passcode
 * @returns {boolean}
 */
export function isDemoMode(passcode) {
  if (!passcode || typeof passcode !== 'string') {
    return true;
  }
  const cachedIds = _availableModelsCache.get(passcode);
  return !cachedIds || cachedIds.length === 0;
}

/**
 * Notify all registered callbacks for a passcode about model changes.
 *
 * @param {string} passcode
 * @param {string[]} availableIds
 * @private
 */
function _notifyCallbacks(passcode, availableIds) {
  const callbacks = _changeCallbacks.get(passcode);
  if (!callbacks) return;

  let models;
  if (availableIds.length === 0) {
    // No real models configured — activate demo mode and notify with demo models
    _demoModeActive.set(passcode, true);
    models = [...DEMO_MODELS];
  } else {
    _demoModeActive.set(passcode, false);
    models = ALL_MODELS.filter(model => availableIds.includes(model.id));
  }

  for (const callback of callbacks) {
    try {
      callback(models);
    } catch (err) {
      console.error('AIModelRegistry: Error in model change callback:', err);
    }
  }
}

/**
 * Compare two arrays for shallow equality.
 *
 * @param {string[]|undefined} a
 * @param {string[]|undefined} b
 * @returns {boolean}
 * @private
 */
function _arraysEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

// --- Default Export ---

const AIModelRegistry = {
  ALL_MODELS,
  DEMO_MODELS,
  getAvailableModels,
  onModelsChanged,
  getModelsForProvider,
  isModelAvailable,
  getDefaultModel,
  isDemoMode,
  destroy
};

export default AIModelRegistry;
