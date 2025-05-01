'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useHelpSystem } from '@/app/hooks/useHelpSystem';
import { HelpArticle as HelpArticleType } from '@/lib/services/helpService';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const HelpArticle = dynamic(() => import('@/app/components/help/HelpArticle'), {
  loading: () => <div className="animate-pulse">Loading article...</div>,
  ssr: true
});

export default function ArticleDetailPage() {
  const { t } = useTranslations('help');
  const params = useParams();
  const router = useRouter();
  const { fetchArticleById, submitArticleFeedback } = useHelpSystem();
  const [article, setArticle] = useState<HelpArticleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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
      setIsSubmittingFeedback(true);
      await submitArticleFeedback(article.id, isHelpful);
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={handleBack}
        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        {t('back')}
      </button>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded-md w-full mt-6"></div>
        </div>
      ) : article ? (
        <Suspense fallback={<div className="animate-pulse">Loading article content...</div>}>
          <HelpArticle 
            article={article} 
            onBack={handleBack} 
            onHelpfulVote={handleHelpfulVote}
          />
        </Suspense>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('article_not_found') || 'Article not found'}</h2>
          <p className="text-gray-600 mb-6">{t('article_not_found_desc') || 'The help article you are looking for could not be found.'}</p>
          <button 
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('back_to_help_center') || 'Back to Help Center'}
          </button>
        </div>
      )}
    </div>
  );
}
