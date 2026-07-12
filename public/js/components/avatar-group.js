/**
 * AvatarGroup Component
 * Displays presence indicators for group members viewing an activity card.
 * Shows up to 5 individual avatars (initials-based) with overflow count.
 *
 * CSS classes: .avatar-group, .avatar, .avatar--overflow
 * Uses ARIA live region for dynamic updates.
 *
 * @module components/avatar-group
 */

/**
 * Get initials from a display name.
 * Takes first letter of first and last word (if available).
 * @param {string} displayName
 * @returns {string} Up to 2-character initials
 */
export function getInitials(displayName) {
  if (!displayName || typeof displayName !== 'string') {
    return '?';
  }
  const trimmed = displayName.trim();
  if (trimmed.length === 0) {
    return '?';
  }
  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Maximum number of individual avatars to display.
 */
const MAX_VISIBLE_AVATARS = 5;

/**
 * Creates an AvatarGroup DOM element showing group member presence.
 *
 * @param {Array<{displayName: string}>} members - Array of member objects
 * @returns {HTMLElement} The avatar group container element
 */
export function createAvatarGroup(members) {
  const container = document.createElement('div');
  container.className = 'avatar-group';
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', `${members.length} group member${members.length !== 1 ? 's' : ''} present`);
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'true');

  const validMembers = Array.isArray(members) ? members : [];
  const visibleCount = Math.min(validMembers.length, MAX_VISIBLE_AVATARS);
  const overflowCount = validMembers.length - visibleCount;

  // Render individual avatars (up to 5)
  for (let i = 0; i < visibleCount; i++) {
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = getInitials(validMembers[i].displayName);
    avatar.title = validMembers[i].displayName;
    container.appendChild(avatar);
  }

  // Render overflow indicator if N > 5
  if (overflowCount > 0) {
    const overflow = document.createElement('span');
    overflow.className = 'avatar avatar--overflow';
    overflow.setAttribute('aria-hidden', 'true');
    overflow.textContent = `+${overflowCount}`;
    overflow.title = `${overflowCount} more member${overflowCount !== 1 ? 's' : ''}`;
    container.appendChild(overflow);
  }

  return container;
}

/**
 * Updates an existing AvatarGroup element with new members.
 * Replaces the inner content while preserving the container.
 *
 * @param {HTMLElement} container - Existing avatar group container
 * @param {Array<{displayName: string}>} members - Updated array of member objects
 * @returns {HTMLElement} The updated container
 */
export function updateAvatarGroup(container, members) {
  if (!container) return createAvatarGroup(members);

  const validMembers = Array.isArray(members) ? members : [];
  const visibleCount = Math.min(validMembers.length, MAX_VISIBLE_AVATARS);
  const overflowCount = validMembers.length - visibleCount;

  // Update ARIA label
  container.setAttribute('aria-label', `${validMembers.length} group member${validMembers.length !== 1 ? 's' : ''} present`);

  // Clear existing children
  container.innerHTML = '';

  // Re-render avatars
  for (let i = 0; i < visibleCount; i++) {
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = getInitials(validMembers[i].displayName);
    avatar.title = validMembers[i].displayName;
    container.appendChild(avatar);
  }

  // Re-render overflow if needed
  if (overflowCount > 0) {
    const overflow = document.createElement('span');
    overflow.className = 'avatar avatar--overflow';
    overflow.setAttribute('aria-hidden', 'true');
    overflow.textContent = `+${overflowCount}`;
    overflow.title = `${overflowCount} more member${overflowCount !== 1 ? 's' : ''}`;
    container.appendChild(overflow);
  }

  return container;
}
