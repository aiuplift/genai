/**
 * Unit tests for Module 9: Building Without Coding and AI Agents
 *
 * Tests cover:
 *   - Module registration and structure
 *   - Round-robin partner assignment for risk review
 *   - Main Lab prerequisite check for Mini-lab access
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearRegistry, getModule, getActivity, registerModule } from '../../public/js/core/module-registry.js';
import module9, { assignRiskReviewPartner, isMainLabSubmitted } from '../../public/js/modules/module9.js';

describe('Module 9: Building Without Coding and AI Agents', () => {
  beforeEach(() => {
    clearRegistry();
    registerModule(module9);
  });

  describe('Module registration', () => {
    it('registers with correct id and title', () => {
      const mod = getModule('module9');
      expect(mod).not.toBeNull();
      expect(mod.id).toBe('module9');
      expect(mod.title).toBe('Building Without Coding and AI Agents');
    });

    it('has exactly 2 activities', () => {
      const mod = getModule('module9');
      expect(mod.activities).toHaveLength(2);
    });

    it('first activity is Main Lab (Build)', () => {
      const activity = getActivity('module9', 'main-lab-build');
      expect(activity).not.toBeNull();
      expect(activity.title).toBe('Main Lab (Build)');
      expect(activity.type).toBe('form');
    });

    it('second activity is Mini-lab (Risk Review)', () => {
      const activity = getActivity('module9', 'mini-lab-risk-review');
      expect(activity).not.toBeNull();
      expect(activity.title).toBe('Mini-lab (Risk Review)');
      expect(activity.type).toBe('form');
    });
  });

  describe('Main Lab (Build) activity fields', () => {
    it('has all 5 required fields', () => {
      const activity = getActivity('module9', 'main-lab-build');
      expect(activity.fields).toHaveLength(5);

      const fieldIds = activity.fields.map(f => f.id);
      expect(fieldIds).toContain('purpose');
      expect(fieldIds).toContain('platform');
      expect(fieldIds).toContain('design-description');
      expect(fieldIds).toContain('build-status');
      expect(fieldIds).toContain('testing-notes');
    });

    it('purpose field has max 500 characters', () => {
      const activity = getActivity('module9', 'main-lab-build');
      const field = activity.fields.find(f => f.id === 'purpose');
      expect(field.maxLength).toBe(500);
      expect(field.type).toBe('textarea');
      expect(field.required).toBe(true);
    });

    it('platform field has max 200 characters', () => {
      const activity = getActivity('module9', 'main-lab-build');
      const field = activity.fields.find(f => f.id === 'platform');
      expect(field.maxLength).toBe(200);
      expect(field.type).toBe('text');
      expect(field.required).toBe(true);
    });

    it('design-description field has max 1000 characters', () => {
      const activity = getActivity('module9', 'main-lab-build');
      const field = activity.fields.find(f => f.id === 'design-description');
      expect(field.maxLength).toBe(1000);
      expect(field.type).toBe('textarea');
    });

    it('build-status is a select with correct options', () => {
      const activity = getActivity('module9', 'main-lab-build');
      const field = activity.fields.find(f => f.id === 'build-status');
      expect(field.type).toBe('select');
      expect(field.required).toBe(true);

      const values = field.options.map(o => o.value).filter(v => v !== '');
      expect(values).toEqual(['Not Started', 'In Progress', 'Completed']);
    });

    it('testing-notes field has max 1000 characters', () => {
      const activity = getActivity('module9', 'main-lab-build');
      const field = activity.fields.find(f => f.id === 'testing-notes');
      expect(field.maxLength).toBe(1000);
      expect(field.type).toBe('textarea');
    });
  });

  describe('Mini-lab (Risk Review) activity fields', () => {
    it('has prerequisite referencing main-lab-build', () => {
      const activity = getActivity('module9', 'mini-lab-risk-review');
      expect(activity.prerequisite).toBe('main-lab-build');
    });

    it('has 8 fields (4 categories × select + notes)', () => {
      const activity = getActivity('module9', 'mini-lab-risk-review');
      expect(activity.fields).toHaveLength(8);
    });

    it('covers all 4 risk categories', () => {
      const activity = getActivity('module9', 'mini-lab-risk-review');
      expect(activity.riskCategories).toEqual([
        'Data Privacy',
        'Failure Modes',
        'Unintended Outputs',
        'Access Control'
      ]);
    });

    it('each category has a risk level select with Low/Medium/High options', () => {
      const activity = getActivity('module9', 'mini-lab-risk-review');
      const levelFields = activity.fields.filter(f => f.id.endsWith('-level'));
      expect(levelFields).toHaveLength(4);

      for (const field of levelFields) {
        expect(field.type).toBe('select');
        expect(field.required).toBe(true);
        const values = field.options.map(o => o.value).filter(v => v !== '');
        expect(values).toEqual(['Low', 'Medium', 'High']);
      }
    });

    it('each category has a notes textarea with max 500 characters', () => {
      const activity = getActivity('module9', 'mini-lab-risk-review');
      const notesFields = activity.fields.filter(f => f.id.endsWith('-notes'));
      expect(notesFields).toHaveLength(4);

      for (const field of notesFields) {
        expect(field.type).toBe('textarea');
        expect(field.maxLength).toBe(500);
        expect(field.required).toBe(true);
      }
    });

    it('uses round-robin partner assignment', () => {
      const activity = getActivity('module9', 'mini-lab-risk-review');
      expect(activity.partnerAssignment).toBe('round-robin');
    });
  });

  describe('assignRiskReviewPartner', () => {
    it('assigns next participant in round-robin order', () => {
      const members = ['alice', 'bob', 'charlie'];
      expect(assignRiskReviewPartner(members, 'alice')).toBe('bob');
      expect(assignRiskReviewPartner(members, 'bob')).toBe('charlie');
    });

    it('wraps around from last to first', () => {
      const members = ['alice', 'bob', 'charlie'];
      expect(assignRiskReviewPartner(members, 'charlie')).toBe('alice');
    });

    it('works with 2 members (each reviews the other)', () => {
      const members = ['alice', 'bob'];
      expect(assignRiskReviewPartner(members, 'alice')).toBe('bob');
      expect(assignRiskReviewPartner(members, 'bob')).toBe('alice');
    });

    it('returns null for a single member', () => {
      expect(assignRiskReviewPartner(['alice'], 'alice')).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(assignRiskReviewPartner([], 'alice')).toBeNull();
    });

    it('returns null if participant is not in the group', () => {
      const members = ['alice', 'bob', 'charlie'];
      expect(assignRiskReviewPartner(members, 'dave')).toBeNull();
    });

    it('returns null for non-array input', () => {
      expect(assignRiskReviewPartner(null, 'alice')).toBeNull();
      expect(assignRiskReviewPartner(undefined, 'alice')).toBeNull();
    });
  });

  describe('isMainLabSubmitted', () => {
    it('returns true when all required fields are filled', () => {
      const responses = {
        'purpose': { value: 'Build a chatbot' },
        'platform': { value: 'Zapier' },
        'design-description': { value: 'A simple FAQ bot' },
        'build-status': { value: 'Completed' },
        'testing-notes': { value: 'Tested with 5 questions' }
      };
      expect(isMainLabSubmitted(responses)).toBe(true);
    });

    it('returns false when a field is missing', () => {
      const responses = {
        'purpose': { value: 'Build a chatbot' },
        'platform': { value: 'Zapier' },
        'design-description': { value: 'A simple FAQ bot' },
        'build-status': { value: 'Completed' }
        // testing-notes missing
      };
      expect(isMainLabSubmitted(responses)).toBe(false);
    });

    it('returns false when a field has empty string value', () => {
      const responses = {
        'purpose': { value: 'Build a chatbot' },
        'platform': { value: '' },
        'design-description': { value: 'A simple FAQ bot' },
        'build-status': { value: 'Completed' },
        'testing-notes': { value: 'Tested' }
      };
      expect(isMainLabSubmitted(responses)).toBe(false);
    });

    it('returns false when a field has whitespace-only value', () => {
      const responses = {
        'purpose': { value: '   ' },
        'platform': { value: 'Zapier' },
        'design-description': { value: 'A simple FAQ bot' },
        'build-status': { value: 'Completed' },
        'testing-notes': { value: 'Tested' }
      };
      expect(isMainLabSubmitted(responses)).toBe(false);
    });

    it('returns false for null responses', () => {
      expect(isMainLabSubmitted(null)).toBe(false);
    });

    it('returns false for undefined responses', () => {
      expect(isMainLabSubmitted(undefined)).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(isMainLabSubmitted({})).toBe(false);
    });

    it('handles string values (not wrapped in object)', () => {
      const responses = {
        'purpose': 'Build a chatbot',
        'platform': 'Zapier',
        'design-description': 'A simple FAQ bot',
        'build-status': 'Completed',
        'testing-notes': 'Tested with 5 questions'
      };
      expect(isMainLabSubmitted(responses)).toBe(true);
    });
  });
});
