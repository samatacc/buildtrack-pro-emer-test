'use client';

import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  touched?: boolean;
  containerClassName?: string;
}

/**
 * FormInput component
 * 
 * A responsive, mobile-optimized input component following 
 * BuildTrack Pro's design system. Features larger touch targets
 * for mobile users and proper error/hint display.
 */
export default function FormInput({
  label,
  error,
  hint,
  touched = false,
  containerClassName = '',
  className = '',
  id,
  ...props
}: FormInputProps) {
  // Generate an ID if not provided
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Determine if we should show an error
  const showError = !!error && touched;
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      
      <input
        id={inputId}
        className={`
          w-full
          px-4
          py-3
          bg-white
          border
          rounded-2xl
          shadow-sm
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
      />
      
      {showError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {hint && !showError && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}
