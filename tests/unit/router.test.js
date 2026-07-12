/**
 * Unit tests for the hash-based Router
 *
 * Tests: route parsing, navigation, guards, ARIA announcements, callbacks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseRoute,
  getCurrentRoute,
  navigate,
  onRouteChange,
  setSessionCheck,
  registerView,
  initRouter,
  destroyRouter,
  guardRoute,
  announceRouteChange,
  getRouteTitle,
  ROUTES,
  PUBLIC_ROUTES
} from '../../public/js/core/router.js';

describe('Router', () => {
  beforeEach(() => {
    // Set up minimal DOM
    document.body.innerHTML = `
      <main id="app" role="main"></main>
      <div id="notifications" role="status" aria-live="assertive" class="sr-only"></div>
    `;
    window.location.hash = '';
    destroyRouter();
  });

  afterEach(() => {
    destroyRouter();
    window.location.hash = '';
  });

  describe('parseRoute', () => {
    it('parses #login route', () => {
      const result = parseRoute('#login');
      expect(result).toEqual({ name: 'login', params: {} });
    });

    it('parses #join route', () => {
      const result = parseRoute('#join');
      expect(result).toEqual({ name: 'join', params: {} });
    });

    it('parses #modules route', () => {
      const result = parseRoute('#modules');
      expect(result).toEqual({ name: 'modules', params: {} });
    });

    it('parses #dashboard route', () => {
      const result = parseRoute('#dashboard');
      expect(result).toEqual({ name: 'dashboard', params: {} });
    });

    it('parses #export route', () => {
      const result = parseRoute('#export');
      expect(result).toEqual({ name: 'export', params: {} });
    });

    it('parses #activity/:moduleId/:activityId route with parameters', () => {
      const result = parseRoute('#activity/module1/tool-survey');
      expect(result).toEqual({
        name: 'activity',
        params: { moduleId: 'module1', activityId: 'tool-survey' }
      });
    });

    it('parses activity route with URL-encoded parameters', () => {
      const result = parseRoute('#activity/module%201/activity%202');
      expect(result).toEqual({
        name: 'activity',
        params: { moduleId: 'module 1', activityId: 'activity 2' }
      });
    });

    it('returns login route for empty hash', () => {
      const result = parseRoute('');
      expect(result).toEqual({ name: 'login', params: {} });
    });

    it('returns login route for bare #', () => {
      const result = parseRoute('#');
      expect(result).toEqual({ name: 'login', params: {} });
    });

    it('returns null for unknown routes', () => {
      const result = parseRoute('#unknown');
      expect(result).toBeNull();
    });

    it('returns null for malformed activity routes (missing activityId)', () => {
      const result = parseRoute('#activity/module1');
      expect(result).toBeNull();
    });
  });

  describe('getRouteTitle', () => {
    it('returns title for known routes', () => {
      expect(getRouteTitle('login')).toBe('Login');
      expect(getRouteTitle('join')).toBe('Join Session');
      expect(getRouteTitle('modules')).toBe('Module List');
      expect(getRouteTitle('activity')).toBe('Activity');
      expect(getRouteTitle('dashboard')).toBe('Facilitator Dashboard');
      expect(getRouteTitle('export')).toBe('Export');
    });

    it('returns "Page" for unknown route names', () => {
      expect(getRouteTitle('unknown')).toBe('Page');
    });
  });

  describe('getCurrentRoute', () => {
    it('returns login when hash is empty', () => {
      window.location.hash = '';
      const route = getCurrentRoute();
      expect(route.name).toBe('login');
    });

    it('returns parsed route from current hash', () => {
      window.location.hash = '#modules';
      const route = getCurrentRoute();
      expect(route.name).toBe('modules');
    });

    it('returns login for unknown hash (fallback)', () => {
      window.location.hash = '#nonexistent';
      const route = getCurrentRoute();
      expect(route.name).toBe('login');
    });
  });

  describe('navigate', () => {
    it('sets window.location.hash', () => {
      navigate('#modules');
      expect(window.location.hash).toBe('#modules');
    });

    it('adds # prefix if missing', () => {
      navigate('join');
      expect(window.location.hash).toBe('#join');
    });
  });

  describe('onRouteChange', () => {
    it('registers a callback and returns unsubscribe function', () => {
      const cb = vi.fn();
      const unsub = onRouteChange(cb);
      expect(typeof unsub).toBe('function');
    });

    it('calls callback on route change', async () => {
      const cb = vi.fn();
      setSessionCheck(() => true);
      initRouter();
      onRouteChange(cb);

      // Change hash and trigger event manually (jsdom doesn't auto-fire hashchange)
      window.location.hash = '#modules';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'modules', params: {} })
      );
    });

    it('unsubscribes when unsub function is called', () => {
      const cb = vi.fn();
      const unsub = onRouteChange(cb);
      initRouter();

      unsub();

      window.location.hash = '#modules';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      // Should not be called after unsubscribe (only called during initRouter for initial route)
      const callsAfterInit = cb.mock.calls.length;
      window.location.hash = '#join';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      expect(cb.mock.calls.length).toBe(callsAfterInit);
    });
  });

  describe('guardRoute', () => {
    it('allows public routes without session', () => {
      setSessionCheck(() => false);
      expect(guardRoute({ name: 'login', params: {} })).toBe(true);
      expect(guardRoute({ name: 'dashboard', params: {} })).toBe(true);
    });

    it('redirects protected routes to #login when no session', () => {
      setSessionCheck(() => false);
      const result = guardRoute({ name: 'modules', params: {} });
      expect(result).toBe(false);
      expect(window.location.hash).toBe('#login');
    });

    it('allows protected routes when session is active', () => {
      setSessionCheck(() => true);
      expect(guardRoute({ name: 'modules', params: {} })).toBe(true);
      expect(guardRoute({ name: 'join', params: {} })).toBe(true);
      expect(guardRoute({ name: 'activity', params: { moduleId: 'm1', activityId: 'a1' } })).toBe(true);
      expect(guardRoute({ name: 'export', params: {} })).toBe(true);
    });

    it('redirects when no session check function is set', () => {
      setSessionCheck(null);
      const result = guardRoute({ name: 'modules', params: {} });
      expect(result).toBe(false);
    });
  });

  describe('announceRouteChange', () => {
    it('updates the #notifications element with route title', () => {
      announceRouteChange('modules');
      const notifications = document.getElementById('notifications');
      expect(notifications.textContent).toBe('Navigated to Module List');
    });

    it('handles missing #notifications element gracefully', () => {
      document.getElementById('notifications').remove();
      expect(() => announceRouteChange('login')).not.toThrow();
    });
  });

  describe('registerView and rendering', () => {
    it('renders registered view on route change', () => {
      const renderFn = vi.fn((params, container) => {
        container.innerHTML = '<h1>Modules Page</h1>';
      });
      registerView('modules', renderFn);
      setSessionCheck(() => true);
      initRouter();

      window.location.hash = '#modules';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      expect(renderFn).toHaveBeenCalled();
      expect(document.getElementById('app').innerHTML).toBe('<h1>Modules Page</h1>');
    });

    it('shows placeholder for routes without registered views', () => {
      setSessionCheck(() => true);
      initRouter();

      window.location.hash = '#modules';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      const appContent = document.getElementById('app').innerHTML;
      expect(appContent).toContain('Module List');
      expect(appContent).toContain('Loading...');
    });

    it('passes route params to view renderer', () => {
      const renderFn = vi.fn();
      registerView('activity', renderFn);
      setSessionCheck(() => true);
      initRouter();

      window.location.hash = '#activity/module2/email-clinic';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      expect(renderFn).toHaveBeenCalledWith(
        { moduleId: 'module2', activityId: 'email-clinic' },
        expect.any(HTMLElement)
      );
    });
  });

  describe('initRouter', () => {
    it('sets tabindex on #app for keyboard focus management', () => {
      initRouter();
      const app = document.getElementById('app');
      expect(app.getAttribute('tabindex')).toBe('-1');
    });

    it('handles initial route on init', () => {
      window.location.hash = '#login';
      const cb = vi.fn();
      onRouteChange(cb);
      initRouter();

      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'login' })
      );
    });
  });

  describe('ROUTES and PUBLIC_ROUTES exports', () => {
    it('exports defined routes', () => {
      expect(ROUTES).toBeInstanceOf(Array);
      expect(ROUTES.length).toBe(6);
    });

    it('exports public routes', () => {
      expect(PUBLIC_ROUTES).toContain('login');
      expect(PUBLIC_ROUTES).toContain('dashboard');
      expect(PUBLIC_ROUTES.length).toBe(2);
    });
  });
});
