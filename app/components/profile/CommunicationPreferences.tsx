'use client';

import React from 'react';

/**
 * CommunicationPreferences Component
 * 
 * Allows users to set preferences for:
 * - Email notifications
 * - Mobile notifications
 * - Newsletter subscriptions
 * - Communication frequency
 * 
 * This is a minimal implementation to ensure builds succeed while
 * focusing on the Help & Support system for Phase 1.
 */
export default function CommunicationPreferences() {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Communication Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700">Email Notifications</h3>
            <p className="text-sm text-gray-500">Receive updates via email</p>
          </div>
          <div className="h-6 w-11 bg-gray-200 rounded-full relative cursor-pointer">
            <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700">Mobile Notifications</h3>
            <p className="text-sm text-gray-500">Receive updates via push notifications</p>
          </div>
          <div className="h-6 w-11 bg-blue-500 rounded-full relative cursor-pointer">
            <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
