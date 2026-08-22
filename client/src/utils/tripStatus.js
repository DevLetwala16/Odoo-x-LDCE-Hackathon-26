/**
 * Derive trip status from start/end dates.
 * Trip status is NEVER stored in the database — always computed on the client.
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {'upcoming' | 'ongoing' | 'completed'}
 */
export const getTripStatus = (startDate, endDate) => {
  const now = new Date();
  if (now < new Date(startDate)) return 'upcoming';
  if (now > new Date(endDate)) return 'completed';
  return 'ongoing';
};

/**
 * Get a display label for a trip status.
 *
 * @param {'upcoming' | 'ongoing' | 'completed'} status
 * @returns {string}
 */
export const getTripStatusLabel = (status) => {
  const labels = {
    upcoming: 'Upcoming',
    ongoing: 'Ongoing',
    completed: 'Completed',
  };
  return labels[status] || status;
};

/**
 * Get the CSS color token name for a trip status (for badge styling).
 *
 * @param {'upcoming' | 'ongoing' | 'completed'} status
 * @returns {string} CSS variable name
 */
export const getTripStatusColor = (status) => {
  const colors = {
    upcoming: 'var(--color-info)',
    ongoing: 'var(--color-primary)',
    completed: 'var(--color-success)',
  };
  return colors[status] || 'var(--color-text-secondary)';
};

/**
 * Group an array of trips by their computed status.
 *
 * @param {Array} trips
 * @returns {{ ongoing: Array, upcoming: Array, completed: Array }}
 */
export const groupTripsByStatus = (trips) => {
  return trips.reduce(
    (groups, trip) => {
      const status = getTripStatus(trip.startDate, trip.endDate);
      groups[status].push(trip);
      return groups;
    },
    { ongoing: [], upcoming: [], completed: [] }
  );
};
