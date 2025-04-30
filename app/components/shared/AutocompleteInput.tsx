'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export interface AutocompleteOption {
  id: string;
  label: string;
  value: string;
  secondaryText?: string;
}

interface AutocompleteInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (option: AutocompleteOption) => void;
  placeholder?: string;
  className?: string;
  options: AutocompleteOption[];
  loading?: boolean;
  error?: string;
  required?: boolean;
  label?: string;
  icon?: React.ReactNode;
  showSuggestions?: boolean;
  setSuggestionVisibility?: (visible: boolean) => void;
}

export default function AutocompleteInput({
  id,
  name,
  value,
  onChange,
  onSelect,
  placeholder = '',
  className = '',
  options,
  loading = false,
  error,
  required = false,
  label,
  icon = <MapPin className="h-5 w-5 text-gray-400" />,
  showSuggestions = false,
  setSuggestionVisibility
}: AutocompleteInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle showing/hiding suggestions menu
  const displaySuggestions = isFocused || showSuggestions;
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return;
    
    // Arrow down - move highlight down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < options.length - 1 ? prev + 1 : prev
      );
    }
    
    // Arrow up - move highlight up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    }
    
    // Enter - select highlighted option
    else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      onSelect(options[highlightedIndex]);
    }
    
    // Escape - close suggestions
    else if (e.key === 'Escape') {
      inputRef.current?.blur();
      setIsFocused(false);
      setSuggestionVisibility?.(false);
    }
  };
  
  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && menuRef.current) {
      const highlightedElement = menuRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);
  
  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        menuRef.current && 
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setSuggestionVisibility?.(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSuggestionVisibility]);
  
  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [options]);
  
  // Toggle suggestions menu visibility
  const toggleSuggestions = () => {
    if (setSuggestionVisibility) {
      setSuggestionVisibility(!showSuggestions);
    } else {
      setIsFocused(!isFocused);
    }
    
    if (!isFocused) {
      inputRef.current?.focus();
    }
  };
  
  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Input with icon */}
        <div className="relative flex w-full">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={inputRef}
            type="text"
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className={`w-full ${
              icon ? 'pl-10' : 'pl-3'
            } pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
              error ? 'border-red-300' : 'border-gray-300'
            } ${className}`}
            placeholder={placeholder}
            autoComplete="off"
          />
          
          {/* Dropdown toggle button */}
          <button
            type="button"
            onClick={toggleSuggestions}
            className="absolute inset-y-0 right-0 flex items-center pr-2"
          >
            {displaySuggestions ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Error message */}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        
        {/* Suggestions dropdown */}
        {displaySuggestions && (
          <div 
            ref={menuRef}
            className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
          >
            {loading ? (
              <div className="flex justify-center items-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[rgb(24,62,105)]"></div>
                <span className="ml-2 text-gray-600">Loading suggestions...</span>
              </div>
            ) : options.length > 0 ? (
              options.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => onSelect(option)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                    index === highlightedIndex
                      ? 'bg-[rgb(24,62,105)] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium truncate">{option.label}</span>
                    {option.secondaryText && (
                      <span 
                        className={`text-sm truncate ${
                          index === highlightedIndex ? 'text-gray-200' : 'text-gray-500'
                        }`}
                      >
                        {option.secondaryText}
                      </span>
                    )}
                  </div>
                  
                  {/* Selected indicator */}
                  {value === option.value && (
                    <span
                      className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                        index === highlightedIndex ? 'text-white' : 'text-[rgb(24,62,105)]'
                      }`}
                    >
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No suggestions found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
