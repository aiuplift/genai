import { describe, it, expect } from 'vitest';
import { validateField, validateGroupId, validateDisplayName } from '../../public/js/core/validation.js';

describe('validateField', () => {
  describe('required rule', () => {
    it('returns invalid for empty string when required', () => {
      const result = validateField('', { required: true });
      expect(result).toEqual({ valid: false, error: 'This field is required' });
    });

    it('returns invalid for whitespace-only string when required', () => {
      const result = validateField('   ', { required: true });
      expect(result).toEqual({ valid: false, error: 'This field is required' });
    });

    it('returns valid for non-empty string when required', () => {
      const result = validateField('hello', { required: true });
      expect(result).toEqual({ valid: true });
    });

    it('returns valid for empty string when not required', () => {
      const result = validateField('', { required: false });
      expect(result).toEqual({ valid: true });
    });

    it('returns invalid for null when required', () => {
      const result = validateField(null, { required: true });
      expect(result).toEqual({ valid: false, error: 'This field is required' });
    });

    it('returns invalid for undefined when required', () => {
      const result = validateField(undefined, { required: true });
      expect(result).toEqual({ valid: false, error: 'This field is required' });
    });
  });

  describe('minLength rule', () => {
    it('returns invalid when value is shorter than minLength', () => {
      const result = validateField('x', { minLength: 10 });
      expect(result).toEqual({ valid: false, error: 'Minimum 10 characters required' });
    });

    it('returns valid when value meets minLength exactly', () => {
      const result = validateField('abcde', { minLength: 5 });
      expect(result).toEqual({ valid: true });
    });

    it('returns valid when value exceeds minLength', () => {
      const result = validateField('hello world', { minLength: 5 });
      expect(result).toEqual({ valid: true });
    });

    it('skips minLength check for empty non-required field', () => {
      const result = validateField('', { minLength: 5 });
      expect(result).toEqual({ valid: true });
    });
  });

  describe('maxLength rule', () => {
    it('returns invalid when value exceeds maxLength', () => {
      const result = validateField('hello world', { maxLength: 5 });
      expect(result).toEqual({ valid: false, error: 'Maximum 5 characters allowed' });
    });

    it('returns valid when value meets maxLength exactly', () => {
      const result = validateField('hello', { maxLength: 5 });
      expect(result).toEqual({ valid: true });
    });

    it('returns valid when value is shorter than maxLength', () => {
      const result = validateField('hi', { maxLength: 5 });
      expect(result).toEqual({ valid: true });
    });
  });

  describe('pattern rule', () => {
    it('returns invalid when value does not match pattern', () => {
      const result = validateField('hello!', { pattern: /^[a-z]+$/ });
      expect(result).toEqual({ valid: false, error: 'Invalid format' });
    });

    it('returns valid when value matches pattern', () => {
      const result = validateField('hello', { pattern: /^[a-z]+$/ });
      expect(result).toEqual({ valid: true });
    });

    it('handles complex regex patterns', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(validateField('user@example.com', { pattern: emailPattern })).toEqual({ valid: true });
      expect(validateField('not-an-email', { pattern: emailPattern })).toEqual({ valid: false, error: 'Invalid format' });
    });
  });

  describe('min/max numeric rules', () => {
    it('returns invalid when numeric value is below min', () => {
      const result = validateField('2', { min: 5 });
      expect(result).toEqual({ valid: false, error: 'Minimum value is 5' });
    });

    it('returns valid when numeric value meets min exactly', () => {
      const result = validateField('5', { min: 5 });
      expect(result).toEqual({ valid: true });
    });

    it('returns invalid when numeric value exceeds max', () => {
      const result = validateField('10', { max: 5 });
      expect(result).toEqual({ valid: false, error: 'Maximum value is 5' });
    });

    it('returns valid when numeric value meets max exactly', () => {
      const result = validateField('5', { max: 5 });
      expect(result).toEqual({ valid: true });
    });

    it('returns invalid for non-numeric value with min rule', () => {
      const result = validateField('abc', { min: 1 });
      expect(result).toEqual({ valid: false, error: 'Minimum value is 1' });
    });

    it('returns invalid for non-numeric value with max rule', () => {
      const result = validateField('abc', { max: 10 });
      expect(result).toEqual({ valid: false, error: 'Maximum value is 10' });
    });
  });

  describe('combined rules', () => {
    it('validates with minLength and maxLength together', () => {
      expect(validateField('hello', { minLength: 1, maxLength: 500 })).toEqual({ valid: true });
      expect(validateField('', { required: true, minLength: 1, maxLength: 500 })).toEqual({ valid: false, error: 'This field is required' });
    });

    it('checks required before minLength', () => {
      const result = validateField('', { required: true, minLength: 5 });
      expect(result).toEqual({ valid: false, error: 'This field is required' });
    });

    it('checks minLength before pattern', () => {
      const result = validateField('a', { minLength: 5, pattern: /^[a-z]+$/ });
      expect(result).toEqual({ valid: false, error: 'Minimum 5 characters required' });
    });

    it('validates all rules pass', () => {
      const result = validateField('hello', { required: true, minLength: 1, maxLength: 10, pattern: /^[a-z]+$/ });
      expect(result).toEqual({ valid: true });
    });
  });

  describe('edge cases', () => {
    it('returns valid when rules is null', () => {
      expect(validateField('anything', null)).toEqual({ valid: true });
    });

    it('returns valid when rules is undefined', () => {
      expect(validateField('anything', undefined)).toEqual({ valid: true });
    });

    it('returns valid when rules is empty object', () => {
      expect(validateField('anything', {})).toEqual({ valid: true });
    });

    it('handles numeric values passed as numbers', () => {
      expect(validateField(42, { min: 1, max: 100 })).toEqual({ valid: true });
    });
  });
});

