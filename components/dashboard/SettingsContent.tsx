'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth/AuthContext'

/**
 * BuildTrack Pro - Settings Content Component
 * 
 * Client-side only component for dashboard settings that follows
 * BuildTrack Pro's design principles:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Light neumorphism for subtle depth
 * - Mobile-first approach
 * - Micro animations for interactions
 */
export default function SettingsContent() {
  const { user, logout } = useAuth()
  const [state, setState] = useState({ user })
  const [theme, setTheme] = useState('Light')
  const [language, setLanguage] = useState('English')
  
  // Update state when user changes
  useEffect(() => {
    setState({ user })
  }, [user])
  
  // Format the authentication provider for display
  const getAuthProviderDisplay = () => {
    if (!state.user?.authProvider) return 'Email'
    
    const providerMap = {
      'email': 'Email',
      'google': 'Google',
      'microsoft': 'Microsoft Azure',
      'apple': 'Apple'
    }
    
    return providerMap[state.user.authProvider] || 'Email'
  }
  
  return (
    <div className="pb-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[rgb(24,62,105)] animate-fadeIn">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>
      
      {/* Settings content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-2xl mb-6 hover:shadow-md transition-shadow duration-300">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-[rgb(24,62,105)]">Account Information</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application settings.</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{state.user?.firstName} {state.user?.lastName}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{state.user?.email}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Job Title</dt>
              <dd className="mt-1 text-sm text-gray-900">{(state.user as any)?.jobTitle || 'Not specified'}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="mt-1 text-sm text-gray-900">{(state.user as any)?.company || 'Not specified'}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Authentication Provider</dt>
              <dd className="mt-1 text-sm text-gray-900">{getAuthProviderDisplay()}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {state.user?.createdAt 
                  ? new Date(state.user.createdAt).toLocaleDateString() 
                  : 'Not available'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Settings section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-2xl hover:shadow-md transition-shadow duration-300">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-[rgb(24,62,105)]">Preferences</h2>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="mb-6">
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <select
              id="theme"
              name="theme"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] sm:text-sm rounded-md"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              id="language"
              name="language"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)] sm:text-sm rounded-md"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Português (Brasil)</option>
            </select>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(236,107,44)] hover:bg-[rgb(226,97,34)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)] transition-colors duration-200"
              onClick={() => logout()}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
