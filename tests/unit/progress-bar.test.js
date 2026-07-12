import { describe, it, expect } from 'vitest';
import { calculateProgress, createProgressBar } from '../../public/js/components/progress-bar.js';

describe('calculateProgress', () => {
  it('returns 0 when no items are completed', () => {
    expect(calculateProgress(0, 10)).toBe(0);
  });

  it('returns 100 when all items are completed', () => {
    expect(calculateProgress(5, 5)).toBe(100);
  });

  it('returns 50 for half completion', () => {
    expect(calculateProgress(5, 10)).toBe(50);
  });

  it('rounds to nearest whole number', () => {
    // 1/3 = 33.333... → 33
    expect(calculateProgress(1, 3)).toBe(33);
    // 2/3 = 66.666... → 67
    expect(calculateProgress(2, 3)).toBe(67);
  });

  it('returns 0 when total is 0', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('returns 0 when total is negative', () => {
    expect(calculateProgress(5, -1)).toBe(0);
  });

  it('returns 0 when completed is negative', () => {
    expect(calculateProgress(-1, 10)).toBe(0);
  });

  it('caps at 100 when completed exceeds total', () => {
    expect(calculateProgress(15, 10)).toBe(100);
  });

  it('handles single item completion', () => {
    expect(calculateProgress(1, 1)).toBe(100);
  });

  it('returns a whole number for any valid inputs', () => {
    const result = calculateProgress(7, 13);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(54); // 7/13 = 53.846... → 54
  });
});

describe('createProgressBar', () => {
  it('returns an HTMLElement', () => {
    const el = createProgressBar(3, 10);
    expect(el).toBeInstanceOf(HTMLElement);
  });

  it('has a container with progress-bar-container class', () => {
    const el = createProgressBar(3, 10);
    expect(el.className).toBe('progress-bar-container');
  });

  it('contains a progress bar element with role="progressbar"', () => {
    const el = createProgressBar(3, 10);
    const bar = el.querySelector('[role="progressbar"]');
    expect(bar).not.toBeNull();
  });

  it('sets aria-valuenow to the calculated percentage', () => {
    const el = createProgressBar(3, 10);
    const bar = el.querySelector('[role="progressbar"]');
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
  });

  it('sets aria-valuemin to 0', () => {
    const el = createProgressBar(5, 10);
    const bar = el.querySelector('[role="progressbar"]');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
  });

  it('sets aria-valuemax to 100', () => {
    const el = createProgressBar(5, 10);
    const bar = el.querySelector('[role="progressbar"]');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('sets the fill width to the calculated percentage', () => {
    const el = createProgressBar(7, 10);
    const fill = el.querySelector('.progress-bar__fill');
    expect(fill.style.width).toBe('70%');
  });

  it('displays the percentage as a label', () => {
    const el = createProgressBar(4, 5);
    const label = el.querySelector('.progress-bar__label');
    expect(label.textContent).toBe('80%');
  });

  it('uses custom label when provided in options', () => {
    const el = createProgressBar(2, 4, { label: '2 of 4' });
    const label = el.querySelector('.progress-bar__label');
    expect(label.textContent).toBe('2 of 4');
  });

  it('sets aria-label when provided in options', () => {
    const el = createProgressBar(3, 6, { ariaLabel: 'Module 1 progress' });
    const bar = el.querySelector('[role="progressbar"]');
    expect(bar.getAttribute('aria-label')).toBe('Module 1 progress');
  });

  it('does not set aria-label when not provided', () => {
    const el = createProgressBar(3, 6);
    const bar = el.querySelector('[role="progressbar"]');
    expect(bar.hasAttribute('aria-label')).toBe(false);
  });

  it('renders 0% correctly', () => {
    const el = createProgressBar(0, 10);
    const fill = el.querySelector('.progress-bar__fill');
    const label = el.querySelector('.progress-bar__label');
    const bar = el.querySelector('[role="progressbar"]');
    expect(fill.style.width).toBe('0%');
    expect(label.textContent).toBe('0%');
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
  });

  it('renders 100% correctly', () => {
    const el = createProgressBar(10, 10);
    const fill = el.querySelector('.progress-bar__fill');
    const label = el.querySelector('.progress-bar__label');
    const bar = el.querySelector('[role="progressbar"]');
    expect(fill.style.width).toBe('100%');
    expect(label.textContent).toBe('100%');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
  });

  it('has the correct CSS class on the bar', () => {
    const el = createProgressBar(5, 10);
    const bar = el.querySelector('.progress-bar');
    expect(bar).not.toBeNull();
  });

  it('has the correct CSS class on the fill', () => {
    const el = createProgressBar(5, 10);
    const fill = el.querySelector('.progress-bar__fill');
    expect(fill).not.toBeNull();
  });
});
