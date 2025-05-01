'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useHelpSystem } from '@/app/hooks/useHelpSystem';
import { HelpArticle as HelpArticleType } from '@/lib/services/helpService';
import HelpArticle from '@/app/components/help/HelpArticle';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ArticleDetailPage() {
  const { t } = useTranslations('help');
  const params = useParams();
  const router = useRouter();
  const { fetchArticleById, submitArticleFeedback } = useHelpSystem();
  const [article, setArticle] = useState<HelpArticleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const articleId = params?.id as string;
    
    if (!articleId) {
      router.push('/help');
      return;
    }

    async function loadArticle() {
      setIsLoading(true);
      const data = await fetchArticleById(articleId);
      if (data) {
        setArticle(data);
      } else {
        toast.error('Article not found');
        router.push('/help');
      }
      setIsLoading(false);
    }

    loadArticle();
  }, [params?.id, fetchArticleById, router]);

  const handleBack = () => {
    router.back();
  };

  const handleHelpfulVote = async (isHelpful: boolean) => {
    if (article) {
      await submitArticleFeedback(article.id, isHelpful);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-[rgb(24,62,105)] hover:text-[rgb(18,46,79)] dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {t('backToHelp') || 'Back to Help Center'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(24,62,105)]"></div>
          </div>
        ) : article ? (
          <HelpArticle 
            article={article}
            onBack={handleBack}
            onHelpfulVote={handleHelpfulVote}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('articleNotFound') || 'Article not found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
