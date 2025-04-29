'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * DashboardControl Component
 * 
 * Admin component for controlling dashboard configuration, widgets, and global settings.
 * Follows BuildTrack Pro's design principles with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)).
 * 
 * Features:
 * - Full internationalization support
 * - Mobile-responsive admin controls
 * - Widget visibility management
 * - User role-based dashboard configuration
 */
interface Widget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredRole: string;
  defaultPosition: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface DashboardConfig {
  id: string;
  name: string;
  role: string;
  widgets: string[]; // IDs of enabled widgets
  layout: 'grid' | 'list' | 'compact';
  colorTheme: 'default' | 'highContrast' | 'colorBlind';
  dataRefreshRate: number; // in seconds
}

interface DashboardControlProps {
  initialConfig?: DashboardConfig[];
  initialWidgets?: Widget[];
  className?: string;
}

export default function DashboardControl({
  initialConfig = [],
  initialWidgets = [],
  className = '',
}: DashboardControlProps) {
  const { t, metrics } = useNamespacedTranslations('admin');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardConfigs, setDashboardConfigs] = useState<DashboardConfig[]>(initialConfig);
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>(initialWidgets);
  const [activeConfigId, setActiveConfigId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState<boolean | null>(null);
  
  // Load dashboard configurations and widgets (normally from API)
  useEffect(() => {
    // Mock data
    const mockWidgets: Widget[] = [
      {
        id: 'projects-widget',
        name: 'Projects Overview',
        description: 'Shows active projects with status and progress',
        enabled: true,
        requiredRole: 'user',
        defaultPosition: { x: 0, y: 0, w: 2, h: 2 }
      },
      {
        id: 'tasks-widget',
        name: 'Tasks List',
        description: 'Displays upcoming tasks with due dates',
        enabled: true,
        requiredRole: 'user',
        defaultPosition: { x: 2, y: 0, w: 1, h: 2 }
      },
      {
        id: 'materials-widget',
        name: 'Materials Tracker',
        description: 'Tracks ordered and delivered materials',
        enabled: true,
        requiredRole: 'user',
        defaultPosition: { x: 0, y: 2, w: 3, h: 1 }
      },
      {
        id: 'metrics-widget',
        name: 'Performance Metrics',
        description: 'Shows key metrics and analytics',
        enabled: true,
        requiredRole: 'user',
        defaultPosition: { x: 0, y: 3, w: 3, h: 1 }
      },
      {
        id: 'team-widget',
        name: 'Team Activity',
        description: 'Shows recent activity from team members',
        enabled: false,
        requiredRole: 'manager',
        defaultPosition: { x: 3, y: 0, w: 1, h: 3 }
      },
      {
        id: 'budget-widget',
        name: 'Budget Overview',
        description: 'Displays budget allocation and spending',
        enabled: false,
        requiredRole: 'manager',
        defaultPosition: { x: 3, y: 3, w: 1, h: 1 }
      },
      {
        id: 'admin-widget',
        name: 'Admin Panel',
        description: 'Quick access to admin functions',
        enabled: false,
        requiredRole: 'admin',
        defaultPosition: { x: 4, y: 0, w: 1, h: 4 }
      }
    ];
    
    const mockConfigs: DashboardConfig[] = [
      {
        id: 'default-user',
        name: 'Default User Dashboard',
        role: 'user',
        widgets: ['projects-widget', 'tasks-widget', 'materials-widget', 'metrics-widget'],
        layout: 'grid',
        colorTheme: 'default',
        dataRefreshRate: 60
      },
      {
        id: 'manager-dashboard',
        name: 'Manager Dashboard',
        role: 'manager',
        widgets: ['projects-widget', 'tasks-widget', 'team-widget', 'budget-widget'],
        layout: 'grid',
        colorTheme: 'default',
        dataRefreshRate: 30
      },
      {
        id: 'admin-dashboard',
        name: 'Admin Dashboard',
        role: 'admin',
        widgets: ['projects-widget', 'tasks-widget', 'admin-widget', 'budget-widget'],
        layout: 'grid',
        colorTheme: 'default',
        dataRefreshRate: 15
      },
      {
        id: 'field-dashboard',
        name: 'Field Workers Dashboard',
        role: 'user',
        widgets: ['tasks-widget', 'materials-widget'],
        layout: 'compact',
        colorTheme: 'highContrast',
        dataRefreshRate: 120
      }
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setAvailableWidgets(mockWidgets);
      setDashboardConfigs(mockConfigs);
      setActiveConfigId(mockConfigs[0].id);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Get active configuration
  const getActiveConfig = () => {
    return dashboardConfigs.find(config => config.id === activeConfigId) || dashboardConfigs[0];
  };
  
  // Handle widget toggle
  const handleWidgetToggle = (widgetId: string) => {
    const updatedConfigs = [...dashboardConfigs];
    const configIndex = updatedConfigs.findIndex(config => config.id === activeConfigId);
    
    if (configIndex === -1) return;
    
    const config = updatedConfigs[configIndex];
    const hasWidget = config.widgets.includes(widgetId);
    
    if (hasWidget) {
      // Remove widget
      config.widgets = config.widgets.filter(id => id !== widgetId);
    } else {
      // Add widget
      config.widgets.push(widgetId);
    }
    
    updatedConfigs[configIndex] = config;
    setDashboardConfigs(updatedConfigs);
  };
  
  // Handle layout change
  const handleLayoutChange = (layout: 'grid' | 'list' | 'compact') => {
    const updatedConfigs = [...dashboardConfigs];
    const configIndex = updatedConfigs.findIndex(config => config.id === activeConfigId);
    
    if (configIndex === -1) return;
    
    updatedConfigs[configIndex].layout = layout;
    setDashboardConfigs(updatedConfigs);
  };
  
  // Handle color theme change
  const handleThemeChange = (theme: 'default' | 'highContrast' | 'colorBlind') => {
    const updatedConfigs = [...dashboardConfigs];
    const configIndex = updatedConfigs.findIndex(config => config.id === activeConfigId);
    
    if (configIndex === -1) return;
    
    updatedConfigs[configIndex].colorTheme = theme;
    setDashboardConfigs(updatedConfigs);
  };
  
  // Handle refresh rate change
  const handleRefreshRateChange = (rate: number) => {
    const updatedConfigs = [...dashboardConfigs];
    const configIndex = updatedConfigs.findIndex(config => config.id === activeConfigId);
    
    if (configIndex === -1) return;
    
    updatedConfigs[configIndex].dataRefreshRate = rate;
    setDashboardConfigs(updatedConfigs);
  };
  
  // Save dashboard configurations
  const handleSaveConfigs = async () => {
    setIsSaving(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavingSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSavingSuccess(null), 3000);
    } catch (error) {
      setSavingSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-40">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[rgb(24,62,105)]"></div>
          <p className="ml-2 text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  const activeConfig = getActiveConfig();
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-[rgb(24,62,105)] bg-opacity-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[rgb(24,62,105)]">{t('dashboardControl')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('configureForAllRoles')}
          {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
        </p>
      </div>
      
      {/* Dashboard selector */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <label htmlFor="dashboard-selector" className="block text-sm font-medium text-gray-700 mb-2">
          {t('selectDashboard')}:
        </label>
        <select
          id="dashboard-selector"
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)]"
          value={activeConfigId}
          onChange={(e) => setActiveConfigId(e.target.value)}
        >
          {dashboardConfigs.map(config => (
            <option key={config.id} value={config.id}>
              {config.name} ({t(`roles.${config.role}`)})
            </option>
          ))}
        </select>
      </div>
      
      {/* Configuration panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Widgets panel */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-[rgb(24,62,105)]">{t('widgets')}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {availableWidgets.map(widget => {
              const isEnabled = activeConfig.widgets.includes(widget.id);
              const isAvailable = widget.requiredRole === activeConfig.role || 
                (widget.requiredRole === 'user') || 
                (widget.requiredRole === 'manager' && activeConfig.role === 'admin');
              
              return (
                <div key={widget.id} className={`p-4 ${!isAvailable ? 'opacity-50' : ''}`}>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={`widget-${widget.id}`}
                        type="checkbox"
                        className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded"
                        checked={isEnabled}
                        onChange={() => handleWidgetToggle(widget.id)}
                        disabled={!isAvailable}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor={`widget-${widget.id}`}
                        className="font-medium text-gray-700"
                      >
                        {widget.name}
                      </label>
                      <p className="text-gray-500">{widget.description}</p>
                      {!isAvailable && (
                        <p className="text-xs text-red-500 mt-1">
                          {t('requiresRole', { role: t(`roles.${widget.requiredRole}`) })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Settings panel */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-[rgb(24,62,105)]">{t('settings')}</h3>
          </div>
          <div className="p-4 space-y-6">
            {/* Layout settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('layout')}:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`px-4 py-2 text-sm border rounded-md ${
                    activeConfig.layout === 'grid' 
                      ? 'bg-[rgb(24,62,105)] text-white border-[rgb(24,62,105)]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLayoutChange('grid')}
                >
                  {t('layouts.grid')}
                </button>
                <button
                  className={`px-4 py-2 text-sm border rounded-md ${
                    activeConfig.layout === 'list' 
                      ? 'bg-[rgb(24,62,105)] text-white border-[rgb(24,62,105)]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLayoutChange('list')}
                >
                  {t('layouts.list')}
                </button>
                <button
                  className={`px-4 py-2 text-sm border rounded-md ${
                    activeConfig.layout === 'compact' 
                      ? 'bg-[rgb(24,62,105)] text-white border-[rgb(24,62,105)]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLayoutChange('compact')}
                >
                  {t('layouts.compact')}
                </button>
              </div>
            </div>
            
            {/* Theme settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('colorTheme')}:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`px-4 py-2 text-sm border rounded-md ${
                    activeConfig.colorTheme === 'default' 
                      ? 'bg-[rgb(24,62,105)] text-white border-[rgb(24,62,105)]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleThemeChange('default')}
                >
                  {t('themes.default')}
                </button>
                <button
                  className={`px-4 py-2 text-sm border rounded-md ${
                    activeConfig.colorTheme === 'highContrast' 
                      ? 'bg-[rgb(24,62,105)] text-white border-[rgb(24,62,105)]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleThemeChange('highContrast')}
                >
                  {t('themes.highContrast')}
                </button>
                <button
                  className={`px-4 py-2 text-sm border rounded-md ${
                    activeConfig.colorTheme === 'colorBlind' 
                      ? 'bg-[rgb(24,62,105)] text-white border-[rgb(24,62,105)]' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleThemeChange('colorBlind')}
                >
                  {t('themes.colorBlind')}
                </button>
              </div>
            </div>
            
            {/* Refresh rate settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dataRefreshRate')}:
              </label>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)]"
                value={activeConfig.dataRefreshRate}
                onChange={(e) => handleRefreshRateChange(Number(e.target.value))}
              >
                <option value="15">{t('refreshRates.seconds', { count: 15 })}</option>
                <option value="30">{t('refreshRates.seconds', { count: 30 })}</option>
                <option value="60">{t('refreshRates.minute', { count: 1 })}</option>
                <option value="120">{t('refreshRates.minutes', { count: 2 })}</option>
                <option value="300">{t('refreshRates.minutes', { count: 5 })}</option>
                <option value="600">{t('refreshRates.minutes', { count: 10 })}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
        {savingSuccess === true && (
          <p className="text-green-600 text-sm self-center mr-2">{t('saveSuccess')}</p>
        )}
        {savingSuccess === false && (
          <p className="text-red-600 text-sm self-center mr-2">{t('saveError')}</p>
        )}
        <button
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(24,62,105)]"
          onClick={() => window.location.reload()}
        >
          {t('reset')}
        </button>
        <button
          className="px-4 py-2 bg-[rgb(24,62,105)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[rgb(19,49,84)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(24,62,105)]"
          onClick={handleSaveConfigs}
          disabled={isSaving}
        >
          {isSaving ? t('saving') : t('saveChanges')}
        </button>
      </div>
    </div>
  );
}
