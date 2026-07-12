/**
 * Unit tests for ModuleRegistry
 * Tests module registration, retrieval, activity lookup, and field validation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerModule,
  getModule,
  getActivity,
  getAllModules,
  getFieldValidation,
  clearRegistry,
  getModuleCount
} from '../../public/js/core/module-registry.js';

// --- Test fixtures ---

function createTestModule(overrides = {}) {
  return {
    id: 'module1',
    title: 'AI Landscape and Tool Survey',
    activities: [
      {
        id: 'tool-survey',
        title: 'Tool Survey',
        type: 'checklist',
        categories: [
          {
            id: 'chat-generate',
            title: 'Chat and Generate',
            items: [
              { id: 'chatgpt', label: 'ChatGPT', type: 'checkbox' },
              { id: 'claude', label: 'Claude', type: 'checkbox' }
            ]
          },
          {
            id: 'search-grounded',
            title: 'Search-grounded',
            items: [
              { id: 'perplexity', label: 'Perplexity', type: 'checkbox' }
            ]
          }
        ],
        completionRule: 'all_checked'
      },
      {
        id: 'tool-map',
        title: 'Personal Tool Map',
        type: 'structured_entries',
        fields: [
          { id: 'purpose', label: 'Tool Purpose', type: 'textarea', maxLength: 500, minLength: 1 },
          { id: 'strengths', label: 'Strengths', type: 'textarea', maxLength: 500, minLength: 1 },
          { id: 'weaknesses', label: 'Weaknesses', type: 'textarea', maxLength: 500, minLength: 1 },
          { id: 'data-restrictions', label: 'Data Restrictions', type: 'textarea', maxLength: 500, minLength: 1 }
        ],
        minEntries: 1,
        maxEntries: 20,
        completionRule: 'min_entries_filled'
      }
    ],
    ...overrides
  };
}

function createMinimalModule(id, title) {
  return {
    id,
    title,
    activities: []
  };
}

// --- Tests ---

describe('ModuleRegistry - registerModule', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('registers a valid module definition', () => {
    const module = createTestModule();
    registerModule(module);
    expect(getModuleCount()).toBe(1);
  });

  it('registers multiple modules', () => {
    registerModule(createMinimalModule('module1', 'Module 1'));
    registerModule(createMinimalModule('module2', 'Module 2'));
    registerModule(createMinimalModule('module3', 'Module 3'));
    expect(getModuleCount()).toBe(3);
  });

  it('overwrites a module with the same ID', () => {
    registerModule(createMinimalModule('module1', 'Original Title'));
    registerModule(createMinimalModule('module1', 'Updated Title'));
    expect(getModuleCount()).toBe(1);
    expect(getModule('module1').title).toBe('Updated Title');
  });

  it('throws if module definition is null', () => {
    expect(() => registerModule(null)).toThrow('Module definition must be a non-null object');
  });

  it('throws if module definition is not an object', () => {
    expect(() => registerModule('not-an-object')).toThrow('Module definition must be a non-null object');
    expect(() => registerModule(42)).toThrow('Module definition must be a non-null object');
  });

  it('throws if module is missing id', () => {
    expect(() => registerModule({ title: 'No ID', activities: [] })).toThrow('must have a string "id"');
  });

  it('throws if module id is not a string', () => {
    expect(() => registerModule({ id: 123, title: 'Bad ID', activities: [] })).toThrow('must have a string "id"');
  });

  it('throws if module is missing title', () => {
    expect(() => registerModule({ id: 'mod1', activities: [] })).toThrow('must have a string "title"');
  });

  it('throws if module title is not a string', () => {
    expect(() => registerModule({ id: 'mod1', title: 999, activities: [] })).toThrow('must have a string "title"');
  });

  it('throws if module is missing activities array', () => {
    expect(() => registerModule({ id: 'mod1', title: 'No Activities' })).toThrow('must have an "activities" array');
  });

  it('throws if activities is not an array', () => {
    expect(() => registerModule({ id: 'mod1', title: 'Bad Activities', activities: 'not-array' })).toThrow('must have an "activities" array');
  });
});

describe('ModuleRegistry - getModule', () => {
  beforeEach(() => {
    clearRegistry();
    registerModule(createTestModule());
  });

  it('retrieves a registered module by ID', () => {
    const module = getModule('module1');
    expect(module).not.toBeNull();
    expect(module.id).toBe('module1');
    expect(module.title).toBe('AI Landscape and Tool Survey');
  });

  it('returns null for an unregistered module ID', () => {
    expect(getModule('module99')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(getModule(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(getModule(undefined)).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(getModule(123)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getModule('')).toBeNull();
  });
});

describe('ModuleRegistry - getActivity', () => {
  beforeEach(() => {
    clearRegistry();
    registerModule(createTestModule());
  });

  it('retrieves an activity by module and activity ID', () => {
    const activity = getActivity('module1', 'tool-survey');
    expect(activity).not.toBeNull();
    expect(activity.id).toBe('tool-survey');
    expect(activity.title).toBe('Tool Survey');
    expect(activity.type).toBe('checklist');
  });

  it('retrieves the second activity in a module', () => {
    const activity = getActivity('module1', 'tool-map');
    expect(activity).not.toBeNull();
    expect(activity.id).toBe('tool-map');
    expect(activity.title).toBe('Personal Tool Map');
    expect(activity.type).toBe('structured_entries');
  });

  it('returns null for an unregistered activity ID', () => {
    expect(getActivity('module1', 'nonexistent')).toBeNull();
  });

  it('returns null for an unregistered module ID', () => {
    expect(getActivity('module99', 'tool-survey')).toBeNull();
  });

  it('returns null for null moduleId', () => {
    expect(getActivity(null, 'tool-survey')).toBeNull();
  });

  it('returns null for null activityId', () => {
    expect(getActivity('module1', null)).toBeNull();
  });

  it('returns null for non-string activityId', () => {
    expect(getActivity('module1', 123)).toBeNull();
  });

  it('returns null for empty activityId', () => {
    expect(getActivity('module1', '')).toBeNull();
  });
});

describe('ModuleRegistry - getAllModules', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('returns empty array when no modules are registered', () => {
    expect(getAllModules()).toEqual([]);
  });

  it('returns all registered modules', () => {
    registerModule(createMinimalModule('module1', 'Module 1'));
    registerModule(createMinimalModule('module2', 'Module 2'));

    const modules = getAllModules();
    expect(modules).toHaveLength(2);
  });

  it('returns modules sorted by ID in natural order', () => {
    // Register out of order
    registerModule(createMinimalModule('module10', 'Module 10'));
    registerModule(createMinimalModule('module2', 'Module 2'));
    registerModule(createMinimalModule('module1', 'Module 1'));
    registerModule(createMinimalModule('module3', 'Module 3'));

    const modules = getAllModules();
    expect(modules.map(m => m.id)).toEqual(['module1', 'module2', 'module3', 'module10']);
  });

  it('returns a new array instance each time', () => {
    registerModule(createMinimalModule('module1', 'Module 1'));

    const first = getAllModules();
    const second = getAllModules();
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});

describe('ModuleRegistry - getFieldValidation', () => {
  beforeEach(() => {
    clearRegistry();
    registerModule(createTestModule());
  });

  it('returns validation rules for a field in the fields array', () => {
    const rules = getFieldValidation('module1', 'tool-map', 'purpose');
    expect(rules).not.toBeNull();
    expect(rules.minLength).toBe(1);
    expect(rules.maxLength).toBe(500);
    expect(rules.type).toBe('textarea');
  });

  it('returns validation rules for another field', () => {
    const rules = getFieldValidation('module1', 'tool-map', 'strengths');
    expect(rules).not.toBeNull();
    expect(rules.minLength).toBe(1);
    expect(rules.maxLength).toBe(500);
  });

  it('returns validation rules for items within categories', () => {
    const rules = getFieldValidation('module1', 'tool-survey', 'chatgpt');
    expect(rules).not.toBeNull();
    expect(rules.type).toBe('checkbox');
  });

  it('returns null for a non-existent field', () => {
    expect(getFieldValidation('module1', 'tool-map', 'nonexistent')).toBeNull();
  });

  it('returns null for a non-existent activity', () => {
    expect(getFieldValidation('module1', 'nonexistent', 'purpose')).toBeNull();
  });

  it('returns null for a non-existent module', () => {
    expect(getFieldValidation('module99', 'tool-map', 'purpose')).toBeNull();
  });

  it('returns null for null fieldId', () => {
    expect(getFieldValidation('module1', 'tool-map', null)).toBeNull();
  });

  it('returns null for non-string fieldId', () => {
    expect(getFieldValidation('module1', 'tool-map', 123)).toBeNull();
  });

  it('returns null for empty fieldId', () => {
    expect(getFieldValidation('module1', 'tool-map', '')).toBeNull();
  });

  it('includes all relevant validation properties', () => {
    // Register a module with comprehensive field validation
    clearRegistry();
    registerModule({
      id: 'module-test',
      title: 'Test Module',
      activities: [
        {
          id: 'upload-activity',
          title: 'Upload Test',
          type: 'form',
          fields: [
            {
              id: 'chart-upload',
              label: 'Chart',
              type: 'file_upload',
              required: true,
              acceptedFormats: ['png', 'jpg', 'pdf'],
              maxSize: 10485760,
              pattern: '^[a-z]+$',
              min: 1,
              max: 10
            }
          ]
        }
      ]
    });

    const rules = getFieldValidation('module-test', 'upload-activity', 'chart-upload');
    expect(rules).toEqual({
      type: 'file_upload',
      required: true,
      acceptedFormats: ['png', 'jpg', 'pdf'],
      maxSize: 10485760,
      pattern: '^[a-z]+$',
      min: 1,
      max: 10
    });
  });
});

describe('ModuleRegistry - clearRegistry', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('removes all registered modules', () => {
    registerModule(createMinimalModule('module1', 'Module 1'));
    registerModule(createMinimalModule('module2', 'Module 2'));
    expect(getModuleCount()).toBe(2);

    clearRegistry();
    expect(getModuleCount()).toBe(0);
    expect(getAllModules()).toEqual([]);
  });
});

describe('ModuleRegistry - getModuleCount', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('returns 0 when empty', () => {
    expect(getModuleCount()).toBe(0);
  });

  it('returns correct count after registrations', () => {
    registerModule(createMinimalModule('module1', 'Module 1'));
    expect(getModuleCount()).toBe(1);

    registerModule(createMinimalModule('module2', 'Module 2'));
    expect(getModuleCount()).toBe(2);
  });

  it('does not double-count overwritten modules', () => {
    registerModule(createMinimalModule('module1', 'First'));
    registerModule(createMinimalModule('module1', 'Second'));
    expect(getModuleCount()).toBe(1);
  });
});
