'use client';

import React from 'react';

/**
 * MobileSettings Component
 * 
 * Provides construction professionals with mobile-specific settings including:
 * - Data usage preferences for field operations
 * - Offline mode configuration for remote sites
 * - Location settings for site coordination
 * - Mobile sync frequency for project updates
 * 
 * This is a minimal implementation to ensure builds succeed while
 * focusing on the Help & Support system for Phase 1.
 */
export default function MobileSettings() {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mobile Application Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700">Offline Access</h3>
            <p className="text-sm text-gray-500">Access project data without internet connection</p>
          </div>
          <div className="h-6 w-11 bg-blue-500 rounded-full relative cursor-pointer">
            <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700">Sync Frequency</h3>
          <p className="text-sm text-gray-500">How often to sync project data</p>
          <select className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
            <option>Every 15 minutes</option>
            <option>Every 30 minutes</option>
            <option>Hourly</option>
            <option>Manual sync only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
