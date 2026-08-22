/**
 * Application-wide constants and enums.
 * Import as: import { ACTIVITY_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants';
 */

export const ACTIVITY_CATEGORIES = [
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'food', label: 'Food' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'culture', label: 'Culture' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'transport', label: 'Transport' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'food', label: 'Food' },
  { value: 'activity', label: 'Activity' },
  { value: 'misc', label: 'Miscellaneous' },
];

export const TRIP_STATUSES = {
  ONGOING: 'ongoing',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const SORT_OPTIONS = {
  TRIPS: [
    { value: 'startDate', label: 'Start Date' },
    { value: '-startDate', label: 'Start Date (Newest)' },
    { value: 'name', label: 'Name (A–Z)' },
    { value: '-name', label: 'Name (Z–A)' },
    { value: 'totalBudget', label: 'Budget (Low–High)' },
    { value: '-totalBudget', label: 'Budget (High–Low)' },
  ],
  CITIES: [
    { value: 'name', label: 'Name (A–Z)' },
    { value: '-name', label: 'Name (Z–A)' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'costIndex', label: 'Cost (Low–High)' },
    { value: '-costIndex', label: 'Cost (High–Low)' },
  ],
  ACTIVITIES: [
    { value: 'name', label: 'Name (A–Z)' },
    { value: 'estimatedCost', label: 'Cost (Low–High)' },
    { value: '-estimatedCost', label: 'Cost (High–Low)' },
    { value: 'rating', label: 'Rating' },
    { value: 'duration', label: 'Duration' },
  ],
  COMMUNITY: [
    { value: 'recent', label: 'Most Recent' },
    { value: 'likes', label: 'Most Liked' },
  ],
};

export const GROUP_BY_OPTIONS = {
  TRIPS: [
    { value: 'status', label: 'Status' },
    { value: 'month', label: 'Month' },
  ],
  CITIES: [
    { value: 'country', label: 'Country' },
    { value: 'region', label: 'Region' },
  ],
  ACTIVITIES: [
    { value: 'category', label: 'Category' },
    { value: 'city', label: 'City' },
  ],
};

export const COST_INDEX_LABELS = {
  1: 'Budget',
  2: 'Affordable',
  3: 'Moderate',
  4: 'Expensive',
  5: 'Luxury',
};

export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_LANGUAGE = 'en';
