'use client';

import React, { ReactNode } from 'react';

interface ProfileCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

/**
 * ProfileCard component
 * 
 * A container component that applies BuildTrack Pro's design system
 * with light neumorphism for subtle depth and the primary color scheme.
 * Fully responsive for mobile-first design.
 */
export default function ProfileCard({
  title,
  children,
  className = '',
  isEditing = false,
  onEdit,
  onSave,
  onCancel
}: ProfileCardProps) {
  return (
    <div className={`
      bg-white 
      rounded-2xl 
      overflow-hidden 
      shadow-[0_4px_16px_rgba(17,17,26,0.08),_0_8px_24px_rgba(17,17,26,0.04)] 
      transition-all 
      duration-300 
      hover:shadow-[0_4px_16px_rgba(17,17,26,0.1),_0_8px_24px_rgba(17,17,26,0.05)] 
      mb-6 
      ${className}
    `}>
      <div className="bg-[rgb(24,62,105)] px-4 py-3 flex justify-between items-center">
        <h3 className="text-white font-medium text-lg">{title}</h3>
        <div>
          {!isEditing && onEdit && (
            <button 
              onClick={onEdit} 
              className="text-white text-sm px-3 py-1 rounded-lg border border-white/30 
                hover:bg-white/10 transition-colors duration-200"
            >
              Edit
            </button>
          )}
          {isEditing && (
            <div className="flex space-x-2">
              {onCancel && (
                <button 
                  onClick={onCancel} 
                  className="text-white text-sm px-3 py-1 rounded-lg border border-white/30 
                    hover:bg-white/10 transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
              {onSave && (
                <button 
                  onClick={onSave} 
                  className="bg-[rgb(236,107,44)] text-white text-sm px-3 py-1 rounded-lg 
                    hover:bg-[rgb(226,97,34)] transition-colors duration-200"
                >
                  Save
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
