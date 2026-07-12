/**
 * Unit tests for ModuleListView
 *
 * Tests module card rendering, lock state visual distinction,
 * progress bar display, keyboard navigation, and lock state update handling.
 *
 * Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 19.2
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies before importing the module under test
vi.mock('../../public/js/core/module-registry.js', () => ({
  getAllModules: vi.fn(() => []),
  default: { getAllModules: vi.fn(() => []) }
}));

vi.mock('../../public/js/core/sync-engine.js', () => ({
  subscribe: vi.fn(() => () => {}),
  default: { subscribe: vi.fn(() => () => {}) }
}));

vi.mock('../../public/js/core/session-manager.js', () => ({
  getActiveSession: vi.fn(() => null),
  default: { getActiveSession: vi.fn(() => null) }
}));

vi.mock('../../public/js/components/progress-bar.js', () => ({
  createProgressBar: vi.fn((completed, total, options) => {
    const el = document.createElement('div');
    el.className = 'progress-bar-container';
    el.dataset.completed = completed;
    el.dataset.total = total;
    return el;
  }),
  calculateProgress: vi.fn((c, t) => t > 0 ? Math.round((c / t) * 100) : 0)
}));

vi.mock('../../public/js/core/router.js', () => ({
  navigate: vi.fn(),
  registerView: vi.fn(),
  default: { navigate: vi.fn(), registerView: vi.fn() }
}));

import { getAllModules } from '../../public/js/core/module-registry.js';
import { subscribe } from '../../public/js/core/sync-engine.js';
import { getActiveSession } from '../../public/js/core/session-manager.js';
import { createProgressBar } from '../../public/js/components/progress-bar.js';
import { navigate, registerView } from '../../public/js/core/router.js';
import {
  render,
  _cleanup,
  _createModuleCard,
  _countCompletedActivities,
  _navigateToModule,
  _populateCard
} from '../../public/js/views/module-list-view.js';

// --- Test fixtures ---

function createMockModules(count = 10) {
  const modules = [];
  for (let i = 1; i <= count; i++) {
    modules.push({
      id: `module${i}`,
      title: `Module ${i}: Test Module`,
      activities: [
        { id: `activity-${i}-1`, title: `Activity ${i}.1` },
        { id: `activity-${i}-2`, title: `Activity ${i}.2` }
      ]
    });
  }
  return modules;
}

describe('ModuleListView', () => {
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

  describe('render', () => {
    it('renders all 10 module cards', () => {
      const modules = createMockModules(10);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const cards = container.querySelectorAll('[data-module-id]');
      expect(cards.length).toBe(10);
    });

    it('renders cards within a card-grid container', () => {
      getAllModules.mockReturnValue(createMockModules(3));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const grid = container.querySelector('.card-grid');
      expect(grid).not.toBeNull();
      expect(grid.getAttribute('role')).toBe('list');
    });

    it('renders section with heading', () => {
      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const heading = container.querySelector('h1');
      expect(heading.textContent).toBe('Modules');
      const section = container.querySelector('section');
      expect(section.getAttribute('aria-label')).toBe('Module List');
    });

    it('defaults all modules to locked state', () => {
      const modules = createMockModules(3);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue(null);

      render({}, container);

      const cards = container.querySelectorAll('[data-module-id]');
      cards.forEach((card) => {
        expect(card.classList.contains('card--locked')).toBe(true);
        expect(card.getAttribute('aria-disabled')).toBe('true');
      });
    });

    it('subscribes to Firebase lock states when session is active', () => {
      const modules = createMockModules(3);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue({ passcode: 'ABC123', groupId: 'group1' });

      render({}, container);

      // Should subscribe to lock states + progress for each module (3 + 3 = 6 subscriptions)
      expect(subscribe).toHaveBeenCalledTimes(6);
    });

    it('does not subscribe when no active session', () => {
      getAllModules.mockReturnValue(createMockModules(2));
      getActiveSession.mockReturnValue(null);

      render({}, container);

      expect(subscribe).not.toHaveBeenCalled();
    });
  });

  describe('locked module cards', () => {
    it('shows lock indicator icon', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };

      _populateCard(card, moduleDef, true, 0, 2);

      const lockIndicator = card.querySelector('.lock-indicator');
      expect(lockIndicator).not.toBeNull();
      expect(lockIndicator.getAttribute('aria-label')).toBe('Locked');
    });

    it('has aria-disabled="true"', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };

      _populateCard(card, moduleDef, true, 0, 2);

      expect(card.getAttribute('aria-disabled')).toBe('true');
    });

    it('has no tabindex (non-interactive)', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };

      _populateCard(card, moduleDef, true, 0, 2);

      expect(card.hasAttribute('tabindex')).toBe(false);
    });

    it('has no click handler', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [{ id: 'a1', title: 'A1' }] };

      _populateCard(card, moduleDef, true, 0, 1);
      card.click();

      expect(navigate).not.toHaveBeenCalled();
    });

    it('shows locked message in body', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };

      _populateCard(card, moduleDef, true, 0, 2);

      const body = card.querySelector('.card__body');
      expect(body.textContent).toContain('locked');
    });

    it('does not show a progress bar', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };

      _populateCard(card, moduleDef, true, 0, 2);

      expect(createProgressBar).not.toHaveBeenCalled();
    });
  });

  describe('unlocked module cards', () => {
    it('has card--interactive class', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [{ id: 'a1', title: 'A1' }] };

      _populateCard(card, moduleDef, false, 1, 2);

      expect(card.classList.contains('card--interactive')).toBe(true);
      expect(card.classList.contains('card--locked')).toBe(false);
    });

    it('has tabindex="0" for keyboard navigation', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [{ id: 'a1', title: 'A1' }] };

      _populateCard(card, moduleDef, false, 0, 2);

      expect(card.getAttribute('tabindex')).toBe('0');
    });

    it('navigates on click to first activity', () => {
      const card = document.createElement('div');
      const moduleDef = {
        id: 'module1',
        title: 'Test',
        activities: [{ id: 'tool-survey', title: 'Tool Survey' }, { id: 'tool-map', title: 'Tool Map' }]
      };

      _populateCard(card, moduleDef, false, 0, 2);
      card.click();

      expect(navigate).toHaveBeenCalledWith('#activity/module1/tool-survey');
    });

    it('navigates on Enter key', () => {
      const card = document.createElement('div');
      const moduleDef = {
        id: 'module3',
        title: 'Test',
        activities: [{ id: 'capture-pack', title: 'Capture' }]
      };

      _populateCard(card, moduleDef, false, 0, 1);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      event.preventDefault = vi.fn();
      card.onkeydown(event);

      expect(navigate).toHaveBeenCalledWith('#activity/module3/capture-pack');
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('navigates on Space key', () => {
      const card = document.createElement('div');
      const moduleDef = {
        id: 'module2',
        title: 'Test',
        activities: [{ id: 'warm-up', title: 'Warm Up' }]
      };

      _populateCard(card, moduleDef, false, 0, 1);

      const event = new KeyboardEvent('keydown', { key: ' ' });
      event.preventDefault = vi.fn();
      card.onkeydown(event);

      expect(navigate).toHaveBeenCalledWith('#activity/module2/warm-up');
    });

    it('does not navigate on other keys', () => {
      const card = document.createElement('div');
      const moduleDef = {
        id: 'module1',
        title: 'Test',
        activities: [{ id: 'a1', title: 'A1' }]
      };

      _populateCard(card, moduleDef, false, 0, 1);

      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      card.onkeydown(event);

      expect(navigate).not.toHaveBeenCalled();
    });

    it('shows progress bar', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [{ id: 'a1', title: 'A1' }] };

      _populateCard(card, moduleDef, false, 1, 3);

      expect(createProgressBar).toHaveBeenCalledWith(1, 3, { ariaLabel: 'Test progress' });
    });

    it('does not have aria-disabled', () => {
      const card = document.createElement('div');
      card.setAttribute('aria-disabled', 'true'); // simulate previously locked
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };

      _populateCard(card, moduleDef, false, 0, 2);

      expect(card.hasAttribute('aria-disabled')).toBe(false);
    });

    it('does not show lock indicator', () => {
      const card = document.createElement('div');
      const moduleDef = { id: 'module1', title: 'Test', activities: [] };

      _populateCard(card, moduleDef, false, 0, 2);

      expect(card.querySelector('.lock-indicator')).toBeNull();
    });
  });

  describe('lock state updates', () => {
    it('updates card in place when lock state changes from locked to unlocked', () => {
      const modules = createMockModules(2);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue({ passcode: 'TEST01', groupId: 'g1' });

      // Capture subscribe callbacks
      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Initially locked
      const card = container.querySelector('[data-module-id="module1"]');
      expect(card.classList.contains('card--locked')).toBe(true);

      // Simulate unlock event from Firebase
      const lockPath = '/sessions/TEST01/modules/module1';
      subscribeCallbacks[lockPath]({ locked: false, unlockedAt: Date.now() });

      // Card should now be unlocked
      expect(card.classList.contains('card--locked')).toBe(false);
      expect(card.classList.contains('card--interactive')).toBe(true);
    });

    it('updates card in place when lock state changes from unlocked to locked', () => {
      const modules = createMockModules(1);
      getAllModules.mockReturnValue(modules);
      getActiveSession.mockReturnValue({ passcode: 'LOCK01', groupId: 'g1' });

      const subscribeCallbacks = {};
      subscribe.mockImplementation((path, callback) => {
        subscribeCallbacks[path] = callback;
        return () => {};
      });

      render({}, container);

      // Unlock first
      subscribeCallbacks['/sessions/LOCK01/modules/module1']({ locked: false });

      const card = container.querySelector('[data-module-id="module1"]');
      expect(card.classList.contains('card--interactive')).toBe(true);

      // Lock again
      subscribeCallbacks['/sessions/LOCK01/modules/module1']({ locked: true, lockedAt: Date.now() });

      expect(card.classList.contains('card--locked')).toBe(true);
      expect(card.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('_countCompletedActivities', () => {
    it('returns 0 when no data', () => {
      const moduleDef = { activities: [{ id: 'a1' }, { id: 'a2' }] };
      expect(_countCompletedActivities(null, 'group1', moduleDef)).toBe(0);
    });

    it('returns 0 when no groupId', () => {
      const moduleDef = { activities: [{ id: 'a1' }] };
      const data = { a1: { completion: { group1: { status: 'completed' } } } };
      expect(_countCompletedActivities(data, null, moduleDef)).toBe(0);
    });

    it('counts completed activities for a group', () => {
      const moduleDef = { activities: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }] };
      const data = {
        a1: { completion: { group1: { status: 'completed' } } },
        a2: { completion: { group1: { status: 'in_progress' } } },
        a3: { completion: { group1: { status: 'completed' } } }
      };
      expect(_countCompletedActivities(data, 'group1', moduleDef)).toBe(2);
    });

    it('only counts for the specified group', () => {
      const moduleDef = { activities: [{ id: 'a1' }] };
      const data = {
        a1: { completion: { group2: { status: 'completed' } } }
      };
      expect(_countCompletedActivities(data, 'group1', moduleDef)).toBe(0);
    });
  });

  describe('_navigateToModule', () => {
    it('navigates to first activity of the module', () => {
      const moduleDef = {
        id: 'module5',
        activities: [{ id: 'formula-warm-up' }, { id: 'dataset-pipeline' }]
      };

      _navigateToModule(moduleDef);

      expect(navigate).toHaveBeenCalledWith('#activity/module5/formula-warm-up');
    });

    it('does nothing if module has no activities', () => {
      const moduleDef = { id: 'module1', activities: [] };

      _navigateToModule(moduleDef);

      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('registerView', () => {
    it('the render function is the exported render', () => {
      // registerView is called at module load time during import.
      // We verify the render function is correctly exported and matches what would be registered.
      expect(typeof render).toBe('function');
    });
  });

  describe('cleanup', () => {
    it('calls all unsubscribe functions on cleanup', () => {
      const unsub1 = vi.fn();
      const unsub2 = vi.fn();
      subscribe.mockReturnValueOnce(unsub1).mockReturnValueOnce(unsub2).mockReturnValue(() => {});

      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'CLN123', groupId: 'g1' });

      render({}, container);
      _cleanup();

      expect(unsub1).toHaveBeenCalled();
      expect(unsub2).toHaveBeenCalled();
    });

    it('cleans up on re-render', () => {
      const unsub = vi.fn();
      subscribe.mockReturnValue(unsub);

      getAllModules.mockReturnValue(createMockModules(1));
      getActiveSession.mockReturnValue({ passcode: 'RE1234', groupId: 'g1' });

      render({}, container);
      const firstCallCount = unsub.mock.calls.length;

      // Re-render should cleanup previous subscriptions
      render({}, container);

      // Previous subscriptions should have been cleaned
      expect(unsub.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });
});
