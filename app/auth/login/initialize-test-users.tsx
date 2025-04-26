'use client'

import { useEffect, useState } from 'react'

export function InitializeTestUsers() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  
  useEffect(() => {
    const setupTestUsers = async () => {
      try {
        // Check if we've already loaded test users in this session
        const hasLoadedUsers = sessionStorage.getItem('buildtrack_test_users_loaded')
        if (hasLoadedUsers === 'true') {
          console.log('Test users already loaded in this session')
          return
        }

        setStatus('loading')
        const response = await fetch('/api/auth/setup-test-users')
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success && Array.isArray(data.users)) {
          // Store the users in localStorage for the InMemoryUserService
          localStorage.setItem('buildtrack_users_db', JSON.stringify(data.users))
          console.log(`Successfully loaded ${data.users.length} test users`)
          
          // Mark as loaded for this session
          sessionStorage.setItem('buildtrack_test_users_loaded', 'true')
          setStatus('success')
        } else {
          throw new Error('Invalid response data')
        }
      } catch (error) {
        console.error('Failed to initialize test users:', error)
        setStatus('error')
      }
    }
    
    setupTestUsers()
  }, [])
  
  if (!status || status === 'loading') {
    return null // No visual output during loading
  }
  
  if (status === 'error') {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-2 mb-4 rounded">
        <p>Failed to initialize test users. Please refresh the page to try again.</p>
      </div>
    )
  }
  
  return (
    <div className="text-sm text-green-600 bg-green-50 p-2 mb-4 rounded">
      <p>Test users initialized. You can sign in with:</p>
      <ul className="text-xs mt-1 ml-4 list-disc">
        <li>Admin: admin@buildtrackpro.com / Password123</li>
        <li>Project Manager: pm@buildtrackpro.com / Password123</li>
        <li>Contractor: contractor@buildtrackpro.com / Password123</li>
        <li>Client: client@buildtrackpro.com / Password123</li>
        <li>User: user@buildtrackpro.com / Password123</li>
      </ul>
    </div>
  )
}
