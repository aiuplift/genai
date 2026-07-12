/**
 * Unit tests for Module 10: Capstone
 * Validates the module configuration meets requirements 14.1–14.6
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getModule,
  getActivity,
  clearRegistry
} from '../../public/js/core/module-registry.js';

// Import module10 to trigger self-registration
import module10, { assignPeerReviewGroup } from '../../public/js/modules/module10.js';

describe('Module 10 - Capstone', () => {
  it('registers itself in the ModuleRegistry', () => {
    const module = getModule('module10');
    expect(module).not.toBeNull();
    expect(module.id).toBe('module10');
    expect(module.title).toBe('Capstone');
  });

  it('has exactly three activities (Req 14.1)', () => {
    const module = getModule('module10');
    expect(module.activities).toHaveLength(3);
    expect(module.activities[0].id).toBe('team-capstone');
    expect(module.activities[0].title).toBe('Team Capstone Task');
    expect(module.activities[1].id).toBe('team-peer-review');
    expect(module.activities[1].title).toBe('Team Peer Review');
    expect(module.activities[2].id).toBe('individual-close');
    expect(module.activities[2].title).toBe('Individual Close');
  });
});

describe('Module 10 - Team Capstone Task (Req 14.2)', () => {
  let activity;

  beforeEach(() => {
    activity = getActivity('module10', 'team-capstone');
  });

  it('is a group activity', () => {
    expect(activity.groupActivity).toBe(true);
  });

  it('has exactly 4 sections in fixed order', () => {
    expect(activity.fields).toHaveLength(4);
    expect(activity.fields[0].id).toBe('research-output');
    expect(activity.fields[1].id).toBe('draft-document');
    expect(activity.fields[2].id).toBe('visual-asset');
    expect(activity.fields[3].id).toBe('presentation-summary');
  });

  it('each section is a textarea accepting up to 5000 characters', () => {
    for (const field of activity.fields) {
      expect(field.type).toBe('textarea');
      expect(field.maxLength).toBe(5000);
      expect(field.minLength).toBe(1);
      expect(field.required).toBe(true);
    }
  });

  it('has correct labels for all sections', () => {
    expect(activity.fields[0].label).toBe('Research Output');
    expect(activity.fields[1].label).toBe('Draft Document');
    expect(activity.fields[2].label).toBe('Visual Asset');
    expect(activity.fields[3].label).toBe('Presentation Summary');
  });

  it('uses all_fields_filled completion rule', () => {
    expect(activity.completionRule).toBe('all_fields_filled');
  });
});

describe('Module 10 - Team Peer Review (Req 14.3, 14.4, 14.6)', () => {
  let activity;

  beforeEach(() => {
    activity = getActivity('module10', 'team-peer-review');
  });

  it('is a group activity', () => {
    expect(activity.groupActivity).toBe(true);
  });

  it('has a prerequisite referencing team-capstone (Req 14.4)', () => {
    expect(activity.prerequisite).toBeDefined();
    expect(activity.prerequisite.activityId).toBe('team-capstone');
    expect(activity.prerequisite.message).toBeTruthy();
  });

  it('has 4 rating dimensions plus feedback field (5 total) (Req 14.3)', () => {
    expect(activity.fields).toHaveLength(5);

    const ratingFields = activity.fields.filter(f => f.type === 'rating');
    expect(ratingFields).toHaveLength(4);

    const feedbackField = activity.fields.find(f => f.type === 'textarea');
    expect(feedbackField).toBeDefined();
  });

  it('rating dimensions are accuracy, clarity, visual quality, completeness', () => {
    const ratingFields = activity.fields.filter(f => f.type === 'rating');
    const labels = ratingFields.map(f => f.label);
    expect(labels).toContain('Accuracy');
    expect(labels).toContain('Clarity');
    expect(labels).toContain('Visual Quality');
    expect(labels).toContain('Completeness');
  });

  it('each rating dimension is rated 1-5', () => {
    const ratingFields = activity.fields.filter(f => f.type === 'rating');
    for (const field of ratingFields) {
      expect(field.min).toBe(1);
      expect(field.max).toBe(5);
      expect(field.required).toBe(true);
    }
  });

  it('feedback field accepts up to 2000 characters', () => {
    const feedbackField = activity.fields.find(f => f.id === 'feedback');
    expect(feedbackField.type).toBe('textarea');
    expect(feedbackField.maxLength).toBe(2000);
    expect(feedbackField.required).toBe(true);
  });

  it('has peer review assignment configuration (Req 14.6)', () => {
    expect(activity.peerReviewAssignment).toBeDefined();
    expect(activity.peerReviewAssignment.type).toBe('bijective');
  });
});

describe('Module 10 - Individual Close (Req 14.5)', () => {
  let activity;

  beforeEach(() => {
    activity = getActivity('module10', 'individual-close');
  });

  it('is not a group activity (individual)', () => {
    expect(activity.groupActivity).toBe(false);
  });

  it('has exactly 3 fields', () => {
    expect(activity.fields).toHaveLength(3);
  });

  it('has correctly labelled fields: Tools to Adopt, Use Cases to Explore, Personal Guidelines', () => {
    expect(activity.fields[0].label).toBe('Tools to Adopt');
    expect(activity.fields[1].label).toBe('Use Cases to Explore');
    expect(activity.fields[2].label).toBe('Personal Guidelines');
  });

  it('each field accepts up to 2000 characters with minimum 50 chars', () => {
    for (const field of activity.fields) {
      expect(field.type).toBe('textarea');
      expect(field.maxLength).toBe(2000);
      expect(field.minLength).toBe(50);
      expect(field.required).toBe(true);
    }
  });

  it('uses all_fields_min_length completion rule', () => {
    expect(activity.completionRule).toBe('all_fields_min_length');
  });
});

describe('assignPeerReviewGroup - Bijective Mapping (Req 14.6)', () => {
  it('assigns the next group in circular order', () => {
    const groups = ['group-a', 'group-b', 'group-c', 'group-d'];

    expect(assignPeerReviewGroup('group-a', groups)).toBe('group-b');
    expect(assignPeerReviewGroup('group-b', groups)).toBe('group-c');
    expect(assignPeerReviewGroup('group-c', groups)).toBe('group-d');
    expect(assignPeerReviewGroup('group-d', groups)).toBe('group-a');
  });

  it('wraps around for the last group', () => {
    const groups = ['alpha', 'beta', 'gamma'];
    expect(assignPeerReviewGroup('gamma', groups)).toBe('alpha');
  });

  it('works with exactly 2 groups', () => {
    const groups = ['team1', 'team2'];
    expect(assignPeerReviewGroup('team1', groups)).toBe('team2');
    expect(assignPeerReviewGroup('team2', groups)).toBe('team1');
  });

  it('returns null if fewer than 2 groups', () => {
    expect(assignPeerReviewGroup('only-one', ['only-one'])).toBeNull();
    expect(assignPeerReviewGroup('any', [])).toBeNull();
  });

  it('returns null if allGroupIds is not an array', () => {
    expect(assignPeerReviewGroup('group-a', null)).toBeNull();
    expect(assignPeerReviewGroup('group-a', undefined)).toBeNull();
  });

  it('returns null if groupId is not in the array', () => {
    const groups = ['group-a', 'group-b', 'group-c'];
    expect(assignPeerReviewGroup('unknown', groups)).toBeNull();
  });

  it('produces a bijective mapping (every group reviews and is reviewed exactly once)', () => {
    const groups = ['g1', 'g2', 'g3', 'g4', 'g5'];
    const assignments = groups.map(g => assignPeerReviewGroup(g, groups));

    // Each target is unique (one-to-one)
    const uniqueTargets = new Set(assignments);
    expect(uniqueTargets.size).toBe(groups.length);

    // No group reviews itself
    for (let i = 0; i < groups.length; i++) {
      expect(assignments[i]).not.toBe(groups[i]);
    }

    // Every group is a target (onto)
    for (const group of groups) {
      expect(assignments).toContain(group);
    }
  });
});
