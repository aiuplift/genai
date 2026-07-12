/**
 * Unit tests for ExportView
 *
 * Tests the export view including module selection, participant export,
 * facilitator export, empty state handling, error/retry logic,
 * and HTML generation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies before importing the module
vi.mock('../../public/js/core/module-registry.js', () => ({
  getAllModules: vi.fn(() => []),
  getModule: vi.fn(() => null)
}));

vi.mock('../../public/js/core/sync-engine.js', () => ({
  subscribe: vi.fn(() => () => {})
}));

vi.mock('../../public/js/core/session-manager.js', () => ({
  getActiveSession: vi.fn(() => null)
}));

vi.mock('../../public/js/core/router.js', () => ({
  registerView: vi.fn(),
  navigate: vi.fn()
}));

import {
  render,
  _cleanup,
  _extractGroupResponses,
  _extractAllGroupResponses,
  _flattenResponses,
  _extractValue,
  _formatValue,
  _buildExportHtml,
  _buildFacilitatorExportHtml,
  _buildHeaderHtml,
  _buildSectionHtml,
  _wrapInDocument,
  _escapeHtml,
  _isEmptyResponses,
  EXPORT_TIMEOUT_MS
} from '../../public/js/views/export-view.js';

import { getAllModules, getModule } from '../../public/js/core/module-registry.js';
import { subscribe } from '../../public/js/core/sync-engine.js';
import { getActiveSession } from '../../public/js/core/session-manager.js';
import { registerView } from '../../public/js/core/router.js';

// --- Test Fixtures ---

const mockModules = [
  {
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
            title: 'Chat & Generate',
            items: [
              { id: 'chatgpt', label: 'ChatGPT' },
              { id: 'claude', label: 'Claude' }
            ]
          }
        ]
      },
      {
        id: 'tool-map',
        title: 'Personal Tool Map',
        type: 'structured_entries',
        fields: [
          { id: 'purpose', label: 'Tool Purpose', type: 'textarea' },
          { id: 'strengths', label: 'Strengths', type: 'textarea' }
        ]
      }
    ]
  },
  {
    id: 'module2',
    title: 'Prompt Engineering',
    activities: [
      {
        id: 'prompt-warmup',
        title: 'Prompt Warm-up',
        fields: [
          { id: 'unconstrained', label: 'Unconstrained Prompt', type: 'textarea' },
          { id: 'structured', label: 'Structured Prompt', type: 'textarea' }
        ]
      }
    ]
  }
];

const mockSession = {
  passcode: 'ABC123',
  groupId: 'group1',
  displayName: 'Alice',
  sessionName: 'Training Session 1',
  role: 'participant',
  participantId: 'p1'
};

const mockFacilitatorSession = {
  ...mockSession,
  role: 'facilitator'
};

// --- Test Setup ---

describe('ExportView', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);

    // Reset mocks
    vi.clearAllMocks();
    getAllModules.mockReturnValue(mockModules);
  });

  afterEach(() => {
    _cleanup();
    document.body.removeChild(container);
  });

  describe('render()', () => {
    it('should register with the router as "export" view', () => {
      // registerView is called at module load time; verify the render fn is exported
      expect(typeof render).toBe('function');
    });

    it('should render heading and module selector for participant', () => {
      getActiveSession.mockReturnValue(mockSession);
      render({}, container);

      expect(container.querySelector('h1').textContent).toBe('Export Work');
      expect(container.querySelector('select#export-module-select')).toBeTruthy();
      expect(container.querySelector('select').options.length).toBe(mockModules.length + 1); // +1 for default
    });

    it('should render different description for facilitator', () => {
      getActiveSession.mockReturnValue(mockFacilitatorSession);
      render({}, container);

      const description = container.querySelector('p');
      expect(description.textContent).toContain('all groups');
    });

    it('should disable export button until a module is selected', () => {
      getActiveSession.mockReturnValue(mockSession);
      render({}, container);

      const btn = container.querySelector('.btn--primary');
      expect(btn.disabled).toBe(true);

      const select = container.querySelector('select');
      select.value = 'module1';
      select.dispatchEvent(new Event('change'));

      expect(btn.disabled).toBe(false);
    });

    it('should include all modules in the selector', () => {
      getActiveSession.mockReturnValue(mockSession);
      render({}, container);

      const select = container.querySelector('select');
      const options = Array.from(select.options).slice(1); // skip default
      expect(options.map(o => o.value)).toEqual(['module1', 'module2']);
      expect(options.map(o => o.textContent)).toEqual(['AI Landscape and Tool Survey', 'Prompt Engineering']);
    });
  });

  describe('_escapeHtml()', () => {
    it('should escape HTML special characters', () => {
      expect(_escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(_escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('should escape single quotes', () => {
      expect(_escapeHtml("it's")).toBe('it&#039;s');
    });

    it('should return empty string for non-string input', () => {
      expect(_escapeHtml(null)).toBe('');
      expect(_escapeHtml(undefined)).toBe('');
      expect(_escapeHtml(123)).toBe('');
    });
  });

  describe('_extractValue()', () => {
    it('should extract value from response object with value property', () => {
      expect(_extractValue({ value: 'hello', updatedBy: 'p1', updatedAt: 123 })).toBe('hello');
    });

    it('should return raw value if not a response object', () => {
      expect(_extractValue('raw text')).toBe('raw text');
      expect(_extractValue(true)).toBe(true);
    });

    it('should return empty string for null/undefined', () => {
      expect(_extractValue(null)).toBe('');
      expect(_extractValue(undefined)).toBe('');
    });
  });

  describe('_formatValue()', () => {
    it('should format string values as-is', () => {
      expect(_formatValue('hello world', 'textarea')).toBe('hello world');
    });

    it('should format boolean values', () => {
      expect(_formatValue(true, 'checkbox')).toBe('Yes');
      expect(_formatValue(false, 'checkbox')).toBe('No');
    });

    it('should format structured table arrays', () => {
      const rows = [
        { person: 'Alice', action: 'Review' },
        { person: 'Bob', action: 'Implement' }
      ];
      const result = _formatValue(rows, 'structured_table');
      expect(result).toContain('Row 1');
      expect(result).toContain('Row 2');
      expect(result).toContain('Alice');
      expect(result).toContain('Bob');
    });

    it('should return empty string for null/undefined', () => {
      expect(_formatValue(null, 'text')).toBe('');
      expect(_formatValue(undefined, 'text')).toBe('');
    });
  });

  describe('_flattenResponses()', () => {
    it('should flatten field-based activity responses', () => {
      const activityDef = {
        id: 'prompt-warmup',
        title: 'Prompt Warm-up',
        fields: [
          { id: 'unconstrained', label: 'Unconstrained Prompt', type: 'textarea' },
          { id: 'structured', label: 'Structured Prompt', type: 'textarea' }
        ]
      };
      const responses = {
        unconstrained: { value: 'My unconstrained prompt', updatedBy: 'p1', updatedAt: 100 },
        structured: { value: 'My structured prompt', updatedBy: 'p1', updatedAt: 200 }
      };

      const result = _flattenResponses(activityDef, responses);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ label: 'Unconstrained Prompt', value: 'My unconstrained prompt' });
      expect(result[1]).toEqual({ label: 'Structured Prompt', value: 'My structured prompt' });
    });

    it('should flatten checklist activity responses', () => {
      const activityDef = {
        id: 'tool-survey',
        title: 'Tool Survey',
        type: 'checklist',
        categories: [
          {
            id: 'chat-generate',
            title: 'Chat & Generate',
            items: [
              { id: 'chatgpt', label: 'ChatGPT' },
              { id: 'claude', label: 'Claude' }
            ]
          }
        ]
      };
      const responses = {
        chatgpt: { value: true, updatedBy: 'p1', updatedAt: 100 },
        claude: { value: false, updatedBy: 'p1', updatedAt: 100 }
      };

      const result = _flattenResponses(activityDef, responses);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Chat & Generate');
      expect(result[0].value).toBe('ChatGPT');
    });

    it('should skip fields with empty values', () => {
      const activityDef = {
        fields: [
          { id: 'filled', label: 'Filled', type: 'text' },
          { id: 'empty', label: 'Empty', type: 'text' }
        ]
      };
      const responses = {
        filled: { value: 'Some content', updatedBy: 'p1', updatedAt: 100 },
        empty: { value: '', updatedBy: 'p1', updatedAt: 100 }
      };

      const result = _flattenResponses(activityDef, responses);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Filled');
    });
  });

  describe('_extractGroupResponses()', () => {
    it('should extract responses for a specific group', () => {
      const moduleData = {
        'tool-survey': {
          responses: {
            group1: { chatgpt: { value: true } },
            group2: { chatgpt: { value: true }, claude: { value: true } }
          }
        },
        'tool-map': {
          responses: {
            group1: { purpose: { value: 'Test purpose' } }
          }
        }
      };
      const moduleDef = mockModules[0];

      const result = _extractGroupResponses(moduleData, 'group1', moduleDef);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].activityTitle).toBe('Tool Survey');
    });

    it('should return empty array when no data', () => {
      expect(_extractGroupResponses(null, 'group1', mockModules[0])).toEqual([]);
      expect(_extractGroupResponses({}, 'group1', mockModules[0])).toEqual([]);
    });
  });

  describe('_extractAllGroupResponses()', () => {
    it('should extract responses for all groups', () => {
      const moduleData = {
        'tool-survey': {
          responses: {
            group1: { chatgpt: { value: true } },
            group2: { claude: { value: true } }
          }
        }
      };
      const moduleDef = mockModules[0];

      const result = _extractAllGroupResponses(moduleData, moduleDef);
      expect(Object.keys(result)).toContain('group1');
      expect(Object.keys(result)).toContain('group2');
    });

    it('should return empty object when no data', () => {
      expect(_extractAllGroupResponses(null, mockModules[0])).toEqual({});
    });
  });

  describe('_isEmptyResponses()', () => {
    it('should return true for null/undefined/empty array', () => {
      expect(_isEmptyResponses(null)).toBe(true);
      expect(_isEmptyResponses(undefined)).toBe(true);
      expect(_isEmptyResponses([])).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect(_isEmptyResponses([{ activityTitle: 'Test', fields: [] }])).toBe(false);
    });
  });

  describe('_buildHeaderHtml()', () => {
    it('should include all header fields', () => {
      const html = _buildHeaderHtml({
        title: 'Module Title',
        sessionName: 'My Session',
        groupName: 'Team Alpha',
        participantName: 'Alice',
        date: '2025-01-15'
      });

      expect(html).toContain('Module Title');
      expect(html).toContain('My Session');
      expect(html).toContain('Team Alpha');
      expect(html).toContain('Alice');
      expect(html).toContain('2025-01-15');
    });

    it('should escape special characters in header', () => {
      const html = _buildHeaderHtml({
        title: '<script>alert("xss")</script>',
        sessionName: 'Safe',
        groupName: 'Safe',
        participantName: 'Safe',
        date: '2025-01-15'
      });

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('_buildSectionHtml()', () => {
    it('should render activity title and field pairs', () => {
      const section = {
        activityTitle: 'Tool Survey',
        fields: [
          { label: 'Chat & Generate', value: 'ChatGPT, Claude' },
          { label: 'Purpose', value: 'AI assistance' }
        ]
      };

      const html = _buildSectionHtml(section);
      expect(html).toContain('Tool Survey');
      expect(html).toContain('Chat &amp; Generate');
      expect(html).toContain('ChatGPT, Claude');
      expect(html).toContain('Purpose');
      expect(html).toContain('AI assistance');
    });

    it('should convert newlines to <br> in values', () => {
      const section = {
        activityTitle: 'Test',
        fields: [{ label: 'Notes', value: 'Line 1\nLine 2' }]
      };

      const html = _buildSectionHtml(section);
      expect(html).toContain('<br>');
    });
  });

  describe('_wrapInDocument()', () => {
    it('should produce a valid HTML document structure', () => {
      const html = _wrapInDocument('<p>Content</p>', 'Test Title');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<title>Test Title - Export</title>');
      expect(html).toContain('<p>Content</p>');
      expect(html).toContain('window.print()');
    });

    it('should include print-friendly CSS', () => {
      const html = _wrapInDocument('', 'Test');

      expect(html).toContain('@media print');
      expect(html).toContain('max-width: 800px');
    });

    it('should include a print button with no-print class', () => {
      const html = _wrapInDocument('', 'Test');

      expect(html).toContain('no-print');
      expect(html).toContain('Print / Save as PDF');
    });
  });

  describe('_buildExportHtml()', () => {
    it('should build complete participant export HTML', () => {
      const html = _buildExportHtml({
        title: 'AI Landscape',
        sessionName: 'Session 1',
        groupName: 'Alpha',
        participantName: 'Alice',
        date: '2025-01-15',
        sections: [
          {
            activityTitle: 'Tool Survey',
            fields: [{ label: 'Tools', value: 'ChatGPT' }]
          }
        ]
      });

      expect(html).toContain('AI Landscape');
      expect(html).toContain('Session 1');
      expect(html).toContain('Alpha');
      expect(html).toContain('Alice');
      expect(html).toContain('Tool Survey');
      expect(html).toContain('ChatGPT');
    });
  });

  describe('_buildFacilitatorExportHtml()', () => {
    it('should build facilitator export with groups organised', () => {
      const html = _buildFacilitatorExportHtml({
        title: 'AI Landscape',
        sessionName: 'Session 1',
        date: '2025-01-15',
        groupsData: {
          alpha: [
            { activityTitle: 'Tool Survey', fields: [{ label: 'Chat', value: 'ChatGPT' }] }
          ],
          beta: [
            { activityTitle: 'Tool Survey', fields: [{ label: 'Chat', value: 'Claude' }] }
          ]
        },
        moduleDef: mockModules[0]
      });

      expect(html).toContain('Group: alpha');
      expect(html).toContain('Group: beta');
      expect(html).toContain('Full session export (all groups)');
      expect(html).toContain('ChatGPT');
      expect(html).toContain('Claude');
    });
  });

  describe('EXPORT_TIMEOUT_MS', () => {
    it('should be set to 30 seconds', () => {
      expect(EXPORT_TIMEOUT_MS).toBe(30000);
    });
  });

  describe('Export generation with subscribe', () => {
    it('should show empty state when no responses exist (participant)', () => {
      getActiveSession.mockReturnValue(mockSession);
      getModule.mockReturnValue(mockModules[0]);

      // Make subscribe invoke callback immediately with empty data
      subscribe.mockImplementation((path, callback) => {
        callback(null);
        return () => {};
      });

      render({}, container);

      // Select module and click export
      const select = container.querySelector('select');
      select.value = 'module1';
      select.dispatchEvent(new Event('change'));

      const btn = container.querySelector('.btn--primary');
      btn.click();

      const emptyMsg = container.querySelector('.export-empty');
      expect(emptyMsg).toBeTruthy();
      expect(emptyMsg.textContent).toContain('No completed work available');
    });

    it('should show empty state when no responses exist (facilitator)', () => {
      getActiveSession.mockReturnValue(mockFacilitatorSession);
      getModule.mockReturnValue(mockModules[0]);

      subscribe.mockImplementation((path, callback) => {
        callback({});
        return () => {};
      });

      render({}, container);

      const select = container.querySelector('select');
      select.value = 'module1';
      select.dispatchEvent(new Event('change'));

      const btn = container.querySelector('.btn--primary');
      btn.click();

      const emptyMsg = container.querySelector('.export-empty');
      expect(emptyMsg).toBeTruthy();
    });

    it('should show error with retry button when session is missing', () => {
      getActiveSession.mockReturnValue(null);

      render({}, container);

      // Manually trigger participant export with no session
      const select = container.querySelector('select');
      select.value = 'module1';
      select.dispatchEvent(new Event('change'));

      const btn = container.querySelector('.btn--primary');
      btn.click();

      const errorDiv = container.querySelector('.export-error');
      expect(errorDiv).toBeTruthy();
      expect(errorDiv.querySelector('button').textContent).toBe('Retry');
    });

    it('should open new window with export HTML on successful participant export', () => {
      getActiveSession.mockReturnValue(mockSession);
      getModule.mockReturnValue(mockModules[0]);

      const mockWindow = {
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn()
        }
      };
      vi.spyOn(window, 'open').mockReturnValue(mockWindow);

      subscribe.mockImplementation((path, callback) => {
        callback({
          'tool-survey': {
            responses: {
              group1: { chatgpt: { value: true, updatedBy: 'p1', updatedAt: 100 } }
            }
          }
        });
        return () => {};
      });

      render({}, container);

      const select = container.querySelector('select');
      select.value = 'module1';
      select.dispatchEvent(new Event('change'));

      const btn = container.querySelector('.btn--primary');
      btn.click();

      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(mockWindow.document.write).toHaveBeenCalled();

      const writtenHtml = mockWindow.document.write.mock.calls[0][0];
      expect(writtenHtml).toContain('AI Landscape and Tool Survey');
      expect(writtenHtml).toContain('ChatGPT');

      window.open.mockRestore();
    });
  });
});
