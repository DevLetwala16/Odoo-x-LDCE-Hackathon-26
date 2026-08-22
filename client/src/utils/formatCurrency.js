/**
 * Format a number as currency.
 *
 * @param {number} amount - The numeric amount
 * @param {string} currency - ISO 4217 currency code (default: 'INR')
 * @param {string} locale - BCP 47 locale string (default: 'en-IN')
 * @returns {string} Formatted currency string (e.g., "₹1,200.00")
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (typeof amount !== 'number' || isNaN(amount)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a compact currency value (e.g., "₹1.2K").
 *
 * @param {number} amount
 * @param {string} currency
 * @param {string} locale
 * @returns {string}
 */
export const formatCurrencyCompact = (amount, currency = 'INR', locale = 'en-IN') => {
  if (typeof amount !== 'number' || isNaN(amount)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};
