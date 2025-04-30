'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MockImage } from '../components/ui/MockImage';

export default function Dashboard() {
  const [projects] = useState([
    {
      id: 'proj-001',
      name: 'Riverfront Apartments',
      progress: 65,
      dueDate: '2025-05-15',
      type: 'residential',
      budget: '$4.2M',
      location: 'Portland, OR'
    },
    {
      id: 'proj-002',
      name: 'Tech Center Retrofit',
      progress: 32,
      dueDate: '2025-07-22',
      type: 'commercial',
      budget: '$7.8M',
      location: 'Seattle, WA'
    },
    {
      id: 'proj-003',
      name: 'Green Valley Plaza',
      progress: 78,
      dueDate: '2025-06-10',
      type: 'commercial',
      budget: '$5.6M',
      location: 'Austin, TX'
    }
  ]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-blue">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/projects/new" 
              className="btn-primary"
            >
              Create New Project
            </Link>
            <Link
              href="/"
              className="btn-secondary"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Key metrics */}
          <div className="widget p-6">
            <h2 className="text-lg font-medium text-primary-blue mb-4">Active Projects</h2>
            <p className="text-4xl font-bold text-primary-blue">{projects.length}</p>
            <p className="text-sm text-secondary-gray mt-2">Across 3 different locations</p>
          </div>
          
          <div className="widget p-6">
            <h2 className="text-lg font-medium text-primary-blue mb-4">Total Budget</h2>
            <p className="text-4xl font-bold text-primary-blue">$17.6M</p>
            <p className="text-sm text-secondary-gray mt-2">Average: $5.86M per project</p>
          </div>
          
          <div className="widget p-6">
            <h2 className="text-lg font-medium text-primary-blue mb-4">Overall Progress</h2>
            <p className="text-4xl font-bold text-primary-blue">58%</p>
            <p className="text-sm text-secondary-gray mt-2">Ahead of schedule by 3 days</p>
          </div>
        </div>

        {/* Projects */}
        <div className="widget overflow-hidden">
          <div className="px-6 py-5 border-b border-[rgb(var(--card-border))]">
            <h2 className="text-xl font-medium text-primary-blue">Current Projects</h2>
          </div>
          <ul className="divide-y divide-[rgb(var(--card-border))]">
            {projects.map(project => (
              <li key={project.id} className="px-6 py-5 hover:bg-primary-light hover:bg-opacity-30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-card overflow-hidden">
                    <MockImage 
                      category="project" 
                      variant={project.type === 'commercial' ? 'commercial' : 'blueprint'}
                      width={48} 
                      height={48}
                      alt={project.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-primary-blue">{project.name}</p>
                    <p className="text-sm text-secondary-gray">{project.location} • Due: {project.dueDate}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-900">{project.budget}</p>
                    <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                      <div 
                        className="h-2 bg-primary-blue rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-secondary-gray mt-1">{project.progress}% Complete</p>
                  </div>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="ml-4 px-3 py-1 border border-primary-blue text-primary-blue rounded-md text-sm hover:bg-primary-light transition-colors"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-6 py-4 border-t border-[rgb(var(--card-border))] bg-primary-light bg-opacity-20">
            <Link
              href="/dashboard/projects"
              className="text-sm font-medium text-primary-blue hover:underline flex items-center"
            >
              View all projects
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link 
            href="/dashboard/projects/new" 
            className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <div className="text-[rgb(24,62,105)] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">New Project</h3>
            <p className="text-sm text-gray-500 mt-1">Create a new construction project</p>
          </Link>
          
          <Link 
            href="/dashboard/materials" 
            className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <div className="text-[rgb(24,62,105)] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Materials</h3>
            <p className="text-sm text-gray-500 mt-1">Track inventory and orders</p>
          </Link>
          
          <Link 
            href="/dashboard/documents" 
            className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <div className="text-[rgb(24,62,105)] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Documents</h3>
            <p className="text-sm text-gray-500 mt-1">Manage files and documents</p>
          </Link>
          
          <Link 
            href="/dashboard/reports" 
            className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <div className="text-[rgb(24,62,105)] mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Reports</h3>
            <p className="text-sm text-gray-500 mt-1">Analytics and reporting</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
