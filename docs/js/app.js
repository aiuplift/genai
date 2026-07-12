/**
 * AI Essentials Exercise Platform - Main Entry Point
 *
 * Initialises Firebase and starts the hash-based router.
 * No build step required — served directly via Firebase Hosting.
 */

import { initRouter, setSessionCheck, registerView } from './core/router.js';
import SessionManager from './core/session-manager.js';
import { initPrivacyCleanup } from './core/privacy.js';
import { isDemoMode, activateDemoMode } from './core/demo-mode.js';
import { init as initSyncEngine } from './core/sync-engine.js';

// Import all views (they self-register via registerView on import)
import { render as renderLogin } from './views/login-view.js';
import './views/join-view.js';
import './views/module-list-view.js';
import './views/module-content-view.js';
import './views/activity-view.js';
import './views/dashboard-view.js';
import './views/export-view.js';

// Import all module definitions (they self-register in ModuleRegistry on import)
import './modules/module1.js';
import './modules/module2.js';
import './modules/module3.js';
import './modules/module4.js';
import './modules/module5.js';
import './modules/module6.js';
import './modules/module7.js';
import './modules/module8.js';
import './modules/module9.js';
import './modules/module10.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDbktOt2SgVICAi2CUr1ZRsLAo2LBhw-1w',
  authDomain: 'synaptic-ai-4491b.firebaseapp.com',
  databaseURL: 'https://synaptic-ai-4491b-default-rtdb.firebaseio.com',
  projectId: 'synaptic-ai-4491b',
  storageBucket: 'synaptic-ai-4491b.firebasestorage.app',
  messagingSenderId: '314401960047',
  appId: '1:314401960047:web:cd05406ae08a008dafdd9a',
  measurementId: 'G-NS0H1MJGEK'
};

// Initialise Firebase
let app;
let database;

// Expose config for demo mode detection
if (typeof window !== 'undefined') {
  window._firebaseConfig = firebaseConfig;
}

function initFirebase() {
  if (typeof firebase !== 'undefined') {
    try {
      app = firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    } catch (e) {
      // Firebase init failed (likely placeholder config) — demo mode will handle it
      console.warn('Firebase initialization skipped:', e.message);
    }
  }
  return { app, database };
}

// Initialise the application
function init() {
  const { database } = initFirebase();

  // Initialize the SyncEngine with Firebase database
  if (database) {
    initSyncEngine(database);
  }

  // Activate demo mode if Firebase isn't properly configured
  if (isDemoMode()) {
    activateDemoMode();
  }

  // Announce page ready to assistive technology
  const notifications = document.getElementById('notifications');
  if (notifications) {
    notifications.textContent = 'AI Essentials platform loaded';
  }

  // Configure session guard — checks if there is an active session
  // In demo/static mode (no database), allow access to all routes
  setSessionCheck(() => {
    if (!database || isDemoMode()) {
      return true; // Bypass guard on GitHub Pages / static hosting
    }
    return SessionManager.getActiveSession() !== null;
  });

  // Register login view (other views self-register on import above)
  registerView('login', renderLogin);

  // Start the router
  initRouter();

  // In demo/static mode, navigate to modules list if on login page
  if ((!database || isDemoMode()) && (!window.location.hash || window.location.hash === '#login')) {
    window.location.hash = '#modules';
  }

  // Initialize privacy cleanup (clears data on tab close)
  initPrivacyCleanup();
}

// Start the app when DOM is ready (browser environment only)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

export { initFirebase, init, firebaseConfig };
