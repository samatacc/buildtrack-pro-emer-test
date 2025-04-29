'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '../../../lib/auth/SupabaseAuthContext'
import { useNamespacedTranslations } from '../../hooks/useNamespacedTranslations'
import ConnectionStatus from '../../components/shared/ConnectionStatus'
import ProjectCard from '../../components/dashboard/ProjectCard'
import TaskList from '../../components/dashboard/TaskList'
import MaterialsManagement from '../../components/dashboard/MaterialsManagement'

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
  const { t, metrics } = useNamespacedTranslations('dashboard')
  const [greeting, setGreeting] = useState(t('welcome', { name: '' }))
  const [state, setState] = useState({ user })
  const [isLoading, setIsLoading] = useState(true)
  
  // Update state when user changes
  useEffect(() => {
    setState({ user })
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 600)
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

  // Enhanced mock data for dashboard components with internationalization support
  const projects = [
    { 
      id: 1, 
      name: 'Highland Residence', 
      status: 'In Progress', 
      completion: 65, 
      dueDate: '2025-05-15',
      client: 'Johnson Family',
      budget: { total: 450000, spent: 290000, currency: 'USD' },
      location: '1234 Highland Ave, Seattle WA'
    },
    { 
      id: 2, 
      name: 'Westfield Commercial', 
      status: 'Planning', 
      completion: 20, 
      dueDate: '2025-06-30',
      client: 'Westfield Properties LLC',
      budget: { total: 2800000, spent: 560000, currency: 'USD' },
      location: '987 Business Park Dr, Portland OR'
    },
    { 
      id: 3, 
      name: 'Riverside Apartments', 
      status: 'On Hold', 
      completion: 45, 
      dueDate: '2025-07-10',
      client: 'River Development Group',
      budget: { total: 1200000, spent: 540000, currency: 'USD' },
      location: '555 Riverside Blvd, San Francisco CA'
    },
    { 
      id: 4, 
      name: 'Downtown Renovation', 
      status: 'In Progress', 
      completion: 80, 
      dueDate: '2025-05-05',
      client: 'City of Oakridge',
      budget: { total: 780000, spent: 624000, currency: 'USD' },
      location: '100 Main Street, Oakridge CA'
    },
  ]
  
  const tasks = [
    { 
      id: 1, 
      title: 'Review contractor proposals', 
      description: 'Evaluate submitted proposals from 3 electrical contractors', 
      status: 'In Progress',
      priority: 'High', 
      dueDate: '2025-04-30', 
      project: 'Highland Residence',
      assignedTo: 'Carlos Mendez'
    },
    { 
      id: 2, 
      title: 'Submit permit applications', 
      description: 'Complete and submit all required building permits', 
      status: 'Not Started',
      priority: 'High', 
      dueDate: '2025-05-02', 
      project: 'Westfield Commercial',
      assignedTo: 'Sarah Johnson'
    },
    { 
      id: 3, 
      title: 'Order materials for kitchen', 
      description: 'Order countertops, cabinets and fixtures for main kitchen', 
      status: 'Not Started',
      priority: 'Medium', 
      dueDate: '2025-05-05', 
      project: 'Highland Residence',
      assignedTo: 'Miguel Santos'
    },
    { 
      id: 4, 
      title: 'Schedule inspections', 
      description: 'Arrange for electrical and plumbing inspections', 
      status: 'Blocked',
      priority: 'Medium', 
      dueDate: '2025-05-07', 
      project: 'Riverside Apartments',
      assignedTo: 'Jennifer Lee'
    },
    { 
      id: 5, 
      title: 'Finalize floor plans', 
      description: 'Review and approve final floor plans with client', 
      status: 'Completed',
      priority: 'Low', 
      dueDate: '2025-05-10', 
      project: 'Downtown Renovation',
      assignedTo: 'David Williams'
    },
  ]
  
  const dashboardMetrics = [
    { id: 1, name: t('metrics.activeProjects'), value: 12, change: '+2', trend: 'up' },
    { id: 2, name: t('metrics.tasksDue'), value: 28, change: '+5', trend: 'up' },
    { id: 3, name: t('metrics.budgetUtilization'), value: '68%', change: '+3%', trend: 'up' },
    { id: 4, name: t('metrics.teamUtilization'), value: '82%', change: '-2%', trend: 'down' },
  ]
  
  return (
    <div className="pb-6">
      {/* Page header with connection status */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto relative">
        {/* Online/Offline Connection Status Indicator */}
        <ConnectionStatus />
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(24,62,105)] mb-2">
              {greeting}
            </h1>
            <p className="text-gray-500">
              {t('summary')}
              {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-lg hover:bg-[rgb(19,49,84)] transition-colors"
          >
            {t('signOut')}
          </button>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(24,62,105)]"></div>
              <p className="mt-2 text-[rgb(24,62,105)] font-medium">{t('loading')}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardMetrics.map((metric) => (
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
      
      {/* Projects section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[rgb(24,62,105)]">{t('recentProjects')}</h2>
          <a href="/projects" className="text-[rgb(236,107,44)] hover:text-[rgb(216,87,24)] transition-colors">
            {t('viewAll')}
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.slice(0, 4).map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              variant="standard"
            />
          ))}
        </div>
      </div>
      
      {/* Tasks and Materials section - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks widget */}
        <TaskList 
          tasks={tasks} 
          showFilters={true}
          maxItems={5}
          variant="standard"
        />
        
        {/* Materials widget */}
        <MaterialsManagement 
          projectId={1} 
          variant="widget"
        />
      </div>
    </div>
  )
}
