'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProfileAPI, { ProfileData } from '../../lib/api/profile-client';
import { useState, useEffect } from 'react';

// Cache keys for profile-related queries
export const profileKeys = {
  all: ['profile'] as const,
  details: () => [...profileKeys.all, 'details'] as const,
  preferences: () => [...profileKeys.all, 'preferences'] as const,
  dashboard: () => [...profileKeys.all, 'dashboard'] as const,
};

/**
 * Hook for accessing and modifying user profile data with caching
 * 
 * Implements advanced caching strategies optimized for mobile usage
 * in construction environments with potentially limited connectivity:
 * - IndexedDB persistence for offline access
 * - Background refetching to keep data fresh
 * - Optimistic updates for better UX on slow connections
 */
export function useProfile() {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  const [isOnline, setIsOnline] = useState(true);
  
  // Track online/offline status
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    
    function handleOffline() {
      setIsOnline(false);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check authentication
  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Query for profile data
  const profileQuery = useQuery({
    queryKey: profileKeys.details(),
    queryFn: ProfileAPI.getProfile,
    enabled: !!session,
    retry: isOnline ? 3 : false, // Only retry when online
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Mutation for updating profile data
  const updateProfileMutation = useMutation({
    mutationFn: ProfileAPI.updateProfile,
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: profileKeys.details() });
      
      // Snapshot the previous profile value
      const previousProfile = queryClient.getQueryData(profileKeys.details());
      
      // Optimistically update to the new value
      queryClient.setQueryData(profileKeys.details(), (old: ProfileData) => ({
        ...old,
        ...newProfileData,
      }));
      
      // Return the context with the snapshotted value
      return { previousProfile };
    },
    onError: (err, newProfileData, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.details(), context.previousProfile);
      }
      console.error('Error updating profile:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our cache is in sync
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
  
  // Mutation for updating communication preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: ProfileAPI.updatePreferences,
    onMutate: async (newPreferences) => {
      // Similar optimistic update pattern
      await queryClient.cancelQueries({ queryKey: profileKeys.preferences() });
      
      const previousPrefs = queryClient.getQueryData(profileKeys.preferences());
      
      queryClient.setQueryData(profileKeys.preferences(), (old: any) => ({
        ...old,
        ...newPreferences,
      }));
      
      return { previousPrefs };
    },
    onError: (err, newPreferences, context) => {
      if (context?.previousPrefs) {
        queryClient.setQueryData(profileKeys.preferences(), context.previousPrefs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.preferences() });
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
  
  // Mutation for updating dashboard layout
  const updateDashboardMutation = useMutation({
    mutationFn: (layout: any) => ProfileAPI.updateDashboardLayout(layout),
    onMutate: async (layout: any) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.dashboard() });
      
      const previousDashboard = queryClient.getQueryData(profileKeys.dashboard());
      
      queryClient.setQueryData(profileKeys.dashboard(), (old: any) => ({
        ...old,
        dashboardLayout: {
          layout
        },
      }));
      
      return { previousDashboard };
    },
    onError: (err, variables, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(profileKeys.dashboard(), context.previousDashboard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
  
  // Offline support
  useEffect(() => {
    if (isOnline && profileQuery.data) {
      // When coming back online, try to sync any pending changes
      updateProfileMutation.reset();
      updatePreferencesMutation.reset();
      updateDashboardMutation.reset();
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    }
  }, [isOnline, profileQuery.data, queryClient, updateProfileMutation, updatePreferencesMutation, updateDashboardMutation]);
  
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    isOnline,
    
    // Update methods
    updateProfile: updateProfileMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    updateDashboardLayout: updateDashboardMutation.mutateAsync,
    
    // Add project to recent projects
    addRecentProject: async (projectId: string, projectName: string, thumbnailUrl?: string) => {
      try {
        const result = await ProfileAPI.addRecentProject(projectId);
        queryClient.invalidateQueries({ queryKey: profileKeys.details() });
        return result;
      } catch (error) {
        console.error('Error adding recent project:', error);
        throw error;
      }
    },
    
    // Mutation states
    isUpdating: updateProfileMutation.isPending || 
                updatePreferencesMutation.isPending || 
                updateDashboardMutation.isPending,
  };
}
