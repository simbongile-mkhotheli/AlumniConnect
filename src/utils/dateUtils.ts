/**
 * Date utility functions for formatting and manipulation
 */

/**
 * Format a date string or Date object into a readable format
 * @param date - Date string, Date object, or timestamp
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | number,
  options: {
    format?:
      | 'short'
      | 'medium'
      | 'long'
      | 'full'
      | 'time'
      | 'datetime'
      | 'relative';
    locale?: string;
    timeZone?: string;
  } = {}
): string {
  const { format = 'medium', locale = 'en-US', timeZone } = options;

  if (!date) return 'N/A';

  let dateObj: Date;

  try {
    dateObj = new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  } catch (error) {
    return 'Invalid Date';
  }

  const formatOptions: Intl.DateTimeFormatOptions = { timeZone };

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'medium':
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'long':
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'full':
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

    case 'time':
      return dateObj.toLocaleTimeString(locale, {
        ...formatOptions,
        hour: 'numeric',
        minute: '2-digit',
      });

    case 'datetime':
      return dateObj.toLocaleString(locale, {
        ...formatOptions,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

    case 'relative':
      return formatRelativeDate(dateObj);

    default:
      return dateObj.toLocaleDateString(locale, formatOptions);
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  if (diffInSeconds === 0) return 'just now';

  const isPast = diffInSeconds > 0;
  const absDiff = Math.abs(diffInSeconds);

  for (const interval of intervals) {
    const count = Math.floor(absDiff / interval.seconds);
    if (count >= 1) {
      const unit = count === 1 ? interval.label : `${interval.label}s`;
      return isPast ? `${count} ${unit} ago` : `in ${count} ${unit}`;
    }
  }

  return 'just now';
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if the date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = new Date(date);
  const today = new Date();

  return dateObj.toDateString() === today.toDateString();
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if the date is in the past
 */
export function isPast(date: Date | string): boolean {
  const dateObj = new Date(date);
  const now = new Date();

  return dateObj.getTime() < now.getTime();
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if the date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = new Date(date);
  const now = new Date();

  return dateObj.getTime() > now.getTime();
}

/**
 * Get the start of day for a given date
 * @param date - Date to get start of day for
 * @returns Date object set to start of day
 */
export function startOfDay(date: Date | string): Date {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

/**
 * Get the end of day for a given date
 * @param date - Date to get end of day for
 * @returns Date object set to end of day
 */
export function endOfDay(date: Date | string): Date {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
}

/**
 * Get the difference between two dates in days
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between the dates
 */
export function daysBetween(
  date1: Date | string,
  date2: Date | string
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
