import { describe, it, expect } from 'vitest';
import { createAvatarGroup, updateAvatarGroup, getInitials } from '../../public/js/components/avatar-group.js';

describe('getInitials', () => {
  it('returns first letter for single word name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('returns first and last initials for multi-word name', () => {
    expect(getInitials('John Smith')).toBe('JS');
  });

  it('returns uppercase initials', () => {
    expect(getInitials('bob jones')).toBe('BJ');
  });

  it('handles three-word names using first and last word', () => {
    expect(getInitials('Mary Jane Watson')).toBe('MW');
  });

  it('returns ? for empty string', () => {
    expect(getInitials('')).toBe('?');
  });

  it('returns ? for null or undefined', () => {
    expect(getInitials(null)).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });

  it('trims whitespace before processing', () => {
    expect(getInitials('  Alice  ')).toBe('A');
    expect(getInitials('  John Smith  ')).toBe('JS');
  });
});

describe('createAvatarGroup', () => {
  it('creates container with correct class and ARIA attributes', () => {
    const members = [{ displayName: 'Alice' }];
    const el = createAvatarGroup(members);

    expect(el.className).toBe('avatar-group');
    expect(el.getAttribute('role')).toBe('group');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('aria-atomic')).toBe('true');
  });

  it('shows correct ARIA label for single member', () => {
    const el = createAvatarGroup([{ displayName: 'Alice' }]);
    expect(el.getAttribute('aria-label')).toBe('1 group member present');
  });

  it('shows correct ARIA label for multiple members', () => {
    const members = [
      { displayName: 'Alice' },
      { displayName: 'Bob' },
      { displayName: 'Charlie' }
    ];
    const el = createAvatarGroup(members);
    expect(el.getAttribute('aria-label')).toBe('3 group members present');
  });

  it('renders up to 5 individual avatars', () => {
    const members = Array.from({ length: 5 }, (_, i) => ({ displayName: `User ${i}` }));
    const el = createAvatarGroup(members);
    const avatars = el.querySelectorAll('.avatar:not(.avatar--overflow)');

    expect(avatars.length).toBe(5);
  });

  it('shows overflow indicator when more than 5 members', () => {
    const members = Array.from({ length: 7 }, (_, i) => ({ displayName: `User ${i}` }));
    const el = createAvatarGroup(members);

    const avatars = el.querySelectorAll('.avatar:not(.avatar--overflow)');
    const overflow = el.querySelector('.avatar--overflow');

    expect(avatars.length).toBe(5);
    expect(overflow).not.toBeNull();
    expect(overflow.textContent).toBe('+2');
  });

  it('does not show overflow indicator for exactly 5 members', () => {
    const members = Array.from({ length: 5 }, (_, i) => ({ displayName: `User ${i}` }));
    const el = createAvatarGroup(members);
    const overflow = el.querySelector('.avatar--overflow');

    expect(overflow).toBeNull();
  });

  it('renders zero avatars for empty array', () => {
    const el = createAvatarGroup([]);
    const avatars = el.querySelectorAll('.avatar');
    expect(avatars.length).toBe(0);
    expect(el.getAttribute('aria-label')).toBe('0 group members present');
  });

  it('renders initials in each avatar', () => {
    const members = [
      { displayName: 'Alice Smith' },
      { displayName: 'Bob' }
    ];
    const el = createAvatarGroup(members);
    const avatars = el.querySelectorAll('.avatar:not(.avatar--overflow)');

    expect(avatars[0].textContent).toBe('AS');
    expect(avatars[1].textContent).toBe('B');
  });

  it('sets title attribute on each avatar', () => {
    const members = [{ displayName: 'Alice' }, { displayName: 'Bob Jones' }];
    const el = createAvatarGroup(members);
    const avatars = el.querySelectorAll('.avatar:not(.avatar--overflow)');

    expect(avatars[0].title).toBe('Alice');
    expect(avatars[1].title).toBe('Bob Jones');
  });

  it('marks individual avatars as aria-hidden', () => {
    const members = [{ displayName: 'Alice' }];
    const el = createAvatarGroup(members);
    const avatar = el.querySelector('.avatar');

    expect(avatar.getAttribute('aria-hidden')).toBe('true');
  });

  it('handles large overflow counts correctly', () => {
    const members = Array.from({ length: 20 }, (_, i) => ({ displayName: `User ${i}` }));
    const el = createAvatarGroup(members);
    const overflow = el.querySelector('.avatar--overflow');

    expect(overflow.textContent).toBe('+15');
    expect(overflow.title).toBe('15 more members');
  });
});

describe('updateAvatarGroup', () => {
  it('updates existing container with new members', () => {
    const el = createAvatarGroup([{ displayName: 'Alice' }]);
    updateAvatarGroup(el, [{ displayName: 'Alice' }, { displayName: 'Bob' }]);

    const avatars = el.querySelectorAll('.avatar:not(.avatar--overflow)');
    expect(avatars.length).toBe(2);
    expect(el.getAttribute('aria-label')).toBe('2 group members present');
  });

  it('adds overflow when members grow past 5', () => {
    const el = createAvatarGroup([{ displayName: 'Alice' }]);
    const newMembers = Array.from({ length: 8 }, (_, i) => ({ displayName: `User ${i}` }));
    updateAvatarGroup(el, newMembers);

    const overflow = el.querySelector('.avatar--overflow');
    expect(overflow).not.toBeNull();
    expect(overflow.textContent).toBe('+3');
  });

  it('removes overflow when members shrink to 5 or fewer', () => {
    const members = Array.from({ length: 8 }, (_, i) => ({ displayName: `User ${i}` }));
    const el = createAvatarGroup(members);
    updateAvatarGroup(el, [{ displayName: 'Alice' }]);

    const overflow = el.querySelector('.avatar--overflow');
    expect(overflow).toBeNull();
  });

  it('creates a new element if container is null', () => {
    const result = updateAvatarGroup(null, [{ displayName: 'Alice' }]);
    expect(result).not.toBeNull();
    expect(result.className).toBe('avatar-group');
  });
});
