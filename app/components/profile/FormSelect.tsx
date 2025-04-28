'use client';

import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  touched?: boolean;
  containerClassName?: string;
}

/**
 * FormSelect component
 * 
 * A responsive, mobile-optimized select component following 
 * BuildTrack Pro's design system. Features larger touch targets
 * for mobile users and proper error/hint display.
 */
export default function FormSelect({
  label,
  options,
  error,
  hint,
  touched = false,
  containerClassName = '',
  className = '',
  id,
  ...props
}: FormSelectProps) {
  // Generate an ID if not provided
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Determine if we should show an error
  const showError = !!error && touched;
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label 
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full
            px-4
            py-3
            bg-white
            border
            rounded-2xl
            shadow-sm
            appearance-none
            focus:outline-none
            focus:ring-2
            focus:ring-[rgb(24,62,105)]
            focus:border-transparent
            transition-all
            duration-200
            ${showError 
              ? 'border-red-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {showError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {hint && !showError && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}
