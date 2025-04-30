'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth/AuthContext'
import { WidgetProvider } from '../../lib/contexts/WidgetContext'
import DashboardLayout from '@/app/components/dashboard/DashboardLayout'
import IntlErrorBoundary from '@/app/components/shared/IntlErrorBoundary'
import { WidgetType } from '@/lib/types/widget'

// Dashboard component that follows the BuildTrack Pro design system
export default function DashboardHome() {
  const { user, logout } = useAuth()
  const [greeting, setGreeting] = useState('Good day')
  const [state, setState] = useState({ user })
  
  // Update state when user changes
  useEffect(() => {
    setState({ user })
  }, [user])
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  // Calculate greeting based on time of day using useEffect for client-side rendering
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // Default widget configuration for the dashboard
  const defaultWidgets = [
    {
      id: 'responsive-demo',
      type: WidgetType.CUSTOM,
      title: 'Mobile Responsive Demo',
      layout: { x: 0, y: 0, w: 6, h: 6 },
      settings: { refreshRate: 60, widgetName: 'Responsive Widget' }
    },
    { 
      id: 'active-projects', 
      type: WidgetType.ACTIVE_PROJECTS, 
      title: 'Active Projects',
      layout: { x: 6, y: 0, w: 6, h: 6 },
      settings: { refreshRate: 60, limit: 5 } 
    },
    { 
      id: 'project-health', 
      type: WidgetType.PROJECT_HEALTH, 
      title: 'Project Health',
      layout: { x: 6, y: 0, w: 6, h: 6 }, 
      settings: { refreshRate: 60 } 
    },
    { 
      id: 'my-tasks', 
      type: WidgetType.MY_TASKS, 
      title: 'My Tasks',
      layout: { x: 0, y: 6, w: 6, h: 6 }, 
      settings: { refreshRate: 60, limit: 5 } 
    },
    { 
      id: 'team-tasks', 
      type: WidgetType.TEAM_TASKS, 
      title: 'Team Workload',
      layout: { x: 6, y: 6, w: 6, h: 6 }, 
      settings: { refreshRate: 60 } 
    },
    { 
      id: 'project-timeline', 
      type: WidgetType.PROJECT_TIMELINE, 
      title: 'Project Timeline',
      layout: { x: 0, y: 12, w: 8, h: 6 }, 
      settings: { refreshRate: 300 } 
    },
    { 
      id: 'critical-path', 
      type: WidgetType.CRITICAL_PATH, 
      title: 'Critical Path',
      layout: { x: 8, y: 12, w: 4, h: 6 }, 
      settings: { refreshRate: 300 } 
    },
    { 
      id: 'financial-dashboard', 
      type: WidgetType.FINANCIAL_DASHBOARD, 
      title: 'Financial Overview',
      layout: { x: 0, y: 18, w: 6, h: 8 }, 
      settings: { refreshRate: 600, defaultTimeframe: 'month', currencyCode: 'USD' } 
    },
    { 
      id: 'progress-reports', 
      type: WidgetType.PROGRESS_REPORTS, 
      title: 'Progress Reports',
      layout: { x: 6, y: 18, w: 6, h: 8 }, 
      settings: { refreshRate: 600, showLegend: true } 
    },
    { 
      id: 'team-performance', 
      type: WidgetType.TEAM_PERFORMANCE, 
      title: 'Team Performance',
      layout: { x: 0, y: 26, w: 6, h: 6 }, 
      settings: { refreshRate: 600, defaultMetric: 'completion' } 
    },
    { 
      id: 'notification-center', 
      type: WidgetType.NOTIFICATION_CENTER, 
      title: 'Notifications',
      layout: { x: 6, y: 26, w: 6, h: 6 }, 
      settings: { refreshRate: 60 } 
    }
  ];
  
  return (
    <div className="pb-6">
      {/* Page header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(24,62,105)]">{greeting}, {state.user?.firstName || 'User'}</h1>
          <p className="text-gray-500">Here's what's happening with your projects today.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-lg hover:bg-[rgb(19,49,84)] transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      {/* Dashboard with widgets */}
      <IntlErrorBoundary>
        <WidgetProvider>
          <DashboardLayout />
        </WidgetProvider>
      </IntlErrorBoundary>
    </div>
  )
}
