'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '../../../lib/auth/SupabaseAuthContext'
import { useTranslations } from '@/app/hooks/useTranslations'
import ConnectionStatus from '@/app/components/shared/ConnectionStatus'

/**
 * DashboardHome Component
 * 
 * Main dashboard for BuildTrack Pro following the mobile-first design approach
 * with Primary Blue (rgb(24,62,105)) and Primary Orange (rgb(236,107,44)).
 * 
 * Supports internationalization for diverse construction teams and
 * includes mobile optimization for field environments with potentially
 * limited connectivity.
 */
export default function DashboardHome() {
  const { user, signOut } = useSupabaseAuth()
  const { t } = useTranslations('dashboard')
  const [greeting, setGreeting] = useState(t('welcome', { name: '' }))
  const [state, setState] = useState({ user })
  
  // Update state when user changes
  useEffect(() => {
    setState({ user })
  }, [user])
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  // Calculate greeting based on time of day using useEffect for client-side rendering
  useEffect(() => {
    if (!user) return
    
    const hour = new Date().getHours()
    let timeGreeting = 'welcome'
    
    if (hour < 12) timeGreeting = 'goodMorning'
    else if (hour < 18) timeGreeting = 'goodAfternoon'
    else timeGreeting = 'goodEvening'
    
    // Use the user's first name or full name if available
    const name = user.user_metadata?.first_name || user.user_metadata?.name || ''
    setGreeting(t(timeGreeting, { name }))
  }, [user, t])

  // Mock data for dashboard components
  const projects = [
    { id: 1, name: 'Highland Residence', status: 'In Progress', completion: 65, dueDate: '2025-05-15' },
    { id: 2, name: 'Westfield Commercial', status: 'Planning', completion: 20, dueDate: '2025-06-30' },
    { id: 3, name: 'Riverside Apartments', status: 'On Hold', completion: 45, dueDate: '2025-07-10' },
    { id: 4, name: 'Downtown Renovation', status: 'In Progress', completion: 80, dueDate: '2025-05-05' },
  ]
  
  const tasks = [
    { id: 1, title: 'Review contractor proposals', priority: 'High', dueDate: '2025-04-26', project: 'Highland Residence' },
    { id: 2, title: 'Submit permit applications', priority: 'High', dueDate: '2025-04-27', project: 'Westfield Commercial' },
    { id: 3, title: 'Order materials for kitchen', priority: 'Medium', dueDate: '2025-04-29', project: 'Highland Residence' },
    { id: 4, title: 'Schedule inspections', priority: 'Medium', dueDate: '2025-05-02', project: 'Riverside Apartments' },
    { id: 5, title: 'Finalize floor plans', priority: 'Low', dueDate: '2025-05-07', project: 'Downtown Renovation' },
  ]
  
  const metrics = [
    { id: 1, name: 'Active Projects', value: 12, change: '+2', trend: 'up' },
    { id: 2, name: 'Tasks Due Soon', value: 28, change: '+5', trend: 'up' },
    { id: 3, name: 'Budget Utilization', value: '68%', change: '+3%', trend: 'up' },
    { id: 4, name: 'Team Utilization', value: '82%', change: '-2%', trend: 'down' },
  ]
  
  return (
    <div className="pb-6">
      {/* Page header */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto relative">
        {/* Online/Offline Connection Status Indicator */}
        <ConnectionStatus />
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(24,62,105)] mb-2">
            {greeting}
          </h1>
          <p className="text-gray-500">Here's what's happening with your projects today.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-lg hover:bg-[rgb(19,49,84)] transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      {/* Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">{metric.name}</p>
                <p className="text-2xl font-bold text-[rgb(24,62,105)] mt-1">{metric.value}</p>
              </div>
              <div className={`flex items-center ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {metric.trend === 'up' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              </div>
            </div>
            <div className="mt-3 h-1 bg-gray-200 rounded">
              <div 
                className={`h-1 rounded ${metric.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: typeof metric.value === 'string' ? metric.value.replace('%', '') + '%' : '50%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Projects and Tasks section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Projects widget - takes 2/3 of the space on large screens */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[rgb(24,62,105)]">{t('recentProjects')}</h2>
            <a href="/projects" className="text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] transition-colors">
              {t('viewAll')}
            </a>
          </div>
          <div className="p-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'On Hold' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-[rgb(236,107,44)] h-2.5 rounded-full" 
                          style={{ width: `${project.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{project.completion}%</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks widget - takes 1/3 of the space on large screens */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center mb-4 mt-8">
            <h2 className="text-xl font-bold text-[rgb(24,62,105)]">{t('tasks')}</h2>
            <a href="/tasks" className="text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] transition-colors">
              {t('viewAll')}
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.project}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    Due {new Date(task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