describe('validateGroupId', () => {
  it('returns valid for alphanumeric input within length', () => {
    expect(validateGroupId('team1')).toEqual({ valid: true });
  });

  it('returns valid for single character', () => {
    expect(validateGroupId('A')).toEqual({ valid: true });
  });

  it('returns valid for exactly 30 characters', () => {
    expect(validateGroupId('a'.repeat(30))).toEqual({ valid: true });
  });

  it('returns invalid for empty string', () => {
    const result = validateGroupId('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Group ID is required');
  });

  it('returns invalid for null', () => {
    const result = validateGroupId(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Group ID is required');
  });

  it('returns invalid for string exceeding 30 characters', () => {
    const result = validateGroupId('a'.repeat(31));
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Group ID must be at most 30 characters');
  });

  it('returns invalid for string with spaces', () => {
    const result = validateGroupId('team one');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Group ID must contain only letters and numbers');
  });

  it('returns invalid for string with special characters', () => {
    const result = validateGroupId('team-1');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Group ID must contain only letters and numbers');
  });

  it('returns invalid for string with underscores', () => {
    const result = validateGroupId('team_1');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Group ID must contain only letters and numbers');
  });

  it('accepts mixed case alphanumeric', () => {
    expect(validateGroupId('TeamAlpha123')).toEqual({ valid: true });
  });

  it('accepts all digits', () => {
    expect(validateGroupId('12345')).toEqual({ valid: true });
  });
});

describe('validateDisplayName', () => {
  it('returns valid for a normal name', () => {
    expect(validateDisplayName('Alice')).toEqual({ valid: true });
  });

  it('returns valid for a single character name', () => {
    expect(validateDisplayName('A')).toEqual({ valid: true });
  });

  it('returns valid for exactly 50 characters', () => {
    expect(validateDisplayName('a'.repeat(50))).toEqual({ valid: true });
  });

  it('returns valid for names with special characters', () => {
    expect(validateDisplayName("O'Brien-Smith")).toEqual({ valid: true });
  });

  it('returns valid for names with unicode characters', () => {
    expect(validateDisplayName('José García')).toEqual({ valid: true });
  });

  it('returns invalid for empty string', () => {
    const result = validateDisplayName('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Display name is required');
  });

  it('returns invalid for whitespace-only string', () => {
    const result = validateDisplayName('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Display name is required');
  });

  it('returns invalid for null', () => {
    const result = validateDisplayName(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Display name is required');
  });

  it('returns invalid for string exceeding 50 characters', () => {
    const result = validateDisplayName('a'.repeat(51));
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Display name must be at most 50 characters');
  });

  it('allows names with numbers and symbols', () => {
    expect(validateDisplayName('User #42!')).toEqual({ valid: true });
  });
});
