import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { helpService, HelpArticle, SupportTicket } from '@/lib/services/helpService';
import toast from 'react-hot-toast';

/**
 * Custom hook for accessing help and support functionality
 */
export function useHelpSystem() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch help articles
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await helpService.getHelpArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching help articles:', error);
      toast.error('Failed to load help articles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single help article by ID
  const fetchArticleById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      return await helpService.getHelpArticleById(id);
    } catch (error) {
      console.error('Error fetching help article:', error);
      toast.error('Failed to load help article');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search help articles
  const searchArticles = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const results = await helpService.searchHelpArticles(query);
      return results;
    } catch (error) {
      console.error('Error searching help articles:', error);
      toast.error('Search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit article feedback
  const submitArticleFeedback = useCallback(async (articleId: string, isHelpful: boolean) => {
    try {
      await helpService.updateArticleHelpfulness(articleId, isHelpful);
      toast.success('Thank you for your feedback!');
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
      return false;
    }
  }, []);

  // Fetch user's support tickets
  const fetchUserTickets = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const tickets = await helpService.getUserTickets(user.id);
      setUserTickets(tickets);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      toast.error('Failed to load your support tickets');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Create a new support ticket
  const createSupportTicket = useCallback(async (
    subject: string,
    description: string,
    category: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a support ticket');
      return null;
    }

    setIsLoading(true);
    try {
      const newTicket = await helpService.createSupportTicket(
        user.id,
        subject,
        description,
        category,
        priority
      );

      if (newTicket) {
        setUserTickets(prev => [newTicket, ...prev]);
        return newTicket;
      }
      return null;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast.error('Failed to create support ticket');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load initial data
  useEffect(() => {
    fetchArticles();
    if (user?.id) {
      fetchUserTickets();
    }
  }, [fetchArticles, fetchUserTickets, user?.id]);

  return {
    articles,
    userTickets,
    isLoading,
    fetchArticles,
    fetchArticleById,
    searchArticles,
    submitArticleFeedback,
    fetchUserTickets,
    createSupportTicket
  };
}
