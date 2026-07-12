/**
 * Unit tests for ActivityCard component
 *
 * Tests the createActivityCard function and getActivityStatus helper
 * covering status computation, DOM rendering, and keyboard accessibility.
 *
 * Requirements: 19.1, 17.4
 */
import { describe, it, expect, vi } from 'vitest';
import { createActivityCard, getActivityStatus } from '../../public/js/components/activity-card.js';

// --- Test fixtures ---

const textFieldActivity = {
  id: 'test-activity',
  title: 'Test Activity',
  description: 'A test activity description',
  completionRule: 'all_fields_filled',
  fields: [
    { id: 'field1', type: 'textarea', minLength: 1, maxLength: 500 },
    { id: 'field2', type: 'textarea', minLength: 1, maxLength: 500 }
  ]
};

const checklistActivity = {
  id: 'checklist-activity',
  title: 'Checklist Activity',
  completionRule: 'all_checked',
  categories: [
    {
      id: 'cat1',
      title: 'Category 1',
      items: [
        { id: 'item1', label: 'Item 1' },
        { id: 'item2', label: 'Item 2' }
      ]
    },
    {
      id: 'cat2',
      title: 'Category 2',
      items: [
        { id: 'item3', label: 'Item 3' }
      ]
    }
  ]
};

const structuredEntriesActivity = {
  id: 'entries-activity',
  title: 'Entries Activity',
  completionRule: 'min_entries_filled',
  minEntries: 2,
  fields: [
    { id: 'name', type: 'text', minLength: 1, maxLength: 200 },
    { id: 'notes', type: 'textarea', minLength: 1, maxLength: 500 }
  ]
};

const selectExactlyActivity = {
  id: 'select-activity',
  title: 'Select Activity',
  completionRule: 'select_exactly',
  selectCount: 2,
  fields: []
};

// --- getActivityStatus tests ---

describe('getActivityStatus', () => {
  describe('returns "not_started"', () => {
    it('when responses is null', () => {
      expect(getActivityStatus(textFieldActivity, null)).toBe('not_started');
    });

    it('when responses is undefined', () => {
      expect(getActivityStatus(textFieldActivity, undefined)).toBe('not_started');
    });

    it('when responses is an empty object', () => {
      expect(getActivityStatus(textFieldActivity, {})).toBe('not_started');
    });

    it('when all response values are empty strings', () => {
      expect(getActivityStatus(textFieldActivity, { field1: '', field2: '' })).toBe('not_started');
    });

    it('when all response values are whitespace only', () => {
      expect(getActivityStatus(textFieldActivity, { field1: '   ', field2: '\t' })).toBe('not_started');
    });

    it('when activityDef is null', () => {
      expect(getActivityStatus(null, { field1: 'hello' })).toBe('not_started');
    });

    it('for checklist with no items checked', () => {
      expect(getActivityStatus(checklistActivity, { item1: false, item2: false, item3: false })).toBe('not_started');
    });
  });

  describe('returns "in_progress"', () => {
    it('when some fields are filled but not all', () => {
      expect(getActivityStatus(textFieldActivity, { field1: 'hello', field2: '' })).toBe('in_progress');
    });

    it('for checklist with some items checked', () => {
      expect(getActivityStatus(checklistActivity, { item1: true, item2: false, item3: false })).toBe('in_progress');
    });

    it('for structured entries with fewer than minimum entries', () => {
      const responses = {
        entries: [{ name: 'Tool 1', notes: 'Some notes' }]
      };
      expect(getActivityStatus(structuredEntriesActivity, responses)).toBe('in_progress');
    });

    it('for select_exactly with wrong number of selections', () => {
      const responses = { selections: ['scenario1'] };
      expect(getActivityStatus(selectExactlyActivity, responses)).toBe('in_progress');
    });
  });

  describe('returns "completed"', () => {
    it('when all fields are filled', () => {
      expect(getActivityStatus(textFieldActivity, { field1: 'hello', field2: 'world' })).toBe('completed');
    });

    it('for checklist with all items checked', () => {
      expect(getActivityStatus(checklistActivity, { item1: true, item2: true, item3: true })).toBe('completed');
    });

    it('for structured entries meeting minimum count', () => {
      const responses = {
        entries: [
          { name: 'Tool 1', notes: 'Notes 1' },
          { name: 'Tool 2', notes: 'Notes 2' }
        ]
      };
      expect(getActivityStatus(structuredEntriesActivity, responses)).toBe('completed');
    });

    it('for structured entries exceeding minimum count', () => {
      const responses = {
        entries: [
          { name: 'Tool 1', notes: 'Notes 1' },
          { name: 'Tool 2', notes: 'Notes 2' },
          { name: 'Tool 3', notes: 'Notes 3' }
        ]
      };
      expect(getActivityStatus(structuredEntriesActivity, responses)).toBe('completed');
    });

    it('for select_exactly with correct number of selections', () => {
      const responses = { selections: ['scenario1', 'scenario3'] };
      expect(getActivityStatus(selectExactlyActivity, responses)).toBe('completed');
    });
  });
});

