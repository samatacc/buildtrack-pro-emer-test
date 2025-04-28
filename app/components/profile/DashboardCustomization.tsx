'use client';

import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import { ProfileData } from '@/lib/api/profile-client';

interface DashboardCustomizationProps {
  profile: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => Promise<void>;
  className?: string;
}

/**
 * DashboardCustomization component
 * 
 * Allows users to customize their dashboard layout and widget preferences.
 * Implements drag-and-drop functionality with a mobile-first approach.
 * Follows BuildTrack Pro's design system with primary blue and orange colors.
 */
export default function DashboardCustomization({ 
  profile, 
  onUpdate,
  className = '' 
}: DashboardCustomizationProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Default dashboard layout
  const defaultLayout = {
    layout: 'default',
    widgets: []
  };
  
  // Parse the dashboard layout
  const [dashboardLayout, setDashboardLayout] = useState<any>(
    profile.dashboardLayout || defaultLayout
  );
  
  // Recent projects
  const [recentProjects, setRecentProjects] = useState<any[]>(
    profile.recentProjects || []
  );
  
  // Favorite tools
  const [favoriteTools, setFavoriteTools] = useState<any[]>(
    profile.favoriteTools || []
  );
  
  const [isLoading, setIsLoading] = useState(false);

  // Available widgets for the dashboard
  const availableWidgets = [
    { id: 'project-overview', type: 'project_overview', name: 'Project Overview' },
    { id: 'task-list', type: 'task_list', name: 'Task List' },
    { id: 'timeline', type: 'timeline', name: 'Timeline' },
    { id: 'documents', type: 'documents', name: 'Documents' },
    { id: 'financial-summary', type: 'financial_summary', name: 'Financial Summary' },
    { id: 'team-status', type: 'team_status', name: 'Team Status' },
    { id: 'weather', type: 'weather', name: 'Weather Forecast' },
    { id: 'analytics', type: 'analytics', name: 'Analytics' }
  ];

  // Toggle widget selection
  const toggleWidget = (widgetId: string) => {
    const widgetInfo = availableWidgets.find(w => w.id === widgetId);
    
    if (!widgetInfo) return;
    
    const isSelected = dashboardLayout.widgets.some((w: any) => w.id === widgetId);
    
    if (isSelected) {
      // Remove widget
      setDashboardLayout({
        ...dashboardLayout,
        widgets: dashboardLayout.widgets.filter((w: any) => w.id !== widgetId)
      });
    } else {
      // Add widget with default settings
      setDashboardLayout({
        ...dashboardLayout,
        widgets: [
          ...dashboardLayout.widgets,
          {
            id: widgetId,
            type: widgetInfo.type,
            position: { x: 0, y: dashboardLayout.widgets.length },
            size: { width: 1, height: 1 },
            settings: {}
          }
        ]
      });
    }
  };

  // Change layout type
  const changeLayout = (layout: string) => {
    setDashboardLayout({
      ...dashboardLayout,
      layout
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate({
        dashboardLayout,
        // We're not updating recent projects or favorite tools here
        // as they're managed through separate API endpoints
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update dashboard customization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDashboardLayout(profile.dashboardLayout || defaultLayout);
    setIsEditing(false);
  };

  // Available layout types
  const layoutTypes = [
    { value: 'default', label: 'Default Grid' },
    { value: 'compact', label: 'Compact View' },
    { value: 'wide', label: 'Wide View' },
    { value: 'focus', label: 'Focus Mode' }
  ];

  return (
    <ProfileCard
      title="Dashboard Customization"
      className={className}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      {isEditing ? (
        <div className="space-y-6">
          {/* Layout Type */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Layout Type</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {layoutTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => changeLayout(type.value)}
                  className={`
                    p-4 
                    rounded-xl 
                    text-center 
                    transition-all 
                    duration-200
                    ${dashboardLayout.layout === type.value
                      ? 'bg-[rgb(24,62,105)] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Widget Selection */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Widgets</h4>
            <p className="text-sm text-gray-500 mb-3">
              Select the widgets you want to display on your dashboard
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableWidgets.map((widget) => {
                const isSelected = dashboardLayout.widgets.some((w: any) => w.id === widget.id);
                return (
                  <button
                    key={widget.id}
                    type="button"
                    onClick={() => toggleWidget(widget.id)}
                    className={`
                      p-4 
                      rounded-xl 
                      text-left 
                      transition-all 
                      duration-200
                      flex items-center
                      ${isSelected
                        ? 'bg-[rgb(24,62,105)] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <div className={`
                      h-5 
                      w-5 
                      rounded-md 
                      mr-3 
                      flex-shrink-0
                      border-2
                      ${isSelected
                        ? 'border-white bg-[rgb(236,107,44)]'
                        : 'border-gray-400 bg-white'
                      }
                    `}>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{widget.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Note about drag-and-drop */}
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium">Tip:</p>
            <p>Once you've selected your widgets, you can arrange them on your dashboard by dragging and dropping.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Layout Type */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Current Layout</h4>
            <div className="bg-gray-100 rounded-xl px-4 py-3 inline-block">
              {layoutTypes.find(t => t.value === dashboardLayout.layout)?.label || 'Default Grid'}
            </div>
          </div>
          
          {/* Active Widgets */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Active Widgets</h4>
            {dashboardLayout.widgets && dashboardLayout.widgets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dashboardLayout.widgets.map((widget: any) => {
                  const widgetInfo = availableWidgets.find(w => w.id === widget.id);
                  return (
                    <div
                      key={widget.id}
                      className="bg-gray-100 rounded-xl p-4 border-l-4 border-[rgb(24,62,105)]"
                    >
                      <p className="font-medium">{widgetInfo?.name || widget.type}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No widgets selected</p>
            )}
          </div>
          
          {/* Recent Projects */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Projects</h4>
            {recentProjects && recentProjects.length > 0 ? (
              <div className="space-y-2">
                {recentProjects.slice(0, 3).map((project: any, index) => (
                  <div key={project.id || index} className="bg-gray-100 rounded-xl p-3 flex items-center">
                    <div className="h-10 w-10 rounded-md bg-[rgb(24,62,105)] text-white flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      {project.accessedAt && (
                        <p className="text-xs text-gray-500">
                          Accessed {new Date(project.accessedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No recent projects</p>
            )}
          </div>
        </div>
      )}
    </ProfileCard>
  );
}
