/**
 * Unit tests for Module 8: Visualisation and Presentation
 * Validates the module configuration meets requirements 12.1–12.5
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getModule,
  getActivity
} from '../../public/js/core/module-registry.js';

// Import module8 to trigger self-registration
import '../../public/js/modules/module8.js';

describe('Module 8 - Visualisation and Presentation', () => {
  it('registers itself in the ModuleRegistry', () => {
    const module = getModule('module8');
    expect(module).not.toBeNull();
    expect(module.id).toBe('module8');
    expect(module.title).toBe('Visualisation and Presentation');
  });

  it('has exactly two activities (Req 12.1)', () => {
    const module = getModule('module8');
    expect(module.activities).toHaveLength(2);
    expect(module.activities[0].id).toBe('image-generation-lab');
    expect(module.activities[0].title).toBe('Image Generation Lab');
    expect(module.activities[1].id).toBe('presentation-sprint');
    expect(module.activities[1].title).toBe('Presentation Sprint');
  });
});

describe('Module 8 - Image Generation Lab (Req 12.2, 12.4)', () => {
  let activity;

  beforeEach(() => {
    activity = getActivity('module8', 'image-generation-lab');
  });

  it('is a form activity with 4 required fields', () => {
    expect(activity.type).toBe('form');
    expect(activity.fields).toHaveLength(4);
    activity.fields.forEach(field => {
      expect(field.required).toBe(true);
    });
  });

  it('has scenario field with max 500 characters', () => {
    const field = activity.fields.find(f => f.id === 'scenario');
    expect(field).toBeDefined();
    expect(field.type).toBe('textarea');
    expect(field.maxLength).toBe(500);
    expect(field.minLength).toBe(1);
    expect(field.required).toBe(true);
  });

  it('has prompt field with max 1000 characters', () => {
    const field = activity.fields.find(f => f.id === 'prompt');
    expect(field).toBeDefined();
    expect(field.type).toBe('textarea');
    expect(field.maxLength).toBe(1000);
    expect(field.minLength).toBe(1);
    expect(field.required).toBe(true);
  });

  it('has criteria field with max 500 characters', () => {
    const field = activity.fields.find(f => f.id === 'criteria');
    expect(field).toBeDefined();
    expect(field.type).toBe('textarea');
    expect(field.maxLength).toBe(500);
    expect(field.minLength).toBe(1);
    expect(field.required).toBe(true);
  });

  it('has notes field with max 1000 characters', () => {
    const field = activity.fields.find(f => f.id === 'notes');
    expect(field).toBeDefined();
    expect(field.type).toBe('textarea');
    expect(field.maxLength).toBe(1000);
    expect(field.minLength).toBe(1);
    expect(field.required).toBe(true);
  });

  it('uses all_fields_filled completion rule', () => {
    expect(activity.completionRule).toBe('all_fields_filled');
  });
});

describe('Module 8 - Presentation Sprint (Req 12.3, 12.4, 12.5)', () => {
  let activity;

  beforeEach(() => {
    activity = getActivity('module8', 'presentation-sprint');
  });

  it('is a form activity', () => {
    expect(activity.type).toBe('form');
  });

  it('has topic field with max 200 characters', () => {
    const field = activity.fields.find(f => f.id === 'topic');
    expect(field).toBeDefined();
    expect(field.type).toBe('text');
    expect(field.maxLength).toBe(200);
    expect(field.minLength).toBe(1);
    expect(field.required).toBe(true);
  });

  it('has slides field as structured_table with 3-10 rows', () => {
    const field = activity.fields.find(f => f.id === 'slides');
    expect(field).toBeDefined();
    expect(field.type).toBe('structured_table');
    expect(field.required).toBe(true);
    expect(field.minRows).toBe(3);
    expect(field.maxRows).toBe(10);
  });

  it('slides have title column with max 100 chars and bullets column with max 300 chars', () => {
    const field = activity.fields.find(f => f.id === 'slides');
    expect(field.columns).toHaveLength(2);

    const titleCol = field.columns.find(c => c.id === 'title');
    expect(titleCol).toBeDefined();
    expect(titleCol.type).toBe('text');
    expect(titleCol.maxLength).toBe(100);
    expect(titleCol.minLength).toBe(1);

    const bulletsCol = field.columns.find(c => c.id === 'bullets');
    expect(bulletsCol).toBeDefined();
    expect(bulletsCol.type).toBe('textarea');
    expect(bulletsCol.maxLength).toBe(300);
    expect(bulletsCol.minLength).toBe(1);
  });

  it('has tools-used field with max 500 characters', () => {
    const field = activity.fields.find(f => f.id === 'tools-used');
    expect(field).toBeDefined();
    expect(field.type).toBe('textarea');
    expect(field.maxLength).toBe(500);
    expect(field.minLength).toBe(1);
    expect(field.required).toBe(true);
  });

  it('has peer-review-feedback field with max 500 characters, visible after submission (Req 12.5)', () => {
    const field = activity.fields.find(f => f.id === 'peer-review-feedback');
    expect(field).toBeDefined();
    expect(field.type).toBe('textarea');
    expect(field.maxLength).toBe(500);
    expect(field.required).toBe(false);
    expect(field.visibleAfterSubmission).toBe(true);
  });

  it('has peer review enabled with correct configuration', () => {
    expect(activity.peerReviewEnabled).toBe(true);
    expect(activity.peerReviewField).toBe('peer-review-feedback');
    expect(activity.peerReviewMaxLength).toBe(500);
  });

  it('uses all_required_fields_filled completion rule', () => {
    expect(activity.completionRule).toBe('all_required_fields_filled');
  });
});
