'use client';

import React from 'react';

/**
 * ProfessionalInfo Component
 * 
 * Displays the user's professional information including:
 * - Professional certifications
 * - Skills and expertise
 * - Years of experience
 * - Project specializations
 * 
 * This is a minimal implementation to ensure builds succeed while
 * focusing on the Help & Support system for Phase 1.
 */
export default function ProfessionalInfo() {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Information</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-md font-medium text-gray-700">Experience</h3>
          <p className="text-gray-600">Construction industry professional</p>
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-700">Skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Project Management</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Construction</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Planning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
