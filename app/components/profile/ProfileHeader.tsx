'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProfileAPI, ProfileData } from '@/lib/api/profile-client';

interface ProfileHeaderProps {
  profile: ProfileData;
  className?: string;
  onProfileUpdate?: (updatedProfile: Partial<ProfileData>) => void;
}

/**
 * ProfileHeader component
 * 
 * Displays the user's profile header with avatar, name, and key information.
 * Implements light neumorphism for the card and glassmorphism for overlays
 * following BuildTrack Pro's design system.
 */
export default function ProfileHeader({ 
  profile, 
  className = '',
  onProfileUpdate 
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [jobTitle, setJobTitle] = useState(profile.jobTitle || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onProfileUpdate) return;
    
    setIsSaving(true);
    try {
      const updatedData = {
        firstName,
        lastName,
        jobTitle,
        department
      };
      
      onProfileUpdate(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(profile.firstName || '');
    setLastName(profile.lastName || '');
    setJobTitle(profile.jobTitle || '');
    setDepartment(profile.department || '');
    setIsEditing(false);
  };

  return (
    <div className={`
      relative 
      bg-white 
      rounded-2xl 
      overflow-hidden 
      shadow-[0_10px_20px_rgba(17,17,26,0.05),_0_6px_6px_rgba(17,17,26,0.03)] 
      mb-8
      ${className}
    `}>
      {/* Header background with primary blue color */}
      <div className="h-32 bg-[rgb(24,62,105)]" />
      
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row -mt-16 items-center sm:items-end">
          {/* Profile avatar with border */}
          <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                sizes="100%"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-[rgb(24,62,105)] text-white text-3xl font-semibold">
                {profile.firstName?.charAt(0) || ''}{profile.lastName?.charAt(0) || ''}
              </div>
            )}
          </div>
          
          {/* Profile info with edit button */}
          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                    placeholder="Last Name"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                    placeholder="Job Title"
                  />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                    placeholder="Department"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-3">
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-[rgb(236,107,44)] text-white rounded-lg hover:bg-[rgb(226,97,34)] disabled:opacity-70"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {(profile.jobTitle || profile.department) && (
                      <div className="mt-1 text-gray-600">
                        {profile.jobTitle}
                        {profile.jobTitle && profile.department && ' · '}
                        {profile.department}
                      </div>
                    )}
                    <div className="mt-1 text-gray-500 text-sm">
                      {profile.email}
                      {profile.organization && (
                        <span> · {profile.organization.name}</span>
                      )}
                    </div>
                  </div>
                  {onProfileUpdate && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
