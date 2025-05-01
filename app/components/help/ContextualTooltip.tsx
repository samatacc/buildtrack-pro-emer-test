import React, { useState } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/app/hooks/useTranslations';

interface ContextualTooltipProps {
  title: string;
  content: string | React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  width?: string;
  className?: string;
}

const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  title,
  content,
  position = 'top',
  width = 'w-64',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslations('help');
  
  // Calculate tooltip position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2'
  };
  
  // Calculate arrow position classes
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700 border-t-transparent border-b-transparent border-r-transparent'
  };
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      <button 
        type="button"
        className="text-gray-500 hover:text-[rgb(24,62,105)] dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
        aria-label={title ? `Help: ${title}` : 'Help information'}
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} ${width}`}>
          <div className="bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-lg overflow-hidden">
            {title && (
              <div className="px-4 py-2 bg-gray-900 dark:bg-gray-800 font-medium">
                {title}
              </div>
            )}
            <div className="px-4 py-3 text-sm">
              {content}
            </div>
            <div className={`absolute h-0 w-0 border-4 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextualTooltip;
