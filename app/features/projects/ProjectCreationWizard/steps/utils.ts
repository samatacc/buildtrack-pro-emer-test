import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind utility for class name merging
 * Follows BuildTrack Pro design system
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * BuildTrack Pro color palette constants
 */
export const colors = {
  primaryBlue: 'rgb(24,62,105)',
  primaryOrange: 'rgb(236,107,44)',
  lightGray: '#f8f9fa',
  borderColor: '#e9ecef',
  textDark: '#343a40',
  textLight: '#6c757d'
};
