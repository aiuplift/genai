/**
 * ModuleRegistry - static module/activity configuration registry
 *
 * Provides a central store for all module definitions including
 * activities, fields, and validation rules. Module content is
 * registered by individual module definition files (tasks 10.x–14.x).
 *
 * Requirements: 2.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1
 */

// --- Internal registry store ---
const _modules = new Map();

/**
 * Register a module definition in the registry.
 * @param {ModuleDefinition} moduleDefinition - The module to register
 * @throws {Error} If moduleDefinition is invalid or missing required fields
 */
export function registerModule(moduleDefinition) {
  if (!moduleDefinition || typeof moduleDefinition !== 'object') {
    throw new Error('Module definition must be a non-null object');
  }
  if (!moduleDefinition.id || typeof moduleDefinition.id !== 'string') {
    throw new Error('Module definition must have a string "id" property');
  }
  if (!moduleDefinition.title || typeof moduleDefinition.title !== 'string') {
    throw new Error('Module definition must have a string "title" property');
  }
  if (!Array.isArray(moduleDefinition.activities)) {
    throw new Error('Module definition must have an "activities" array');
  }

  _modules.set(moduleDefinition.id, moduleDefinition);
}

/**
 * Get a module definition by its ID.
 * @param {string} moduleId - The module identifier (e.g. 'module1')
 * @returns {ModuleDefinition|null} The module definition or null if not found
 */
export function getModule(moduleId) {
  if (!moduleId || typeof moduleId !== 'string') return null;
  return _modules.get(moduleId) || null;
}

/**
 * Get an activity definition within a module.
 * @param {string} moduleId - The module identifier
 * @param {string} activityId - The activity identifier within the module
 * @returns {ActivityDefinition|null} The activity definition or null if not found
 */
export function getActivity(moduleId, activityId) {
  const module = getModule(moduleId);
  if (!module) return null;
  if (!activityId || typeof activityId !== 'string') return null;

  return module.activities.find(a => a.id === activityId) || null;
}

/**
 * Get all registered module definitions, ordered by their ID.
 * @returns {ModuleDefinition[]} Array of all registered modules
 */
export function getAllModules() {
  return Array.from(_modules.values()).sort((a, b) => {
    // Natural sort by module ID (module1, module2, ..., module10)
    const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
}

/**
 * Get field validation rules for a specific field in an activity.
 * @param {string} moduleId - The module identifier
 * @param {string} activityId - The activity identifier
 * @param {string} fieldId - The field identifier within the activity
 * @returns {ValidationRules|null} The validation rules or null if not found
 */
export function getFieldValidation(moduleId, activityId, fieldId) {
  const activity = getActivity(moduleId, activityId);
  if (!activity) return null;
  if (!fieldId || typeof fieldId !== 'string') return null;

  // Check fields array directly on the activity
  if (Array.isArray(activity.fields)) {
    const field = activity.fields.find(f => f.id === fieldId);
    if (field) {
      return _extractValidationRules(field);
    }
  }

  // Check fields nested within categories (e.g., checklist activities)
  if (Array.isArray(activity.categories)) {
    for (const category of activity.categories) {
      if (Array.isArray(category.fields)) {
        const field = category.fields.find(f => f.id === fieldId);
        if (field) {
          return _extractValidationRules(field);
        }
      }
      // Check items within categories (for checklists)
      if (Array.isArray(category.items)) {
        const item = category.items.find(i => i.id === fieldId);
        if (item) {
          return _extractValidationRules(item);
        }
      }
    }
  }

  return null;
}

/**
 * Extract validation rules from a field definition.
 * @param {object} field - Field definition object
 * @returns {ValidationRules} Extracted validation rules
 * @private
 */
function _extractValidationRules(field) {
  const rules = {};

  if (field.minLength !== undefined) rules.minLength = field.minLength;
  if (field.maxLength !== undefined) rules.maxLength = field.maxLength;
  if (field.required !== undefined) rules.required = field.required;
  if (field.pattern !== undefined) rules.pattern = field.pattern;
  if (field.type !== undefined) rules.type = field.type;
  if (field.min !== undefined) rules.min = field.min;
  if (field.max !== undefined) rules.max = field.max;
  if (field.acceptedFormats !== undefined) rules.acceptedFormats = field.acceptedFormats;
  if (field.maxSize !== undefined) rules.maxSize = field.maxSize;

  return rules;
}

/**
 * Clear all registered modules (useful for testing).
 */
export function clearRegistry() {
  _modules.clear();
}

/**
 * Get the count of registered modules.
 * @returns {number} Number of registered modules
 */
export function getModuleCount() {
  return _modules.size;
}

// --- Default Export (ModuleRegistry interface) ---
const ModuleRegistry = {
  registerModule,
  getModule,
  getActivity,
  getAllModules,
  getFieldValidation,
  clearRegistry,
  getModuleCount
};

export default ModuleRegistry;
