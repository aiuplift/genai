/**
 * Field Validation Utility
 * 
 * Provides generic field validation and specific validators for group ID
 * and display name inputs used across the AI Essentials Exercise Platform.
 */

/**
 * Validate a field value against a set of rules.
 * 
 * @param {string|number} value - The value to validate
 * @param {Object} rules - Validation rules
 * @param {boolean} [rules.required] - Whether the field is required (non-empty)
 * @param {number} [rules.minLength] - Minimum character length
 * @param {number} [rules.maxLength] - Maximum character length
 * @param {RegExp} [rules.pattern] - Regular expression the value must match
 * @param {number} [rules.min] - Minimum numeric value
 * @param {number} [rules.max] - Maximum numeric value
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateField(value, rules) {
  if (!rules || typeof rules !== 'object') {
    return { valid: true };
  }

  const strValue = value == null ? '' : String(value);

  // Required check
  if (rules.required && strValue.trim().length === 0) {
    return { valid: false, error: 'This field is required' };
  }

  // If value is empty and not required, skip remaining checks
  if (strValue.length === 0 && !rules.required) {
    return { valid: true };
  }

  // MinLength check
  if (rules.minLength != null && strValue.length < rules.minLength) {
    return { valid: false, error: `Minimum ${rules.minLength} characters required` };
  }

  // MaxLength check
  if (rules.maxLength != null && strValue.length > rules.maxLength) {
    return { valid: false, error: `Maximum ${rules.maxLength} characters allowed` };
  }

  // Pattern check
  if (rules.pattern != null && !rules.pattern.test(strValue)) {
    return { valid: false, error: 'Invalid format' };
  }

  // Min numeric value check
  if (rules.min != null) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < rules.min) {
      return { valid: false, error: `Minimum value is ${rules.min}` };
    }
  }

  // Max numeric value check
  if (rules.max != null) {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > rules.max) {
      return { valid: false, error: `Maximum value is ${rules.max}` };
    }
  }

  return { valid: true };
}

/**
 * Validate a group ID.
 * Must be 1-30 alphanumeric characters (a-z, A-Z, 0-9).
 * 
 * @param {string} input - The group ID to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateGroupId(input) {
  const strInput = input == null ? '' : String(input);

  if (strInput.length === 0) {
    return { valid: false, error: 'Group ID is required' };
  }

  if (strInput.length > 30) {
    return { valid: false, error: 'Group ID must be at most 30 characters' };
  }

  if (!/^[a-zA-Z0-9]+$/.test(strInput)) {
    return { valid: false, error: 'Group ID must contain only letters and numbers' };
  }

  return { valid: true };
}

/**
 * Validate a display name.
 * Must be 1-50 characters, any printable characters allowed.
 * 
 * @param {string} input - The display name to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDisplayName(input) {
  const strInput = input == null ? '' : String(input);

  if (strInput.trim().length === 0) {
    return { valid: false, error: 'Display name is required' };
  }

  if (strInput.length > 50) {
    return { valid: false, error: 'Display name must be at most 50 characters' };
  }

  return { valid: true };
}
