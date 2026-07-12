/**
 * Unit tests for Module 4: Privacy and Responsible Use
 * Validates the module configuration meets requirements 8.1–8.5
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getModule,
  getActivity,
  clearRegistry
} from '../../public/js/core/module-registry.js';

// Import module4 to trigger self-registration
import '../../public/js/modules/module4.js';

describe('Module 4 - Privacy and Responsible Use', () => {
  it('registers itself in the ModuleRegistry', () => {
    const module = getModule('module4');
    expect(module).not.toBeNull();
    expect(module.id).toBe('module4');
    expect(module.title).toBe('Privacy and Responsible Use');
  });

  it('has exactly two activities (Req 8.1)', () => {
    const module = getModule('module4');
    expect(module.activities).toHaveLength(2);
    expect(module.activities[0].id).toBe('triage-exercise');
    expect(module.activities[0].title).toBe('Triage Exercise');
    expect(module.activities[1].id).toBe('safe-prompt-writing');
    expect(module.activities[1].title).toBe('Safe Prompt Writing');
  });
});

describe('Module 4 - Triage Exercise (Req 8.2, 8.4)', () => {
  let activity;

  beforeEach(() => {
    activity = getActivity('module4', 'triage-exercise');
  });

  it('has at least 5 scenarios', () => {
    expect(activity.scenarios.length).toBeGreaterThanOrEqual(5);
  });

  it('each scenario has a readonly_display, classification select, and justification textarea', () => {
    for (const scenario of activity.scenarios) {
      expect(scenario.fields).toBeDefined();
      expect(scenario.fields.length).toBe(3);

      // readonly_display for scenario text
      const display = scenario.fields.find(f => f.type === 'readonly_display');
      expect(display).toBeDefined();
      expect(display.content).toBeTruthy();

      // classification select
      const classification = scenario.fields.find(f => f.type === 'select');
      expect(classification).toBeDefined();
      expect(classification.required).toBe(true);

      // justification textarea
      const justification = scenario.fields.find(f => f.type === 'textarea');
      expect(justification).toBeDefined();
      expect(justification.minLength).toBe(10);
      expect(justification.maxLength).toBe(500);
      expect(justification.required).toBe(true);
    }
  });

  it('classification select offers three options: safe, redaction, avoid', () => {
    for (const scenario of activity.scenarios) {
      const classification = scenario.fields.find(f => f.type === 'select');
      const values = classification.options.map(o => o.value).filter(v => v !== '');
      expect(values).toContain('safe');
      expect(values).toContain('redaction');
      expect(values).toContain('avoid');
      expect(values).toHaveLength(3);
    }
  });

  it('justification field enforces 10-500 character range (Req 8.4)', () => {
    for (const scenario of activity.scenarios) {
      const justification = scenario.fields.find(f => f.type === 'textarea');
      expect(justification.minLength).toBe(10);
      expect(justification.maxLength).toBe(500);
    }
  });
});

describe('Module 4 - Safe Prompt Writing (Req 8.3, 8.5)', () => {
  let activity;

  beforeEach(() => {
    activity = getActivity('module4', 'safe-prompt-writing');
  });

  it('has at least 3 snippets', () => {
    expect(activity.snippets.length).toBeGreaterThanOrEqual(3);
  });

  it('each snippet has a readonly_display, prompt formulation, and verification plan', () => {
    for (const snippet of activity.snippets) {
      expect(snippet.fields).toBeDefined();
      expect(snippet.fields.length).toBe(3);

      // readonly_display for snippet text
      const display = snippet.fields.find(f => f.type === 'readonly_display');
      expect(display).toBeDefined();
      expect(display.content).toBeTruthy();

      // prompt formulation textarea
      const prompt = snippet.fields.find(f => f.id.endsWith('-prompt'));
      expect(prompt).toBeDefined();
      expect(prompt.type).toBe('textarea');
      expect(prompt.minLength).toBe(10);
      expect(prompt.maxLength).toBe(1000);
      expect(prompt.required).toBe(true);

      // verification plan textarea
      const verification = snippet.fields.find(f => f.id.endsWith('-verification'));
      expect(verification).toBeDefined();
      expect(verification.type).toBe('textarea');
      expect(verification.minLength).toBe(10);
      expect(verification.maxLength).toBe(1000);
      expect(verification.required).toBe(true);
    }
  });

  it('each snippet text is between 20 and 150 words (Req 8.3)', () => {
    for (const snippet of activity.snippets) {
      const display = snippet.fields.find(f => f.type === 'readonly_display');
      const wordCount = display.content.split(/\s+/).filter(w => w.length > 0).length;
      expect(wordCount).toBeGreaterThanOrEqual(20);
      expect(wordCount).toBeLessThanOrEqual(150);
    }
  });

  it('prompt formulation fields accept 10-1000 characters (Req 8.5)', () => {
    for (const snippet of activity.snippets) {
      const prompt = snippet.fields.find(f => f.id.endsWith('-prompt'));
      expect(prompt.minLength).toBe(10);
      expect(prompt.maxLength).toBe(1000);
    }
  });

  it('verification plan fields accept 10-1000 characters (Req 8.5)', () => {
    for (const snippet of activity.snippets) {
      const verification = snippet.fields.find(f => f.id.endsWith('-verification'));
      expect(verification.minLength).toBe(10);
      expect(verification.maxLength).toBe(1000);
    }
  });
});
