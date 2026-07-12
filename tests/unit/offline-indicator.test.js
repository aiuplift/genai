import { describe, it, expect } from 'vitest';
import { createOfflineIndicator, updateOfflineIndicator } from '../../public/js/components/offline-indicator.js';

describe('createOfflineIndicator', () => {
  it('creates a div with offline-banner class', () => {
    const el = createOfflineIndicator();
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('offline-banner');
  });

  it('has role="alert" for screen reader announcement', () => {
    const el = createOfflineIndicator();
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('has aria-live="assertive" for immediate announcements', () => {
    const el = createOfflineIndicator();
    expect(el.getAttribute('aria-live')).toBe('assertive');
  });

  it('has aria-atomic="true" to announce full content', () => {
    const el = createOfflineIndicator();
    expect(el.getAttribute('aria-atomic')).toBe('true');
  });

  it('displays the correct offline message', () => {
    const el = createOfflineIndicator();
    expect(el.textContent).toBe('You are offline. Changes will be saved when you reconnect.');
  });

  it('starts hidden (online state assumed)', () => {
    const el = createOfflineIndicator();
    expect(el.hidden).toBe(true);
  });
});

describe('updateOfflineIndicator', () => {
  it('shows banner when offline (isOnline = false)', () => {
    const el = createOfflineIndicator();
    updateOfflineIndicator(el, false);

    expect(el.hidden).toBe(false);
    expect(el.hasAttribute('aria-hidden')).toBe(false);
  });

  it('hides banner when online (isOnline = true)', () => {
    const el = createOfflineIndicator();
    // First go offline
    updateOfflineIndicator(el, false);
    // Then come back online
    updateOfflineIndicator(el, true);

    expect(el.hidden).toBe(true);
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('stays hidden when called with online state multiple times', () => {
    const el = createOfflineIndicator();
    updateOfflineIndicator(el, true);
    updateOfflineIndicator(el, true);

    expect(el.hidden).toBe(true);
  });

  it('stays visible when called with offline state multiple times', () => {
    const el = createOfflineIndicator();
    updateOfflineIndicator(el, false);
    updateOfflineIndicator(el, false);

    expect(el.hidden).toBe(false);
  });

  it('handles null banner gracefully', () => {
    const result = updateOfflineIndicator(null, true);
    expect(result).toBeNull();
  });

  it('transitions correctly between online and offline states', () => {
    const el = createOfflineIndicator();

    // Start hidden
    expect(el.hidden).toBe(true);

    // Go offline
    updateOfflineIndicator(el, false);
    expect(el.hidden).toBe(false);

    // Back online
    updateOfflineIndicator(el, true);
    expect(el.hidden).toBe(true);

    // Offline again
    updateOfflineIndicator(el, false);
    expect(el.hidden).toBe(false);
  });

  it('returns the banner element', () => {
    const el = createOfflineIndicator();
    const result = updateOfflineIndicator(el, false);
    expect(result).toBe(el);
  });
});
