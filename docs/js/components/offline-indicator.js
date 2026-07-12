/**
 * OfflineIndicator Component
 * Persistent banner shown when the user is offline.
 * Hides automatically when back online.
 *
 * CSS class: .offline-banner
 * Uses ARIA live region for accessibility announcements.
 *
 * @module components/offline-indicator
 */

/**
 * Creates an OfflineIndicator banner element.
 * Initially hidden (online state assumed).
 *
 * @returns {HTMLElement} The offline banner element
 */
export function createOfflineIndicator() {
  const banner = document.createElement('div');
  banner.className = 'offline-banner';
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-live', 'assertive');
  banner.setAttribute('aria-atomic', 'true');
  banner.textContent = 'You are offline. Changes will be saved when you reconnect.';

  // Start hidden (assume online)
  banner.hidden = true;

  return banner;
}

/**
 * Updates the visibility of an offline indicator based on connectivity.
 *
 * @param {HTMLElement} banner - The offline banner element
 * @param {boolean} isOnline - Whether the user is currently online
 * @returns {HTMLElement} The updated banner element
 */
export function updateOfflineIndicator(banner, isOnline) {
  if (!banner) return banner;

  if (isOnline) {
    banner.hidden = true;
    banner.setAttribute('aria-hidden', 'true');
  } else {
    banner.hidden = false;
    banner.removeAttribute('aria-hidden');
  }

  return banner;
}
