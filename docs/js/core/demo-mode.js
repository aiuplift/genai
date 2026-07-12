/**
 * Demo Mode — Local testing without Firebase
 *
 * Activates ONLY when Firebase is not properly configured (placeholder keys).
 * Provides an in-memory mock of session data so the full UI can be tested locally.
 *
 * In production (real Firebase config), this module does nothing.
 *
 * Demo passcodes:
 *   - DEMO01 → Participant access (session: "Demo Training Session")
 *   - ADMIN1 → Facilitator access (dashboard)
 */

import SessionManager from './session-manager.js';
import { setMockProvider } from './sync-engine.js';

// --- Demo Configuration ---

const DEMO_PASSCODE = 'DEMO01';
const FACILITATOR_PASSCODE = 'ADMIN1';
const DEMO_SESSION_PASSCODE = 'DEMO01';

const DEMO_SESSION = {
  passcode: DEMO_PASSCODE,
  name: 'Demo Training Session',
  sessionName: 'Demo Training Session',
  facilitatorId: 'demo-facilitator',
  createdAt: Date.now(),
  groupId: null,
  displayName: null,
  participantId: null
};

const FACILITATOR_SESSION = {
  passcode: FACILITATOR_PASSCODE,
  name: 'Demo Training Session',
  sessionName: 'Demo Training Session',
  facilitatorId: 'demo-facilitator',
  role: 'facilitator',
  createdAt: Date.now()
};

// In-memory data store (mimics Firebase RTDB)
const demoStore = {
  modules: {},
  groups: {},
  activities: {},
  presence: {},
  chat: {}
};

// Initialize all modules as unlocked for demo
for (let i = 1; i <= 10; i++) {
  demoStore.modules[`module${i}`] = { locked: false, unlockedAt: Date.now() };
}

// Subscribers listening to paths
const subscribers = new Map(); // path -> Set<callback>

// --- Detection ---

/**
 * Check if demo mode should be active.
 * Returns true if Firebase config has placeholder values.
 */
export function isDemoMode() {
  if (typeof window === 'undefined') return false;

  const configCheck = window._firebaseConfig;
  if (configCheck && configCheck.apiKey && configCheck.apiKey !== 'YOUR_API_KEY') {
    return false;
  }

  if (typeof firebase !== 'undefined') {
    try {
      const app = firebase.app();
      if (app && app.options && app.options.apiKey !== 'YOUR_API_KEY') {
        return false;
      }
    } catch {
      // Firebase not initialized — demo mode
    }
  }

  return true;
}

/**
 * Activate demo mode — patches SessionManager and SyncEngine to work without Firebase.
 */
export function activateDemoMode() {
  console.log('%c🧪 DEMO MODE ACTIVE', 'color: #f59e0b; font-weight: bold; font-size: 14px;');
  console.log('   Passcodes: DEMO01 (participant) | ADMIN1 (facilitator)');
  console.log('   All modules are unlocked. Data is stored in memory only.');

  _patchSessionManager();
  _patchSyncEngine();
  _showDemoBanner();
}

// --- Patch SessionManager ---

function _patchSessionManager() {
  SessionManager.validatePasscode = async function (input) {
    const normalized = (input || '').trim().toUpperCase();

    if (normalized === DEMO_PASSCODE) {
      return { valid: true, sessionData: { ...DEMO_SESSION } };
    }
    if (normalized === FACILITATOR_PASSCODE) {
      return { valid: true, sessionData: { ...FACILITATOR_SESSION } };
    }

    return { valid: false };
  };

  SessionManager.createSession = async function (facilitatorId, sessionName) {
    const passcode = SessionManager.generatePasscode();
    return { passcode, sessionRef: null };
  };

  SessionManager.deleteSession = async function () {
    SessionManager.setActiveSession(null);
  };
}

// --- Patch SyncEngine ---

function _patchSyncEngine() {
  // Install mock provider that uses in-memory demo store
  setMockProvider({
    subscribe(path, callback) {
      // Store subscriber
      if (!subscribers.has(path)) {
        subscribers.set(path, new Set());
      }
      subscribers.get(path).add(callback);

      // Immediately invoke callback with demo data for known paths
      const data = _getDataForPath(path);
      setTimeout(() => callback(data), 0);

      // Return unsubscribe function
      return () => {
        const subs = subscribers.get(path);
        if (subs) subs.delete(callback);
      };
    },

    write(path, value) {
      _setDataAtPath(path, value);
      _notifySubscribers(path);
    }
  });
}

// --- In-Memory Data Store Operations ---

