'use client';

import React from 'react';

interface FormToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
  id?: string;
  containerClassName?: string;
}

/**
 * FormToggle component
 * 
 * A mobile-optimized toggle switch component following 
 * BuildTrack Pro's design system. Uses primary orange for 
 * the active state and provides proper touch targets for mobile.
 */
export default function FormToggle({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  id,
  containerClassName = '',
}: FormToggleProps) {
  // Generate an ID if not provided
  const toggleId = id || `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`flex items-start py-2 ${containerClassName}`}>
      <div className="flex items-center h-5">
        <button
          type="button"
          id={toggleId}
          aria-pressed={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`
            relative 
            inline-flex 
            h-6 
            w-11 
            flex-shrink-0 
            cursor-pointer 
            rounded-full 
            border-2 
            border-transparent 
            transition-colors 
            duration-300 
            ease-in-out 
            focus:outline-none 
            focus:ring-2 
            focus:ring-[rgb(24,62,105)] 
            focus:ring-offset-2
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${checked ? 'bg-[rgb(236,107,44)]' : 'bg-gray-300'}
          `}
          role="switch"
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden="true"
            className={`
              pointer-events-none 
              inline-block 
              h-5 
              w-5 
              transform 
              rounded-full 
              bg-white 
              shadow 
              ring-0 
              transition 
              duration-300 
              ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={toggleId} className="font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}
