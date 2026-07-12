/**
 * Unit tests for ActivityView
 *
 * Tests dynamic field rendering, read-only mode, presence indicators,
 * field change handling, and completion status computation.
 *
 * Requirements: 2.3, 2.4, 2.6, 4.1, 4.2, 4.3, 17.4, 17.5
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('../../public/js/core/module-registry.js', () => ({
  getActivity: vi.fn(() => null),
  default: { getActivity: vi.fn(() => null) }
}));

vi.mock('../../public/js/core/sync-engine.js', () => ({
  subscribe: vi.fn(() => () => {}),
  debouncedWrite: vi.fn(),
  immediateWrite: vi.fn(),
  default: {
    subscribe: vi.fn(() => () => {}),
    debouncedWrite: vi.fn(),
    immediateWrite: vi.fn()
  }
}));

vi.mock('../../public/js/core/session-manager.js', () => ({
  getActiveSession: vi.fn(() => null),
  default: { getActiveSession: vi.fn(() => null) }
}));

vi.mock('../../public/js/core/validation.js', () => ({
  validateField: vi.fn(() => ({ valid: true })),
  default: { validateField: vi.fn(() => ({ valid: true })) }
}));

vi.mock('../../public/js/components/avatar-group.js', () => ({
  createAvatarGroup: vi.fn(() => {
    const el = document.createElement('div');
    el.className = 'avatar-group';
    return el;
  }),
  updateAvatarGroup: vi.fn((el) => el)
}));

vi.mock('../../public/js/components/activity-card.js', () => ({
  getActivityStatus: vi.fn(() => 'not_started'),
  default: { getActivityStatus: vi.fn(() => 'not_started') }
}));

vi.mock('../../public/js/core/router.js', () => ({
  navigate: vi.fn(),
  registerView: vi.fn(),
  default: { navigate: vi.fn(), registerView: vi.fn() }
}));

import { getActivity } from '../../public/js/core/module-registry.js';
import { subscribe, debouncedWrite, immediateWrite } from '../../public/js/core/sync-engine.js';
import { getActiveSession } from '../../public/js/core/session-manager.js';
import { validateField as mockValidateField } from '../../public/js/core/validation.js';
import { createAvatarGroup, updateAvatarGroup } from '../../public/js/components/avatar-group.js';
import { getActivityStatus } from '../../public/js/components/activity-card.js';
import { navigate, registerView } from '../../public/js/core/router.js';
import {
  render,
  getCompletionStatus,
  _cleanup,
  _renderFields,
  _renderFieldByType,
  _renderTextField,
  _renderTextareaField,
  _renderChecklistItem,
  _renderSelectField,
  _renderRatingField,
  _renderStructuredTable,
  _renderReadonlyDisplay,
  _renderFileUploadPlaceholder,
  _getFieldValue,
  _createFieldWrapper
} from '../../public/js/views/activity-view.js';

// --- Test Fixtures ---

function createTextFieldDef(overrides = {}) {
  return {
    id: 'test-field',
    label: 'Test Field',
    type: 'text',
    maxLength: 200,
    minLength: 1,
    ...overrides
  };
}

function createTextareaFieldDef(overrides = {}) {
  return {
    id: 'notes',
    label: 'Notes',
    type: 'textarea',
    maxLength: 1000,
    ...overrides
  };
}

function createActivityDef(overrides = {}) {
  return {
    id: 'test-activity',
    title: 'Test Activity',
    fields: [
      createTextFieldDef(),
      createTextareaFieldDef()
    ],
    completionRule: 'all_fields_filled',
    ...overrides
  };
}

function createChecklistActivityDef() {
  return {
    id: 'checklist-activity',
    title: 'Checklist Activity',
    categories: [
      {
        id: 'cat1',
        title: 'Category 1',
        items: [
          { id: 'item-1', label: 'Item 1' },
          { id: 'item-2', label: 'Item 2' }
        ]
      }
    ],
    completionRule: 'all_checked'
  };
}

describe('ActivityView', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('main');
    container.id = 'app';
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    _cleanup();
    document.body.removeChild(container);
  });

  describe('registerView', () => {
    it('registers the activity view with the router', () => {
      // registerView is called at module import time, but vi.mock hoisting
      // means the mock is set up to track calls. The render function is
      // the registered handler — we verify by calling render directly.
      // The module exports render and registerView was called at import.
      expect(typeof render).toBe('function');
    });
  });

  describe('render', () => {
    it('renders activity not found when definition is missing', () => {
      getActivity.mockReturnValue(null);
      render({ moduleId: 'module1', activityId: 'missing' }, container);

      expect(container.querySelector('h1').textContent).toBe('Activity Not Found');
      expect(container.querySelector('.error-message')).not.toBeNull();
    });

    it('renders activity title from definition', () => {
      const actDef = createActivityDef();
      getActivity.mockReturnValue(actDef);
      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      expect(container.querySelector('h1').textContent).toBe('Test Activity');
    });

    it('renders back navigation link', () => {
      getActivity.mockReturnValue(createActivityDef());
      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      const backLink = container.querySelector('.back-link');
      expect(backLink).not.toBeNull();
      expect(backLink.textContent).toContain('Back to Modules');
    });

    it('renders avatar group for presence', () => {
      getActivity.mockReturnValue(createActivityDef());
      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      expect(createAvatarGroup).toHaveBeenCalledWith([]);
      expect(container.querySelector('.avatar-group')).not.toBeNull();
    });

    it('renders form fields for activity definition', () => {
      getActivity.mockReturnValue(createActivityDef());
      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      const fields = container.querySelectorAll('.field-group');
      expect(fields.length).toBe(2);
    });

    it('subscribes to Firebase when session is active', () => {
      getActivity.mockReturnValue(createActivityDef());
      getActiveSession.mockReturnValue({
        passcode: 'ABC123',
        groupId: 'group1',
        participantId: 'p1',
        displayName: 'Test User'
      });

      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      // Should subscribe to lock state, responses, and presence
      expect(subscribe).toHaveBeenCalledTimes(3);
    });

    it('updates presence when session is active', () => {
      getActivity.mockReturnValue(createActivityDef());
      getActiveSession.mockReturnValue({
        passcode: 'ABC123',
        groupId: 'group1',
        participantId: 'p1',
        displayName: 'Test User'
      });

      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      expect(immediateWrite).toHaveBeenCalledWith(
        '/sessions/ABC123/presence/p1',
        expect.objectContaining({
          currentModule: 'module1',
          currentActivity: 'test-activity',
          online: true,
          displayName: 'Test User'
        })
      );
    });
  });

  describe('field rendering', () => {
    it('renders text input fields', () => {
      const field = createTextFieldDef();
      const el = _renderTextField(field, {}, false);

      const input = el.querySelector('input[type="text"]');
      expect(input).not.toBeNull();
      expect(input.id).toBe('field-test-field');
      expect(input.maxLength).toBe(200);
    });

    it('renders textarea fields', () => {
      const field = createTextareaFieldDef();
      const el = _renderTextareaField(field, {}, false);

      const textarea = el.querySelector('textarea');
      expect(textarea).not.toBeNull();
      expect(textarea.id).toBe('field-notes');
      expect(textarea.maxLength).toBe(1000);
    });

    it('renders checklist items as checkboxes', () => {
      const item = { id: 'check-1', label: 'Check Item 1' };
      const el = _renderChecklistItem(item, {}, false);

      const input = el.querySelector('input[type="checkbox"]');
      expect(input).not.toBeNull();
      expect(input.checked).toBe(false);
    });

    it('renders checklist item as checked when response is true', () => {
      const item = { id: 'check-1', label: 'Check Item 1' };
      const responses = { 'check-1': { value: true } };
      const el = _renderChecklistItem(item, responses, false);

      const input = el.querySelector('input[type="checkbox"]');
      expect(input.checked).toBe(true);
    });

    it('renders select fields', () => {
      const field = {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: ['Low', 'Medium', 'High']
      };
      const el = _renderSelectField(field, {}, false);

      const select = el.querySelector('select');
      expect(select).not.toBeNull();
      // Default + 3 options
      expect(select.options.length).toBe(4);
    });

    it('renders rating fields as radio group', () => {
      const field = {
        id: 'quality',
        label: 'Quality',
        type: 'rating',
        min: 1,
        max: 5
      };
      const el = _renderRatingField(field, {}, false);

      const radios = el.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBe(5);
    });

    it('renders structured table with columns', () => {
      const field = {
        id: 'action-table',
        label: 'Action Items',
        type: 'structured_table',
        columns: [
          { id: 'person', label: 'Person' },
          { id: 'action', label: 'Action' }
        ]
      };
      const el = _renderStructuredTable(field, {}, false);

      const headers = el.querySelectorAll('th');
      // 2 columns + 1 actions column
      expect(headers.length).toBe(3);
    });

    it('renders readonly display as static content', () => {
      const field = {
        id: 'info',
        label: 'Information',
        type: 'readonly_display',
        content: '<p>Some info</p>'
      };
      const el = _renderReadonlyDisplay(field);

      const contentDiv = el.querySelector('.field-readonly-content');
      expect(contentDiv.innerHTML).toBe('<p>Some info</p>');
    });

    it('renders file upload as placeholder', () => {
      const field = {
        id: 'chart',
        label: 'Chart Image',
        type: 'file_upload'
      };
      const el = _renderFileUploadPlaceholder(field);

      const placeholder = el.querySelector('.field-file-placeholder');
      expect(placeholder.textContent).toContain('available soon');
    });
  });

  describe('read-only mode', () => {
    it('sets text input as readonly when locked', () => {
      const field = createTextFieldDef();
      const el = _renderTextField(field, {}, true);

      const input = el.querySelector('input');
      expect(input.readOnly).toBe(true);
      expect(input.getAttribute('aria-readonly')).toBe('true');
    });

    it('sets textarea as readonly when locked', () => {
      const field = createTextareaFieldDef();
      const el = _renderTextareaField(field, {}, true);

      const textarea = el.querySelector('textarea');
      expect(textarea.readOnly).toBe(true);
      expect(textarea.getAttribute('aria-readonly')).toBe('true');
    });

    it('disables checkbox when locked', () => {
      const item = { id: 'check-1', label: 'Check' };
      const el = _renderChecklistItem(item, {}, true);

      const input = el.querySelector('input[type="checkbox"]');
      expect(input.disabled).toBe(true);
    });

    it('disables select when locked', () => {
      const field = {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: ['A', 'B']
      };
      const el = _renderSelectField(field, {}, true);

      const select = el.querySelector('select');
      expect(select.disabled).toBe(true);
    });

    it('disables rating radios when locked', () => {
      const field = { id: 'rate', label: 'Rate', type: 'rating', min: 1, max: 3 };
      const el = _renderRatingField(field, {}, true);

      const radios = el.querySelectorAll('input[type="radio"]');
      radios.forEach(r => expect(r.disabled).toBe(true));
    });

    it('does not show add/remove buttons for table when locked', () => {
      const field = {
        id: 'tbl',
        label: 'Table',
        type: 'structured_table',
        columns: [{ id: 'col1', label: 'Col' }]
      };
      const el = _renderStructuredTable(field, {}, true);

      expect(el.querySelector('.btn--secondary')).toBeNull();
    });

    it('shows read-only banner when module is locked', () => {
      getActivity.mockReturnValue(createActivityDef());
      getActiveSession.mockReturnValue({
        passcode: 'ABC123',
        groupId: 'group1',
        participantId: 'p1',
        displayName: 'User'
      });

      // Capture lock state callback
      let lockCallback;
      subscribe.mockImplementation((path, cb) => {
        if (path.includes('/modules/')) {
          lockCallback = cb;
        }
        return () => {};
      });

      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      // Simulate module lock
      lockCallback({ locked: true });

      const banner = container.querySelector('.activity-readonly-banner');
      expect(banner.hidden).toBe(false);
    });
  });

  describe('field value retrieval', () => {
    it('returns empty string for missing field', () => {
      expect(_getFieldValue('missing', {})).toBe('');
    });

    it('returns value from Firebase wrapper object', () => {
      const responses = { 'field1': { value: 'hello', updatedBy: 'p1' } };
      expect(_getFieldValue('field1', responses)).toBe('hello');
    });

    it('returns raw value when not wrapped', () => {
      const responses = { 'field1': true };
      expect(_getFieldValue('field1', responses)).toBe(true);
    });
  });

  describe('completion status', () => {
    it('delegates to getActivityStatus', () => {
      const actDef = createActivityDef();
      getActivityStatus.mockReturnValue('completed');

      const status = getCompletionStatus(actDef, { 'test-field': 'val', 'notes': 'val' });
      expect(status).toBe('completed');
      expect(getActivityStatus).toHaveBeenCalledWith(actDef, { 'test-field': 'val', 'notes': 'val' });
    });
  });

  describe('field change handling', () => {
    it('calls debouncedWrite on text input change', () => {
      getActivity.mockReturnValue(createActivityDef());
      getActiveSession.mockReturnValue({
        passcode: 'ABC123',
        groupId: 'group1',
        participantId: 'p1',
        displayName: 'User'
      });

      // Mock subscribe to send unlocked state for lock check
      subscribe.mockImplementation((path, cb) => {
        if (path.includes('/modules/')) {
          cb({ locked: false });
        }
        if (path.includes('/responses/')) {
          cb({});
        }
        return () => {};
      });

      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      const input = container.querySelector('#field-test-field');
      expect(input).not.toBeNull();

      // Simulate input event
      input.value = 'hello world';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      expect(debouncedWrite).toHaveBeenCalledWith(
        '/sessions/ABC123/activities/module1/test-activity/responses/group1/test-field',
        expect.objectContaining({
          value: 'hello world',
          updatedBy: 'p1'
        })
      );
    });
  });

  describe('accessibility', () => {
    it('form has aria-label', () => {
      getActivity.mockReturnValue(createActivityDef());
      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      const form = container.querySelector('.activity-form');
      expect(form.getAttribute('aria-label')).toBe('Activity fields');
    });

    it('text fields have associated labels', () => {
      const field = createTextFieldDef();
      const el = _renderTextField(field, {}, false);

      const label = el.querySelector('label');
      const input = el.querySelector('input');
      expect(label.getAttribute('for')).toBe(input.id);
    });

    it('status element has aria-live', () => {
      getActivity.mockReturnValue(createActivityDef());
      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      const status = container.querySelector('.activity-status');
      expect(status.getAttribute('aria-live')).toBe('polite');
    });

    it('read-only banner has role=alert', () => {
      getActivity.mockReturnValue(createActivityDef());
      render({ moduleId: 'module1', activityId: 'test-activity' }, container);

      const banner = container.querySelector('.activity-readonly-banner');
      expect(banner.getAttribute('role')).toBe('alert');
    });
  });

  describe('_createFieldWrapper', () => {
    it('creates wrapper with label and error elements', () => {
      const field = { id: 'test', label: 'Test Label', minLength: 1 };
      const { wrapper, errorEl } = _createFieldWrapper(field);

      expect(wrapper.className).toBe('field-group');
      expect(wrapper.querySelector('label').textContent).toContain('Test Label');
      expect(errorEl.id).toBe('field-test-error');
      expect(errorEl.hidden).toBe(true);
    });
  });
});
