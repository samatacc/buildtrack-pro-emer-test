'use client';

import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import FormToggle from './FormToggle';
import FormSelect from './FormSelect';
import { ProfileData } from '@/lib/api/profile-client';
import { useSafeTranslations } from '@/app/hooks/useSafeTranslations';
import { PROFILE_KEYS } from '@/app/constants/translationKeys';
// Inline ErrorBoundary component for build stability
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

interface MobileSettingsProps {
  profile: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => Promise<void>;
  className?: string;
}

/**
 * MobileSettings component
 * 
 * Allows users to configure mobile-specific settings for field usage
 * in construction environments with potentially limited connectivity.
 * Follows BuildTrack Pro's mobile-first approach and design system.
 */
function MobileSettings({ 
  profile, 
  onUpdate,
  className = '' 
}: MobileSettingsProps) {
  const { t } = useSafeTranslations('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [offlineAccess, setOfflineAccess] = useState(profile.offlineAccess || false);
  
  // Data usage preferences with defaults
  const defaultDataUsage = {
    autoDownload: false,
    highQualityImages: false,
    videoPlayback: 'wifi-only'
  };
  
  const [dataUsagePreferences, setDataUsagePreferences] = useState<any>(
    profile.dataUsagePreferences || defaultDataUsage
  );
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate({
        offlineAccess,
        dataUsagePreferences
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update mobile settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOfflineAccess(profile.offlineAccess || false);
    setDataUsagePreferences(profile.dataUsagePreferences || defaultDataUsage);
    setIsEditing(false);
  };

  // Video playback options
  const videoPlaybackOptions = [
    { value: 'wifi-only', label: 'WiFi Only' },
    { value: 'cellular', label: 'WiFi & Cellular' },
    { value: 'never', label: 'Never Auto-Play' }
  ];

  return (
    <ProfileCard
      title={t(PROFILE_KEYS.MOBILE_SETTINGS)}
      className={className}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      {isEditing ? (
        <div className="space-y-6">
          {/* Offline Access */}
          <div className="bg-gray-50 rounded-xl p-4">
            <FormToggle
              label="Enable Offline Access"
              description="Allow downloading of project data for offline use in the field"
              checked={offlineAccess}
              onChange={setOfflineAccess}
            />
          </div>
          
          {/* Data Usage Preferences */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Data Usage Preferences</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <FormToggle
                label="Auto-Download Project Files"
                description="Automatically download files for upcoming project visits (uses more data)"
                checked={dataUsagePreferences.autoDownload}
                onChange={(value) => setDataUsagePreferences({
                  ...dataUsagePreferences,
                  autoDownload: value
                })}
              />
              
              <FormToggle
                label="High-Quality Images"
                description="Always download high-resolution images (uses more data)"
                checked={dataUsagePreferences.highQualityImages}
                onChange={(value) => setDataUsagePreferences({
                  ...dataUsagePreferences,
                  highQualityImages: value
                })}
              />
              
              <div className="pt-2">
                <FormSelect
                  label="Video Playback"
                  options={videoPlaybackOptions}
                  value={dataUsagePreferences.videoPlayback}
                  onChange={(e) => setDataUsagePreferences({
                    ...dataUsagePreferences,
                    videoPlayback: e.target.value
                  })}
                  hint="Choose when videos should automatically play"
                />
              </div>
            </div>
          </div>
          
          {/* Device Management - Display Only */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Registered Devices</h4>
            <p className="text-sm text-gray-500 mb-2">
              Manage your registered devices for push notifications
            </p>
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <p className="text-gray-700">
                Device management is available through the mobile app
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Offline Access */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Offline Access</h4>
              <p className="text-sm text-gray-500">
                Download project data for offline use in the field
              </p>
            </div>
            <div className={`h-6 w-11 rounded-full p-1 ${
              offlineAccess ? 'bg-[rgb(236,107,44)]' : 'bg-gray-300'
            }`}>
              <div className={`h-4 w-4 rounded-full bg-white transform transition-transform duration-300 ${
                offlineAccess ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </div>
          
          {/* Data Usage Preferences */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Data Usage Preferences</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Auto-Download Project Files</p>
                  <p className="text-sm text-gray-500">
                    Automatically download files for upcoming project visits
                  </p>
                </div>
                <div className={`h-4 w-4 rounded-full ${
                  dataUsagePreferences.autoDownload ? 'bg-[rgb(236,107,44)]' : 'bg-gray-300'
                }`} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">High-Quality Images</p>
                  <p className="text-sm text-gray-500">
                    Always download high-resolution images
                  </p>
                </div>
                <div className={`h-4 w-4 rounded-full ${
                  dataUsagePreferences.highQualityImages ? 'bg-[rgb(236,107,44)]' : 'bg-gray-300'
                }`} />
              </div>
              
              <div className="flex items-center justify-between border-t pt-3 border-gray-200">
                <div>
                  <p className="font-medium text-gray-800">Video Playback</p>
                  <p className="text-sm text-gray-500">
                    When videos should automatically play
                  </p>
                </div>
                <div className="bg-white px-3 py-1 rounded-lg border border-gray-300 text-sm">
                  {videoPlaybackOptions.find(opt => opt.value === dataUsagePreferences.videoPlayback)?.label || 'WiFi Only'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Device Management */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Registered Devices</h4>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-gray-700">
                Device management is available through the mobile app
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Use the BuildTrack Pro app to manage your registered devices for push notifications
              </p>
            </div>
          </div>
        </div>
      )}
    </ProfileCard>
  );
}

// Wrap with ErrorBoundary to catch any translation or rendering issues
export default function SafeMobileSettings(props: MobileSettingsProps) {
  return (
    <ErrorBoundary>
      <MobileSettings {...props} />
    </ErrorBoundary>
  );
}
