import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ContextualTooltip from './ContextualTooltip';

interface InlineHelpProps {
  title: string;
  content: string | React.ReactNode;
  articleId?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/**
 * A reusable inline help component that can be placed throughout the application
 * to provide contextual help to users.
 */
const InlineHelp: React.FC<InlineHelpProps> = ({
  title,
  content,
  articleId,
  position = 'top',
  className = ''
}) => {
  // Render additional "View full article" link when an articleId is provided
  const tooltipContent = (
    <>
      <div>{content}</div>
      {articleId && (
        <div className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-600">
          <Link 
            href={`/help/article/${articleId}`}
            className="text-blue-300 hover:text-blue-200 hover:underline text-sm flex items-center"
          >
            View full article
            <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <ContextualTooltip
      title={title}
      content={tooltipContent}
      position={position}
      className={className}
    />
  );
};

export default InlineHelp;
