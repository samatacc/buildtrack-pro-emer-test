'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * FeatureToggles Component
 * 
 * Admin component for managing feature flags with internationalized descriptions.
 * Follows BuildTrack Pro's design principles with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)).
 * 
 * Features:
 * - Enable/disable features across the platform
 * - Set percentage rollouts for gradual feature deployment
 * - Configure role-based feature access
 * - Fully internationalized feature descriptions
 */
interface Feature {
  id: string;
  name: string;
  descriptionKey: string; // Translation key for feature description
  enabled: boolean;
  rolloutPercentage: number;
  restrictedToRoles: string[];
  category: 'core' | 'beta' | 'experimental';
  lastUpdated: string;
}

interface FeatureTogglesProps {
  className?: string;
}

export default function FeatureToggles({
  className = '',
}: FeatureTogglesProps) {
  const { t, metrics } = useNamespacedTranslations('admin');
  const [isLoading, setIsLoading] = useState(true);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  
  // Load features data
  useEffect(() => {
    // Mock data
    const mockFeatures: Feature[] = [
      {
        id: 'materials-tracking',
        name: 'Materials Tracking',
        descriptionKey: 'features.materialsTracking',
        enabled: true,
        rolloutPercentage: 100,
        restrictedToRoles: [],
        category: 'core',
        lastUpdated: '2025-04-20T10:15:00'
      },
      {
        id: 'ai-scheduling',
        name: 'AI Scheduling Assistant',
        descriptionKey: 'features.aiScheduling',
        enabled: true,
        rolloutPercentage: 50,
        restrictedToRoles: ['admin', 'manager'],
        category: 'beta',
        lastUpdated: '2025-04-25T14:30:00'
      },
      {
        id: 'weather-integration',
        name: 'Weather Integration',
        descriptionKey: 'features.weatherIntegration',
        enabled: true,
        rolloutPercentage: 100,
        restrictedToRoles: [],
        category: 'core',
        lastUpdated: '2025-04-10T09:20:00'
      },
      {
        id: 'ar-measurements',
        name: 'AR Measurements',
        descriptionKey: 'features.arMeasurements',
        enabled: false,
        rolloutPercentage: 0,
        restrictedToRoles: ['admin'],
        category: 'experimental',
        lastUpdated: '2025-04-15T11:45:00'
      },
      {
        id: 'budget-forecasting',
        name: 'Budget Forecasting',
        descriptionKey: 'features.budgetForecasting',
        enabled: true,
        rolloutPercentage: 100,
        restrictedToRoles: ['admin', 'manager'],
        category: 'core',
        lastUpdated: '2025-04-05T16:30:00'
      },
      {
        id: 'team-chat',
        name: 'Team Chat',
        descriptionKey: 'features.teamChat',
        enabled: true,
        rolloutPercentage: 80,
        restrictedToRoles: [],
        category: 'beta',
        lastUpdated: '2025-04-22T13:10:00'
      },
      {
        id: 'voice-commands',
        name: 'Voice Commands',
        descriptionKey: 'features.voiceCommands',
        enabled: false,
        rolloutPercentage: 0,
        restrictedToRoles: ['admin'],
        category: 'experimental',
        lastUpdated: '2025-04-18T15:25:00'
      }
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setFeatures(mockFeatures);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Filter features based on category and search query
  const filteredFeatures = features.filter(feature => {
    // Apply category filter
    if (categoryFilter !== 'all' && feature.category !== categoryFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return feature.name.toLowerCase().includes(query) || 
             t(feature.descriptionKey).toLowerCase().includes(query);
    }
    
    return true;
  });
  
  // Toggle feature enabled state
  const toggleFeatureEnabled = (featureId: string) => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled, lastUpdated: new Date().toISOString() }
          : feature
      )
    );
  };
  
  // Update feature rollout percentage
  const updateRolloutPercentage = (featureId: string, percentage: number) => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === featureId
          ? { ...feature, rolloutPercentage: percentage, lastUpdated: new Date().toISOString() }
          : feature
      )
    );
  };
  
  // Toggle role restriction for feature
  const toggleRoleRestriction = (featureId: string, role: string) => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => {
        if (feature.id !== featureId) return feature;
        
        let updatedRoles = [...feature.restrictedToRoles];
        
        if (updatedRoles.includes(role)) {
          updatedRoles = updatedRoles.filter(r => r !== role);
        } else {
          updatedRoles.push(role);
        }
        
        return { 
          ...feature, 
          restrictedToRoles: updatedRoles,
          lastUpdated: new Date().toISOString()
        };
      })
    );
  };
  
  // Save feature toggle configuration
  const saveFeatureConfiguration = async () => {
    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get category badge class
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'core':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      case 'experimental':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-center items-center h-40">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[rgb(24,62,105)]"></div>
          <p className="ml-2 text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-[rgb(24,62,105)] bg-opacity-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[rgb(24,62,105)]">{t('featureToggles')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('featureTogglesDescription')}
          {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
        </p>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <label htmlFor="category-filter" className="block text-xs font-medium text-gray-700 mb-1">
              {t('category')}
            </label>
            <select
              id="category-filter"
              className="border border-gray-300 rounded-md p-1.5 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">{t('all')}</option>
              <option value="core">{t('categories.core')}</option>
              <option value="beta">{t('categories.beta')}</option>
              <option value="experimental">{t('categories.experimental')}</option>
            </select>
          </div>
          
          <div className="flex-grow max-w-md">
            <label htmlFor="feature-search" className="block text-xs font-medium text-gray-700 mb-1">
              {t('search')}
            </label>
            <input
              type="text"
              id="feature-search"
              className="block w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder={t('searchFeatures')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Features list */}
      <div className="divide-y divide-gray-200">
        {filteredFeatures.length > 0 ? (
          filteredFeatures.map(feature => (
            <div key={feature.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`feature-toggle-${feature.id}`}
                      type="checkbox"
                      className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded"
                      checked={feature.enabled}
                      onChange={() => toggleFeatureEnabled(feature.id)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <div className="flex items-center mb-1">
                      <label
                        htmlFor={`feature-toggle-${feature.id}`}
                        className="font-medium text-gray-700"
                      >
                        {feature.name}
                      </label>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getCategoryBadgeClass(feature.category)}`}>
                        {t(`categories.${feature.category}`)}
                      </span>
                    </div>
                    <p className="text-gray-500">{t(feature.descriptionKey)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('lastUpdated')}: {formatDate(feature.lastUpdated)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setExpandedFeatureId(expandedFeatureId === feature.id ? null : feature.id)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expandedFeatureId === feature.id ? t('showLess') : t('showMore')}
                </button>
              </div>
              
              {/* Expanded section with configuration options */}
              {expandedFeatureId === feature.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Rollout percentage */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('rolloutPercentage')}: {feature.rolloutPercentage}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={feature.rolloutPercentage}
                      onChange={(e) => updateRolloutPercentage(feature.id, Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[rgb(236,107,44)]"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  {/* Role restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('roleRestrictions')}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['admin', 'manager', 'user'].map(role => (
                        <label 
                          key={role} 
                          className="inline-flex items-center"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded"
                            checked={feature.restrictedToRoles.includes(role)}
                            onChange={() => toggleRoleRestriction(feature.id, role)}
                          />
                          <span className="ml-2 text-sm text-gray-700">{t(`roles.${role}`)}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {feature.restrictedToRoles.length > 0 
                        ? t('restrictedToSelectedRoles') 
                        : t('availableToAllRoles')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            {t('noFeaturesFound')}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <button
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => window.location.reload()}
        >
          {t('reset')}
        </button>
        
        <div className="flex items-center">
          {saveSuccess === true && (
            <p className="text-green-600 text-sm mr-3">{t('saveSuccess')}</p>
          )}
          {saveSuccess === false && (
            <p className="text-red-600 text-sm mr-3">{t('saveError')}</p>
          )}
          <button
            className="px-4 py-2 bg-[rgb(24,62,105)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[rgb(19,49,84)]"
            onClick={saveFeatureConfiguration}
            disabled={isSaving}
          >
            {isSaving ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