// --- createActivityCard tests ---

describe('createActivityCard', () => {
  describe('DOM structure', () => {
    it('creates a div with card classes', () => {
      const card = createActivityCard(textFieldActivity, {});
      expect(card.tagName).toBe('DIV');
      expect(card.classList.contains('card')).toBe(true);
      expect(card.classList.contains('card--interactive')).toBe(true);
    });

    it('applies not-started status class when no responses', () => {
      const card = createActivityCard(textFieldActivity, {});
      expect(card.classList.contains('card--not-started')).toBe(true);
    });

    it('applies in-progress status class with partial responses', () => {
      const card = createActivityCard(textFieldActivity, { field1: 'hello' });
      expect(card.classList.contains('card--in-progress')).toBe(true);
    });

    it('applies completed status class when all filled', () => {
      const card = createActivityCard(textFieldActivity, { field1: 'a', field2: 'b' });
      expect(card.classList.contains('card--completed')).toBe(true);
    });

    it('renders the activity title in a card__title element', () => {
      const card = createActivityCard(textFieldActivity, {});
      const title = card.querySelector('.card__title');
      expect(title).not.toBeNull();
      expect(title.textContent).toBe('Test Activity');
    });

    it('renders a status badge', () => {
      const card = createActivityCard(textFieldActivity, {});
      const badge = card.querySelector('.card__status-badge');
      expect(badge).not.toBeNull();
      expect(badge.textContent).toBe('Not started');
      expect(badge.classList.contains('card__status-badge--not-started')).toBe(true);
    });

    it('renders description when available', () => {
      const card = createActivityCard(textFieldActivity, {});
      const body = card.querySelector('.card__body');
      expect(body).not.toBeNull();
      expect(body.textContent).toContain('A test activity description');
    });

    it('does not render card__body when no description', () => {
      const card = createActivityCard(checklistActivity, {});
      const body = card.querySelector('.card__body');
      expect(body).toBeNull();
    });

    it('sets data-activity-id attribute', () => {
      const card = createActivityCard(textFieldActivity, {});
      expect(card.dataset.activityId).toBe('test-activity');
    });

    it('sets data-status attribute', () => {
      const card = createActivityCard(textFieldActivity, { field1: 'x' });
      expect(card.dataset.status).toBe('in_progress');
    });
  });

  describe('keyboard accessibility (Requirement 17.4)', () => {
    it('has role="button"', () => {
      const card = createActivityCard(textFieldActivity, {});
      expect(card.getAttribute('role')).toBe('button');
    });

    it('has tabindex="0" for keyboard focus', () => {
      const card = createActivityCard(textFieldActivity, {});
      expect(card.getAttribute('tabindex')).toBe('0');
    });

    it('has aria-label with title and status', () => {
      const card = createActivityCard(textFieldActivity, {});
      const ariaLabel = card.getAttribute('aria-label');
      expect(ariaLabel).toContain('Test Activity');
      expect(ariaLabel).toContain('Not started');
    });

    it('triggers onClick when Enter key is pressed', () => {
      const onClick = vi.fn();
      const card = createActivityCard(textFieldActivity, {}, { onClick });

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      card.dispatchEvent(event);

      expect(onClick).toHaveBeenCalledWith(textFieldActivity);
    });

    it('triggers onClick when Space key is pressed', () => {
      const onClick = vi.fn();
      const card = createActivityCard(textFieldActivity, {}, { onClick });

      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      card.dispatchEvent(event);

      expect(onClick).toHaveBeenCalledWith(textFieldActivity);
    });

    it('does not trigger onClick for other keys', () => {
      const onClick = vi.fn();
      const card = createActivityCard(textFieldActivity, {}, { onClick });

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      card.dispatchEvent(event);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('click interaction', () => {
    it('calls onClick with activityDef on click', () => {
      const onClick = vi.fn();
      const card = createActivityCard(textFieldActivity, {}, { onClick });

      card.click();
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(textFieldActivity);
    });

    it('navigates via hash when href is provided', () => {
      const originalHash = window.location.hash;
      const card = createActivityCard(textFieldActivity, {}, { href: '#activity/module1/test-activity' });

      card.click();
      expect(window.location.hash).toBe('#activity/module1/test-activity');

      // Cleanup
      window.location.hash = originalHash || '';
    });
  });

  describe('status badge variants', () => {
    it('shows "In progress" badge for in-progress status', () => {
      const card = createActivityCard(textFieldActivity, { field1: 'partial' });
      const badge = card.querySelector('.card__status-badge');
      expect(badge.textContent).toBe('In progress');
      expect(badge.classList.contains('card__status-badge--in-progress')).toBe(true);
    });

    it('shows "Completed" badge for completed status', () => {
      const card = createActivityCard(textFieldActivity, { field1: 'a', field2: 'b' });
      const badge = card.querySelector('.card__status-badge');
      expect(badge.textContent).toBe('Completed');
      expect(badge.classList.contains('card__status-badge--completed')).toBe(true);
    });
  });
});
