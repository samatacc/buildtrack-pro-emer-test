'use client';

import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import FormSelect from './FormSelect';
import FormToggle from './FormToggle';
import { ProfileData } from '@/lib/api/profile-client';
import { useSafeTranslations } from '@/app/hooks/useSafeTranslations';
import { PROFILE_KEYS } from '@/app/constants/translationKeys';
import ErrorBoundary from '../ErrorBoundary';
import LanguagePreference from './LanguagePreference';

interface CommunicationPreferencesProps {
  profile: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => Promise<void>;
  className?: string;
}

/**
 * CommunicationPreferences component
 * 
 * Allows users to manage their communication preferences with a mobile-optimized 
 * interface. Includes preferred contact method, language, timezone, and 
 * notification settings following BuildTrack Pro's design system.
 */
function CommunicationPreferences({ 
  profile, 
  onUpdate,
  className = '' 
}: CommunicationPreferencesProps) {
  const { t } = useSafeTranslations('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [preferredContactMethod, setPreferredContactMethod] = useState(
    profile.preferredContactMethod || 'email'
  );
  const [language, setLanguage] = useState(profile.language || 'en');
  const [timezone, setTimezone] = useState(profile.timezone || 'UTC');
  
  // Extract notification settings from preferences or use defaults
  const defaultNotificationSettings = {
    dailyDigest: true,
    projectUpdates: true,
    taskAssignments: true,
    mentions: true,
    deadlines: true
  };
  
  const [notificationSettings, setNotificationSettings] = useState(
    profile.preferences?.notificationSettings || defaultNotificationSettings
  );
  
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleNotification = (key: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Current preferences structure
      const currentPreferences = profile.preferences || {};
      
      // Prepare data with updated preferences
      const data: Partial<ProfileData> = {
        preferredContactMethod,
        language,
        timezone,
        preferences: {
          ...currentPreferences,
          notificationSettings
        }
      };
      
      await onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update communication preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPreferredContactMethod(profile.preferredContactMethod || 'email');
    setLanguage(profile.language || 'en');
    setTimezone(profile.timezone || 'UTC');
    setNotificationSettings(
      profile.preferences?.notificationSettings || defaultNotificationSettings
    );
    setIsEditing(false);
  };

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ar', label: 'Arabic' }
  ];

  // Contact method options
  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'app', label: 'In-App' }
  ];

  // Common timezone options
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  // Notification types with human-readable labels
  const notificationTypes = [
    { key: 'dailyDigest', label: 'Daily summary digest', description: 'Receive a daily summary of all activities' },
    { key: 'projectUpdates', label: 'Project updates', description: 'Get notified when projects are updated' },
    { key: 'taskAssignments', label: 'Task assignments', description: 'Get notified when tasks are assigned to you' },
  ];

  return (
    <ProfileCard
      title={t(PROFILE_KEYS.COMMUNICATION_PREFS)}
      className={className}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      {isEditing ? (
        <div className="space-y-6">
          {/* Contact Method, Language, and Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              label={t('preferredContactMethod')}
              options={contactMethodOptions}
              value={preferredContactMethod}
              onChange={(e) => setPreferredContactMethod(e.target.value)}
            />
            
            <FormSelect
              label={t('language')}
              options={languageOptions}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
            
            <FormSelect
              label={t('timezone')}
              options={timezoneOptions}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
          
          {/* Enhanced Language Preference UI */}
          <LanguagePreference />
          
          {/* Notification Settings */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">{t('notificationSettings')}</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {notificationTypes.map((type) => (
                <FormToggle
                  key={type.key}
                  label={type.label}
                  description={type.description}
                  checked={!!notificationSettings[type.key as keyof typeof notificationSettings]}
                  onChange={(checked) => handleToggleNotification(type.key, checked)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Contact Method, Language, and Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">{t(PROFILE_KEYS.PREFERRED_CONTACT_METHOD)}</h4>
              <p className="mt-1 text-lg">
                {contactMethodOptions.find(opt => opt.value === preferredContactMethod)?.label || 'Email'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">{t(PROFILE_KEYS.LANGUAGE)}</h4>
              <p className="mt-1 text-lg">
                {languageOptions.find(opt => opt.value === language)?.label || 'English'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">{t(PROFILE_KEYS.TIMEZONE)}</h4>
              <p className="mt-1 text-lg">
                {timezoneOptions.find(opt => opt.value === timezone)?.label || 'UTC'}
              </p>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h4>
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center">
                  <div className={`h-4 w-4 rounded-full mr-3 ${
                    notificationSettings[type.key as keyof typeof notificationSettings] 
                      ? 'bg-[rgb(236,107,44)]' 
                      : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800">{type.label}</p>
                    <p className="text-sm text-gray-500">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ProfileCard>
  );
}

// Wrap with ErrorBoundary to catch any translation or rendering issues
export default function SafeCommunicationPreferences(props: CommunicationPreferencesProps) {
  return (
    <ErrorBoundary>
      <CommunicationPreferences {...props} />
    </ErrorBoundary>
  );
}
