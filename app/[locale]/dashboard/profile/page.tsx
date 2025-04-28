'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProfileHeader from '../../../components/profile/ProfileHeader';
import ProfessionalInfo from '../../../components/profile/ProfessionalInfo';
import CommunicationPreferences from '../../../components/profile/CommunicationPreferences';
import MobileSettings from '../../../components/profile/MobileSettings';
import DashboardCustomization from '../../../components/profile/DashboardCustomization';
import ConnectionStatus from '../../../components/shared/ConnectionStatus';
import { useTranslations } from '../../../hooks/useTranslations';
import { useProfile } from '../../../hooks/useProfile';
import ProfileAPI, { ProfileData } from '../../../lib/api/profile-client';

/**
 * ProfilePage component
 * 
 * Main profile management page that brings together all profile components
 * in a mobile-first, responsive layout following BuildTrack Pro's design system.
 * 
 * Integrates internationalization support with language preferences and mobile
 * optimization for construction professionals working in the field.
 * 
 * Follows BuildTrack Pro's design system with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)) with light neumorphism and glassmorphism effects.
 */
export default function ProfilePage() {
  // Use our custom profile hook with caching for better performance in field environments
  const { profile: cachedProfile, isLoading, isError, error: profileError, updateProfile } = useProfile();
  
  // Use translations with the profile namespace
  const { t } = useTranslations('profile');
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Fetch profile data using React Query via our useProfile hook
  useEffect(() => {
    // If we already have the profile from our cached React Query hook, use it
    if (cachedProfile && !isLoading) {
      setProfile(cachedProfile);
      setLoading(false);
      return;
    }
    
    // Fallback to direct API call if React Query cache is not available
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }
        
        const profileData = await ProfileAPI.getProfile();
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isLoading) {
      // Wait for React Query to finish loading
      return;
    } else if (isError) {
      // If React Query error, try direct API
      fetchProfile();
    }
  }, [cachedProfile, isLoading, isError, router, supabase.auth]);
  
  // Handle profile updates using our React Query mutation
  const handleProfileUpdate = async (sectionData: Partial<ProfileData>): Promise<void> => {
    if (!profile) return;
    
    try {
      // Use the React Query mutation for better caching and offline support
      const updatedProfile = await updateProfile(sectionData);
      
      // Update local state as well
      setProfile({
        ...profile,
        ...updatedProfile
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };
  
  // Loading state with BuildTrack Pro's design system
  if (loading || isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full mb-4 shadow-md"></div>
          <div className="h-6 w-48 bg-gray-200 rounded-xl mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-xl"></div>
          <div className="mt-8 text-[rgb(24,62,105)] font-medium">{t('loading')}</div>
        </div>
      </div>
    );
  }
  
  // Error state with internationalization
  if ((error || isError) || !profile) {
    const errorMessage = error || isError ? (profileError?.message || t('errorUpdating')) : t('profileNotFound');
    
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-xl hover:bg-[rgb(19,49,84)] transition-colors shadow-md"
        >
          {t('retry')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto relative">
      <h1 className="sr-only">{t('title')}</h1>
      
      {/* Connection Status Indicator */}
      <ConnectionStatus />
      
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile} 
        onProfileUpdate={handleProfileUpdate}
      />
      
      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <ProfessionalInfo 
            profile={profile} 
            onUpdate={handleProfileUpdate}
          />
          
          <CommunicationPreferences 
            profile={profile} 
            onUpdate={handleProfileUpdate}
          />
        </div>
        
        {/* Right Column */}
        <div>
          <MobileSettings 
            profile={profile} 
            onUpdate={handleProfileUpdate}
          />
          
          <DashboardCustomization 
            profile={profile} 
            onUpdate={handleProfileUpdate}
          />
        </div>
      </div>
      
      {/* Footer with save status */}
      <div className="mt-8 py-4 text-center text-sm text-gray-500">
        <p>{t('saveChangesAutomatically')}</p>
        <p className="mt-1">{t('lastLogin')}: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : t('never')}</p>
      </div>
    </div>
  );
}
