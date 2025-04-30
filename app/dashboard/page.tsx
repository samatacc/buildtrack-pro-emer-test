'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth/AuthContext'

// Dashboard component that follows the BuildTrack Pro design system
export default function DashboardHome() {
  const { user, logout } = useAuth()
  const [greeting, setGreeting] = useState('Good day')
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  // Calculate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">{greeting}, {user?.email?.split('@')[0] || 'User'}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Projects</h2>
          <p className="text-gray-600">View your projects in the Projects section</p>
          <div className="mt-4">
            <a href="/dashboard/projects" className="text-blue-600 hover:underline">Go to Projects</a>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Tasks</h2>
          <p className="text-gray-600">View your assigned tasks</p>
          <div className="mt-4">
            <button className="text-blue-600 hover:underline">View Tasks</button>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
