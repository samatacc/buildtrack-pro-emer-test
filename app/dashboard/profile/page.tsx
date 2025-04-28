'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import ProfessionalInfo from '@/app/components/profile/ProfessionalInfo';
import CommunicationPreferences from '@/app/components/profile/CommunicationPreferences';
import MobileSettings from '@/app/components/profile/MobileSettings';
import DashboardCustomization from '@/app/components/profile/DashboardCustomization';
import ProfileAPI, { ProfileData } from '@/lib/api/profile-client';

/**
 * ProfilePage component
 * 
 * Main profile management page that brings together all profile components
 * in a mobile-first, responsive layout following BuildTrack Pro's design system.
 */
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Fetch profile data
  useEffect(() => {
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
    
    fetchProfile();
  }, [router, supabase.auth]);
  
  // Handle profile updates
  const handleProfileUpdate = async (sectionData: Partial<ProfileData>): Promise<void> => {
    if (!profile) return;
    
    try {
      const updatedProfile = await ProfileAPI.updateProfile(sectionData);
      setProfile({
        ...profile,
        ...updatedProfile,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };
  
  // Handle profile updates with return value for header component
  const handleProfileUpdateWithReturn = async (sectionData: Partial<ProfileData>): Promise<Partial<ProfileData>> => {
    if (!profile) return {};
    
    try {
      const updatedProfile = await ProfileAPI.updateProfile(sectionData);
      setProfile({
        ...profile,
        ...updatedProfile,
      });
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile with return:', err);
      throw err;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Failed to load profile data. Please try again.'}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-lg hover:bg-[rgb(19,49,84)]"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="sr-only">Profile Settings</h1>
      
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile} 
        onProfileUpdate={handleProfileUpdateWithReturn}
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
        <p>Changes to each section are saved automatically when you click Save.</p>
        <p className="mt-1">Last login: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}</p>
      </div>
    </div>
  );
}
