/**
 * ProgressBar component
 * Displays module-level completion as a visual bar with percentage label.
 * Uses ARIA progressbar role for accessibility.
 */

/**
 * Calculate progress as a whole-number percentage (0-100).
 * @param {number} completed - Number of completed items
 * @param {number} total - Total number of items
 * @returns {number} Percentage as a whole number in [0, 100]
 */
export function calculateProgress(completed, total) {
  if (total <= 0) return 0;
  if (completed < 0) return 0;
  if (completed >= total) return 100;
  return Math.round((completed / total) * 100);
}

/**
 * Create a progress bar HTML element.
 * @param {number} completed - Number of completed items
 * @param {number} total - Total number of items
 * @param {object} [options] - Optional configuration
 * @param {string} [options.label] - Optional custom label (defaults to "X%")
 * @param {string} [options.ariaLabel] - Optional aria-label for the progressbar
 * @returns {HTMLElement} The progress bar container element
 */
export function createProgressBar(completed, total, options = {}) {
  const percentage = calculateProgress(completed, total);

  const container = document.createElement('div');
  container.className = 'progress-bar-container';

  // Progress bar track
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuenow', String(percentage));
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  if (options.ariaLabel) {
    bar.setAttribute('aria-label', options.ariaLabel);
  }

  // Fill element
  const fill = document.createElement('div');
  fill.className = 'progress-bar__fill';
  fill.style.width = `${percentage}%`;

  bar.appendChild(fill);
  container.appendChild(bar);

  // Label
  const label = document.createElement('span');
  label.className = 'progress-bar__label';
  label.textContent = options.label || `${percentage}%`;
  container.appendChild(label);

  return container;
}
