import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a date string or Date object into a human-readable format.
 *
 * @param {string|Date} date - ISO date string or Date object
 * @param {string} pattern - date-fns format pattern (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string, or 'Invalid date' if parsing fails
 */
export const formatDate = (date, pattern = 'MMM d, yyyy') => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return format(parsed, pattern);
};

/**
 * Format a date as a relative time string (e.g., "3 days ago").
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeDate = (date) => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  return formatDistanceToNow(parsed, { addSuffix: true });
};

/**
 * Format a date range as "MMM d – MMM d, yyyy".
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {string}
 */
export const formatDateRange = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return 'Invalid date range';

  // Same year → "Jan 5 – Jan 12, 2026"
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  // Different years → "Dec 28, 2025 – Jan 3, 2026"
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
};
