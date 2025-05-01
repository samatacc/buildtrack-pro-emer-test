'use client';

import React from 'react';

/**
 * ProfileHeader Component
 * 
 * Displays the user's profile header information including:
 * - Profile image
 * - Name and job title
 * - Company information
 * - Contact details
 * 
 * This is a minimal implementation to ensure builds succeed while
 * focusing on the Help & Support system for Phase 1.
 */
export default function ProfileHeader() {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-6">
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
          {/* Placeholder for user image */}
          <span className="text-gray-500 text-2xl">👤</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
          <p className="text-gray-600">Role: Construction Manager</p>
        </div>
      </div>
    </div>
  );
}
