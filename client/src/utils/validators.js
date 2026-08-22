/**
 * Client-side form validation helpers.
 * Used by registration, login, trip creation, and other forms.
 */

/**
 * Validate an email address.
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validate a password (min 6 chars).
 * @param {string} password
 * @returns {string|null}
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

/**
 * Validate a required text field.
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null}
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || !value.toString().trim()) return `${fieldName} is required`;
  return null;
};

/**
 * Validate a username (alphanumeric + underscore, 3–30 chars).
 * @param {string} username
 * @returns {string|null}
 */
export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username must be at most 30 characters';
  const re = /^[a-zA-Z0-9_]+$/;
  if (!re.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
};

/**
 * Validate a phone number (optional, but if provided must be 7–15 digits).
 * @param {string} phone
 * @returns {string|null}
 */
export const validatePhone = (phone) => {
  if (!phone) return null; // optional field
  const re = /^\+?[\d\s-]{7,15}$/;
  if (!re.test(phone)) return 'Please enter a valid phone number';
  return null;
};

/**
 * Validate that endDate is after startDate.
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {string|null}
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate) return 'Start date is required';
  if (!endDate) return 'End date is required';
  if (new Date(endDate) <= new Date(startDate)) {
    return 'End date must be after start date';
  }
  return null;
};

/**
 * Validate a budget amount (must be non-negative number).
 * @param {number|string} amount
 * @returns {string|null}
 */
export const validateBudget = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return 'Budget must be a number';
  if (num < 0) return 'Budget cannot be negative';
  return null;
};

/**
 * Run multiple validators on a form data object.
 * Returns an errors object with field keys and error message values.
 *
 * @param {Object} data - Form data
 * @param {Object} validatorMap - { fieldName: validatorFn(value) }
 * @returns {Object} Errors object (empty if no errors)
 *
 * @example
 * const errors = validateForm(
 *   { email: 'bad', password: '12' },
 *   { email: validateEmail, password: validatePassword }
 * );
 * // → { email: 'Please enter a valid email', password: 'Password must be at least 6 characters' }
 */
export const validateForm = (data, validatorMap) => {
  const errors = {};
  for (const [field, validator] of Object.entries(validatorMap)) {
    const error = validator(data[field]);
    if (error) errors[field] = error;
  }
  return errors;
};
