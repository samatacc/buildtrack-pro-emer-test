'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../lib/auth/AuthContext'

export default function SettingsPage() {
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
        <h1 className="text-2xl font-bold text-[rgb(24,62,105)]">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>
      
      {/* Settings content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
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
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900">{state.user?.email}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">{state.user?.role?.replace('_', ' ')}</dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Authentication Provider</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {getAuthProviderDisplay()}
                {state.user?.authProvider === 'google' && (
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {state.user?.authProvider === 'microsoft' && (
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                )}
                {state.user?.authProvider === 'apple' && (
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                )}
              </dd>
            </div>
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {state.user?.createdAt ? new Date(state.user.createdAt).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Security settings section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-[rgb(24,62,105)]">Security Settings</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your password and account security.</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                <button 
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[rgb(236,107,44)] hover:bg-[rgb(215,92,38)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)]"
                >
                  Change
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Update your password regularly for better security.</p>
            </div>
            
            <div>
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <button 
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-[rgb(24,62,105)] bg-white border-[rgb(24,62,105)] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(24,62,105)]"
                >
                  Enable
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Add an extra layer of security to your account.</p>
            </div>
            
            <div>
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900">Sessions</h3>
                <button 
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-[rgb(24,62,105)] bg-white border-[rgb(24,62,105)] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(24,62,105)]"
                >
                  View All
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Manage active sessions and sign out from other devices.</p>
            </div>
            

          </div>
        </div>
      </div>
      
      {/* Preferences section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-[rgb(24,62,105)]">Preferences</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Customize your BuildTrack Pro experience.</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <div className="ml-4 flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input type="checkbox" id="toggle" defaultChecked className="sr-only" />
                    <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">Receive email notifications about important updates.</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Dashboard Theme</h3>
                <select 
                  className="mt-1 block w-28 pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm rounded-md"
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    alert(`Theme changed to ${e.target.value}`);
                  }}
                >
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
              <p className="mt-1 text-sm text-gray-500">Choose your preferred dashboard theme.</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Language</h3>
                <select 
                  className="mt-1 block w-28 pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm rounded-md"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    alert(`Language changed to ${e.target.value}`);
                  }}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <p className="mt-1 text-sm text-gray-500">Select your preferred language.</p>
            </div>
          </div>
          
          {/* Delete Account - moved to the end as requested */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
              <button 
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    alert('This is a demo feature. Account deletion is not implemented.');
                  }
                }}
              >
                Delete
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">Permanently delete your account and all associated data.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
