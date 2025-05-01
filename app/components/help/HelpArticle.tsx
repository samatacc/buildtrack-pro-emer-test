import React, { useState } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { 
  ArrowLeftIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  PrinterIcon,
  EnvelopeIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { HelpArticle as HelpArticleType } from './HelpCenter';
import { toast } from 'react-hot-toast';

interface HelpArticleProps {
  article: HelpArticleType;
  onBack: () => void;
  onHelpfulVote: (isHelpful: boolean) => void;
}

const HelpArticle: React.FC<HelpArticleProps> = ({ 
  article, 
  onBack,
  onHelpfulVote
}) => {
  const { t } = useTranslations('help');
  const [hasVoted, setHasVoted] = useState(false);
  
  // Format date to human-readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Handle printing the article
  const handlePrint = () => {
    window.print();
  };
  
  // Handle emailing the article
  const handleEmailArticle = () => {
    const subject = encodeURIComponent(`BuildTrack Pro Help: ${article.title}`);
    const body = encodeURIComponent(`Check out this helpful article from BuildTrack Pro:\n\n${article.title}\n\nAccess it in your BuildTrack Pro account.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  // Handle helpful vote
  const handleHelpfulVote = (isHelpful: boolean) => {
    if (!hasVoted) {
      setHasVoted(true);
      onHelpfulVote(isHelpful);
    } else {
      toast.error('You have already provided feedback for this article');
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-[rgb(24,62,105)] hover:text-[rgb(18,46,79)] dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {t('backToResults') || 'Back to all articles'}
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[rgb(24,62,105)] dark:text-white mb-4">
          {article.title}
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {formatDate(article.lastUpdated)}
        </div>
      </div>
      
      <div 
        className="prose prose-blue dark:prose-invert max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('wasThisHelpful') || 'Was this article helpful?'}
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => handleHelpfulVote(true)}
              className={`inline-flex items-center px-3 py-1 border rounded-md text-sm ${
                hasVoted 
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              disabled={hasVoted}
            >
              <HandThumbUpIcon className="h-4 w-4 mr-1" />
              Yes ({article.helpfulness.helpful})
            </button>
            <button
              onClick={() => handleHelpfulVote(false)}
              className={`inline-flex items-center px-3 py-1 border rounded-md text-sm ${
                hasVoted 
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              disabled={hasVoted}
            >
              <HandThumbDownIcon className="h-4 w-4 mr-1" />
              No ({article.helpfulness.notHelpful})
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Print article"
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </button>
          <button
            onClick={handleEmailArticle}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Email article"
          >
            <EnvelopeIcon className="h-4 w-4 mr-1" />
            Email
          </button>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {t('relatedArticles') || 'Related Articles'}
        </h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-[rgb(24,62,105)] hover:underline dark:text-blue-400">
              Dashboard Widgets Overview
            </a>
          </li>
          <li>
            <a href="#" className="text-[rgb(24,62,105)] hover:underline dark:text-blue-400">
              Setting Up Team Permissions
            </a>
          </li>
          <li>
            <a href="#" className="text-[rgb(24,62,105)] hover:underline dark:text-blue-400">
              Project Timeline Customization
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HelpArticle;
