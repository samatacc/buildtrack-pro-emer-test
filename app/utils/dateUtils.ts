/**
 * Date utility functions for BuildTrack Pro
 */

import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date using date-fns format
 * @param date Date object or ISO string
 * @param formatString Format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | null | undefined,
  formatString: string = 'yyyy-MM-dd'
): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Get number of days between two dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days
 */
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const differenceInTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns True if date is in the past
 */
export const isDateInPast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
};

/**
 * Check if a date is today
 * @param date Date to check
 * @returns True if date is today
 */
export const isDateToday = (date: Date): boolean => {
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Format a date relative to today (today, yesterday, tomorrow, or formatted date)
 * @param date Date to format
 * @param formatString Format string for dates not today/yesterday/tomorrow
 * @returns Formatted date string
 */
export const formatRelativeDate = (
  date: Date,
  formatString: string = 'MMM d, yyyy'
): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (compareDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else if (compareDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return formatDate(date, formatString);
  }
};
