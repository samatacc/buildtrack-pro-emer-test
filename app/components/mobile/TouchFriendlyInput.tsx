'use client';

import { useState, useEffect, useRef } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * TouchFriendlyInput Component
 * 
 * A specialized input component designed for construction workers in the field:
 * - Large touch targets suitable for use with gloves
 * - Haptic feedback (where supported)
 * - Numeric stepper for easy increment/decrement
 * - High contrast for outdoor visibility
 * - Gesture controls for faster input
 * 
 * Follows BuildTrack Pro's design principles:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Mobile-first responsive design
 * - Accessibility compliance
 */

interface TouchFriendlyInputProps {
  id?: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'quantity';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
  unit?: string;
}

export default function TouchFriendlyInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  min,
  max,
  step = 1,
  placeholder,
  required = false,
  className = '',
  readOnly = false,
  unit
}: TouchFriendlyInputProps) {
  const { t } = useNamespacedTranslations('mobile');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [startValue, setStartValue] = useState<number | null>(null);
  
  // Provide haptic feedback if supported
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // 50ms vibration
    }
  };
  
  // Handle increment/decrement for numeric inputs
  const handleIncrement = () => {
    if (type === 'number' || type === 'quantity') {
      const currentValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      const newValue = currentValue + step;
      
      if (max !== undefined && newValue > max) return;
      
      onChange(newValue);
      triggerHapticFeedback();
    }
  };
  
  const handleDecrement = () => {
    if (type === 'number' || type === 'quantity') {
      const currentValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      const newValue = currentValue - step;
      
      if (min !== undefined && newValue < min) return;
      
      onChange(newValue);
      triggerHapticFeedback();
    }
  };
  
  // Handle touch-based slide control for number inputs
  const handleTouchStart = (e: React.TouchEvent) => {
    if (type === 'number' || type === 'quantity') {
      setTouchStartX(e.touches[0].clientX);
      setStartValue(typeof value === 'string' ? parseFloat(value) || 0 : value as number);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if ((type === 'number' || type === 'quantity') && touchStartX !== null && startValue !== null) {
      const touchDelta = e.touches[0].clientX - touchStartX;
      
      // Adjust sensitivity based on step size
      const sensitivity = step < 1 ? 10 : 5; 
      const valueDelta = Math.floor(touchDelta / sensitivity) * step;
      
      let newValue = startValue + valueDelta;
      
      // Enforce min/max constraints
      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;
      
      // Only update if value has changed
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };
  
  const handleTouchEnd = () => {
    setTouchStartX(null);
    setStartValue(null);
    triggerHapticFeedback();
  };
  
  // Double tap to focus
  const lastTapRef = useRef<number>(0);
  
  const handleDoubleTap = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // It's a double tap
      if (inputRef.current) {
        inputRef.current.focus();
        e.preventDefault(); // Prevent zoom on double tap
      }
    }
    
    lastTapRef.current = now;
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-lg font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div 
        className={`relative rounded-lg border-2 ${
          isFocused 
            ? 'border-[rgb(236,107,44)] shadow-lg' 
            : 'border-gray-300'
        } ${readOnly ? 'bg-gray-100' : 'bg-white'}`}
      >
        {/* Input field */}
        <div className="flex items-center">
          {/* Decrement button for numeric inputs */}
          {(type === 'number' || type === 'quantity') && !readOnly && (
            <button
              type="button"
              className="p-4 text-2xl text-gray-600 hover:text-[rgb(24,62,105)] focus:outline-none"
              onClick={handleDecrement}
              aria-label={t('decrement')}
            >
              <span className="block w-8 h-8 flex items-center justify-center">−</span>
            </button>
          )}
          
          {/* Main input */}
          <div 
            className="flex-1 relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <input
              ref={inputRef}
              id={id}
              type={type === 'quantity' ? 'number' : type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              required={required}
              readOnly={readOnly}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onTouchStart={handleDoubleTap}
              className={`
                block w-full py-4 px-3 text-xl bg-transparent
                appearance-none focus:outline-none
                ${unit ? 'pr-12' : ''}
              `}
            />
            
            {/* Unit indicator */}
            {unit && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-lg">{unit}</span>
              </div>
            )}
          </div>
          
          {/* Increment button for numeric inputs */}
          {(type === 'number' || type === 'quantity') && !readOnly && (
            <button
              type="button"
              className="p-4 text-2xl text-gray-600 hover:text-[rgb(24,62,105)] focus:outline-none"
              onClick={handleIncrement}
              aria-label={t('increment')}
            >
              <span className="block w-8 h-8 flex items-center justify-center">+</span>
            </button>
          )}
        </div>
        
        {/* Touch instructions indicator */}
        {(type === 'number' || type === 'quantity') && !readOnly && (
          <div className="text-xs text-gray-500 px-3 pb-1 text-center">
            <span>{t('swipeControls')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