function _getDataForPath(path) {
  // Parse path: /sessions/{passcode}/modules → return demoStore.modules
  const parts = path.replace(/^\//, '').split('/');

  // /sessions/{passcode}/modules
  if (parts[0] === 'sessions' && parts[2] === 'modules') {
    if (parts.length === 3) return demoStore.modules;
    if (parts.length >= 4) return demoStore.modules[parts[3]] || null;
  }

  // /sessions/{passcode}/groups
  if (parts[0] === 'sessions' && parts[2] === 'groups') {
    return demoStore.groups;
  }

  // /sessions/{passcode}/activities
  if (parts[0] === 'sessions' && parts[2] === 'activities') {
    if (parts.length === 3) return demoStore.activities;
    // /sessions/{passcode}/activities/{moduleId}
    if (parts.length === 4) return demoStore.activities[parts[3]] || {};
    // /sessions/{passcode}/activities/{moduleId}/{activityId}/responses/{groupId}
    if (parts.length >= 5) {
      const moduleId = parts[3];
      const activityId = parts[4];
      if (!demoStore.activities[moduleId]) demoStore.activities[moduleId] = {};
      if (!demoStore.activities[moduleId][activityId]) demoStore.activities[moduleId][activityId] = { responses: {}, completion: {} };
      if (parts[5] === 'responses' && parts[6]) {
        return demoStore.activities[moduleId][activityId].responses[parts[6]] || {};
      }
      return demoStore.activities[moduleId][activityId];
    }
  }

  // /sessions/{passcode}/presence
  if (parts[0] === 'sessions' && parts[2] === 'presence') {
    return demoStore.presence;
  }

  return null;
}

function _setDataAtPath(path, value) {
  const parts = path.replace(/^\//, '').split('/');

  // /sessions/{passcode}/modules/{moduleId}/locked
  if (parts[0] === 'sessions' && parts[2] === 'modules' && parts.length >= 4) {
    const moduleId = parts[3];
    if (!demoStore.modules[moduleId]) demoStore.modules[moduleId] = {};
    if (parts[4] === 'locked') {
      demoStore.modules[moduleId].locked = value;
    } else if (parts[4]) {
      demoStore.modules[moduleId][parts[4]] = value;
    } else {
      demoStore.modules[moduleId] = value;
    }
    return;
  }

  // /sessions/{passcode}/groups/{groupId}/...
  if (parts[0] === 'sessions' && parts[2] === 'groups') {
    if (parts.length >= 4) {
      const groupId = parts[3];
      if (!demoStore.groups[groupId]) demoStore.groups[groupId] = { members: {}, memberCount: 0 };
      if (parts[4] === 'members' && parts[5]) {
        demoStore.groups[groupId].members[parts[5]] = value;
      } else if (parts[4] === 'memberCount') {
        demoStore.groups[groupId].memberCount = value;
      } else if (parts.length === 4) {
        demoStore.groups[groupId] = value;
      }
    }
    return;
  }

  // /sessions/{passcode}/activities/{moduleId}/{activityId}/responses/{groupId}/{fieldId}
  if (parts[0] === 'sessions' && parts[2] === 'activities') {
    const moduleId = parts[3];
    const activityId = parts[4];
    if (!demoStore.activities[moduleId]) demoStore.activities[moduleId] = {};
    if (activityId) {
      if (!demoStore.activities[moduleId][activityId]) {
        demoStore.activities[moduleId][activityId] = { responses: {}, completion: {} };
      }
      if (parts[5] === 'responses' && parts[6]) {
        const groupId = parts[6];
        if (!demoStore.activities[moduleId][activityId].responses[groupId]) {
          demoStore.activities[moduleId][activityId].responses[groupId] = {};
        }
        if (parts[7]) {
          demoStore.activities[moduleId][activityId].responses[groupId][parts[7]] = value;
        }
      }
    }
    return;
  }

  // /sessions/{passcode}/presence/{participantId}
  if (parts[0] === 'sessions' && parts[2] === 'presence' && parts[3]) {
    demoStore.presence[parts[3]] = value;
    return;
  }
}

function _notifySubscribers(path) {
  // Notify exact path subscribers
  const subs = subscribers.get(path);
  if (subs) {
    const data = _getDataForPath(path);
    subs.forEach(cb => {
      try { cb(data); } catch (e) { console.error('Demo subscriber error:', e); }
    });
  }

  // Also notify parent path subscribers (e.g., writing to /modules/module1/locked notifies /modules)
  const parts = path.replace(/^\//, '').split('/');
  for (let i = parts.length - 1; i >= 3; i--) {
    const parentPath = '/' + parts.slice(0, i).join('/');
    const parentSubs = subscribers.get(parentPath);
    if (parentSubs) {
      const data = _getDataForPath(parentPath);
      parentSubs.forEach(cb => {
        try { cb(data); } catch (e) { console.error('Demo subscriber error:', e); }
      });
    }
  }
}

// --- Demo Banner ---

function _showDemoBanner() {
  if (typeof document === 'undefined') return;

  const banner = document.createElement('div');
  banner.id = 'demo-mode-banner';
  banner.setAttribute('role', 'status');
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 6px 16px;
    background: #fef3c7;
    color: #92400e;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    border-bottom: 1px solid #f59e0b;
  `;
  banner.innerHTML = '🧪 Demo Mode — Use passcode <strong>DEMO01</strong> (participant) or <strong>ADMIN1</strong> (facilitator). Data is stored in memory only.';
  document.body.prepend(banner);

  // Push the header down
  const header = document.querySelector('header');
  if (header) {
    header.style.marginTop = '36px';
  }
}

export default { isDemoMode, activateDemoMode, DEMO_PASSCODE, FACILITATOR_PASSCODE };
