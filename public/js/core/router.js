/**
 * Router — Hash-based SPA navigation
 *
 * Supports routes:
 *   #login, #join, #modules, #module/:moduleId, #activity/:moduleId/:activityId, #dashboard, #export
 *
 * Features:
 *   - Parses route parameters from hash fragments
 *   - Guards protected routes (redirects to #login if no active session)
 *   - Announces route changes via ARIA live region (#notifications)
 *   - Renders views into <main id="app">
 *
 * Requirements: 17.4 (keyboard nav), 17.5 (ARIA live region announcements)
 */

// Preview mode check function — set externally to avoid circular dependency
let _previewCheckFn = null;

/**
 * Set the preview mode check function.
 * Called by preview-mode.js during initialization.
 * @param {function} checkFn - Returns true if preview mode is active
 */
export function setPreviewCheck(checkFn) {
  _previewCheckFn = checkFn;
}

// Route definitions with their patterns and display names
const ROUTES = [
  { name: 'login', pattern: /^#login$/, title: 'Login' },
  { name: 'join', pattern: /^#join$/, title: 'Join Session' },
  { name: 'modules', pattern: /^#modules$/, title: 'Module List' },
  { name: 'module', pattern: /^#module\/([^/]+)$/, title: 'Module Content', params: ['moduleId'] },
  { name: 'activity', pattern: /^#activity\/([^/]+)\/([^/]+)$/, title: 'Activity', params: ['moduleId', 'activityId'] },
  { name: 'dashboard', pattern: /^#dashboard$/, title: 'Facilitator Dashboard' },
  { name: 'export', pattern: /^#export$/, title: 'Export' }
];

// Routes that do NOT require an active session
const PUBLIC_ROUTES = ['login', 'dashboard', 'module'];

// Internal state
let routeChangeCallbacks = [];
let currentParsedRoute = null;
let sessionCheckFn = null;
let viewRenderers = {};

/**
 * Parse a hash string into a route object.
 * @param {string} hash - The hash fragment (e.g., "#activity/module1/tool-survey")
 * @returns {{ name: string, params: object } | null}
 */
function parseRoute(hash) {
  if (!hash || hash === '' || hash === '#') {
    return { name: 'login', params: {} };
  }

  for (const route of ROUTES) {
    const match = hash.match(route.pattern);
    if (match) {
      const params = {};
      if (route.params) {
        route.params.forEach((paramName, index) => {
          params[paramName] = decodeURIComponent(match[index + 1]);
        });
      }
      return { name: route.name, params };
    }
  }

  // Unknown route — default to login
  return null;
}

/**
 * Get the display title for a route name.
 * @param {string} routeName
 * @returns {string}
 */
function getRouteTitle(routeName) {
  const route = ROUTES.find(r => r.name === routeName);
  return route ? route.title : 'Page';
}

/**
 * Get the current parsed route from window.location.hash.
 * @returns {{ name: string, params: object }}
 */
function getCurrentRoute() {
  const hash = typeof window !== 'undefined' ? window.location.hash : '#login';
  const parsed = parseRoute(hash);
  return parsed || { name: 'login', params: {} };
}

/**
 * Navigate to a route by updating the hash.
 * @param {string} route - The hash route (e.g., "#modules" or "#activity/module1/tool-survey")
 */
function navigate(route) {
  if (typeof window !== 'undefined') {
    // Normalise: add # prefix if missing
    const hash = route.startsWith('#') ? route : `#${route}`;
    window.location.hash = hash;
  }
}

/**
 * Register a callback to be called on route changes.
 * @param {function} callback - Function receiving { name, params, previousRoute }
 * @returns {function} Unsubscribe function
 */
function onRouteChange(callback) {
  routeChangeCallbacks.push(callback);
  return () => {
    routeChangeCallbacks = routeChangeCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Set the session check function used by the route guard.
 * The function should return truthy if there is an active session.
 * @param {function} checkFn - Returns truthy value if session is active
 */
function setSessionCheck(checkFn) {
  sessionCheckFn = checkFn;
}

/**
 * Register a view renderer for a route name.
 * @param {string} routeName - One of: login, join, modules, activity, dashboard, export
 * @param {function} renderFn - Function(params) that renders the view into the app container
 */
function registerView(routeName, renderFn) {
  viewRenderers[routeName] = renderFn;
}

/**
 * Check if the current route requires a session and redirect if needed.
 * Preview mode bypasses the session guard for module and activity routes.
 * @param {{ name: string, params: object }} route
 * @returns {boolean} true if access is allowed, false if redirected
 */
function guardRoute(route) {
  if (PUBLIC_ROUTES.includes(route.name)) {
    return true;
  }

  // Preview mode allows access to modules, module content, and activity routes without a session
  if (_previewCheckFn && _previewCheckFn() && (route.name === 'modules' || route.name === 'module' || route.name === 'activity')) {
    return true;
  }

  // Check for active session
  const hasSession = sessionCheckFn ? sessionCheckFn() : false;
  if (!hasSession) {
    navigate('#login');
    return false;
  }

  return true;
}

/**
 * Announce a route change to screen readers via the ARIA live region.
 * @param {string} routeName
 */
function announceRouteChange(routeName) {
  if (typeof document === 'undefined') return;

  const notifications = document.getElementById('notifications');
  if (notifications) {
    const title = getRouteTitle(routeName);
    notifications.textContent = `Navigated to ${title}`;
  }
}

/**
 * Render the view for the current route into the app container.
 * @param {{ name: string, params: object }} route
 */
function renderView(route) {
  if (typeof document === 'undefined') return;

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const renderFn = viewRenderers[route.name];
  if (renderFn) {
    renderFn(route.params, appContainer);
  } else {
    // Default: show a placeholder until the view is registered
    appContainer.innerHTML = `<section aria-label="${getRouteTitle(route.name)}"><h1>${getRouteTitle(route.name)}</h1><p>Loading...</p></section>`;
  }

  // Move focus to main content for keyboard navigation (Requirement 17.4)
  appContainer.focus({ preventScroll: false });
}

/**
 * Handle a hash change event — the core routing logic.
 */
function handleRouteChange() {
  const newRoute = getCurrentRoute();
  const previousRoute = currentParsedRoute;

  // Guard protected routes
  if (!guardRoute(newRoute)) {
    return;
  }

  currentParsedRoute = newRoute;

  // Announce to screen readers
  announceRouteChange(newRoute.name);

  // Render the view
  renderView(newRoute);

  // Notify all registered callbacks
  routeChangeCallbacks.forEach(cb => {
    try {
      cb({ name: newRoute.name, params: newRoute.params, previousRoute });
    } catch (err) {
      console.error('Route change callback error:', err);
    }
  });
}

/**
 * Initialise the router — attach the hashchange listener and handle the initial route.
 */
function initRouter() {
  if (typeof window === 'undefined') return;

  // Ensure the main app container is focusable for keyboard nav
  const appContainer = document.getElementById('app');
  if (appContainer && !appContainer.hasAttribute('tabindex')) {
    appContainer.setAttribute('tabindex', '-1');
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouteChange);

  // Handle the initial route
  handleRouteChange();
}

/**
 * Destroy the router — remove listeners. Useful for testing.
 */
function destroyRouter() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('hashchange', handleRouteChange);
  }
  routeChangeCallbacks = [];
  currentParsedRoute = null;
  viewRenderers = {};
  sessionCheckFn = null;
}

export {
  parseRoute,
  getCurrentRoute,
  navigate,
  onRouteChange,
  setSessionCheck,
  registerView,
  initRouter,
  destroyRouter,
  handleRouteChange,
  guardRoute,
  announceRouteChange,
  getRouteTitle,
  ROUTES,
  PUBLIC_ROUTES
};
