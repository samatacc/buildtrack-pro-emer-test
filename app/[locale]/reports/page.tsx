'use client';

import React, { useState } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DataExportComponent } from '@/app/routeLoader';
import { MobileChartComponent } from '@/app/routeLoader';
import { PrintableReport } from '@/app/routeLoader';
import { useFieldMode } from '@/app/components/mobile/FieldModeProvider';

/**
 * Reports & Analytics Page
 * 
 * Provides a comprehensive interface for accessing all reporting and analytics
 * features of BuildTrack Pro, including data visualization, exports, and printable reports.
 * 
 * Follows BuildTrack Pro's design principles:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 * - Mobile-first responsive design
 * - Accessibility compliance
 */

type ReportTabType = 'dashboard' | 'export' | 'print' | 'analytics';
type ProjectReportType = 'project_summary' | 'task_status' | 'budget_overview' | 'material_usage';

export default function ReportsPage() {
  const { t } = useNamespacedTranslations('reports');
  const params = useParams();
  const { isFieldModeEnabled, isOnline } = useFieldMode();
  
  // Report state
  const [activeTab, setActiveTab] = useState<ReportTabType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('project-1');
  const [selectedReportType, setSelectedReportType] = useState<ProjectReportType>('project_summary');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Mock data for projects
  const projects = [
    { id: 'project-1', name: 'Central City Tower', progress: 45 },
    { id: 'project-2', name: 'Riverside Bridge Renovation', progress: 78 },
    { id: 'project-3', name: 'Harbor View Apartments', progress: 32 },
    { id: 'project-4', name: 'Medical Center Expansion', progress: 65 }
  ];
  
  // Mock data for dashboard charts
  const dashboardCharts = [
    {
      id: 'project-progress',
      title: t('projectProgress'),
      type: 'bar',
      data: {
        labels: projects.map(p => p.name),
        datasets: [{
          label: t('completionPercentage'),
          data: projects.map(p => p.progress),
          backgroundColor: 'rgb(24,62,105)'
        }]
      }
    },
    {
      id: 'task-distribution',
      title: t('taskDistribution'),
      type: 'pie',
      data: {
        labels: [t('tasks.status.completed'), t('tasks.status.inprogress'), t('tasks.status.blocked'), t('tasks.status.notstarted')],
        datasets: [{
          label: t('tasks'),
          data: [154, 87, 24, 77],
          backgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#9E9E9E']
        }]
      }
    },
    {
      id: 'budget-overview',
      title: t('budgetOverview'),
      type: 'doughnut',
      data: {
        labels: [t('spent'), t('remaining')],
        datasets: [{
          label: t('budget'),
          data: [12825000, 15675000],
          backgroundColor: ['rgb(236,107,44)', 'rgb(24,62,105)']
        }]
      }
    },
    {
      id: 'material-usage',
      title: t('materialUsage'),
      type: 'pie',
      data: {
        labels: ['Concrete', 'Steel', 'Glass', 'Wood', 'Electrical', 'Plumbing'],
        datasets: [{
          label: t('materials'),
          data: [35, 25, 15, 10, 8, 7],
          backgroundColor: ['#607D8B', '#9E9E9E', '#00BCD4', '#795548', '#FFC107', '#3F51B5']
        }]
      }
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[rgb(24,62,105)]">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('reportsDescription')}</p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 py-2 px-4 font-medium ${
              activeTab === 'dashboard'
                ? 'text-[rgb(236,107,44)] border-b-2 border-[rgb(236,107,44)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            {t('dashboard')}
          </button>
          
          <button
            className={`mr-2 py-2 px-4 font-medium ${
              activeTab === 'export'
                ? 'text-[rgb(236,107,44)] border-b-2 border-[rgb(236,107,44)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('export')}
          >
            {t('exportData')}
          </button>
          
          <button
            className={`mr-2 py-2 px-4 font-medium ${
              activeTab === 'print'
                ? 'text-[rgb(236,107,44)] border-b-2 border-[rgb(236,107,44)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('print')}
          >
            {t('printReport')}
          </button>
          
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'analytics'
                ? 'text-[rgb(236,107,44)] border-b-2 border-[rgb(236,107,44)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            {t('advancedAnalytics')}
          </button>
        </div>
      </div>
      
      {/* Project selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectProject')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map(project => (
            <button
              key={project.id}
              className={`p-4 rounded-lg border ${
                selectedProjectId === project.id
                  ? 'border-[rgb(236,107,44)] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <h3 className="font-medium text-lg">{project.name}</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{t('progress')}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[rgb(24,62,105)] h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Date range selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)]"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')}</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)]"
            />
          </div>
          
          {activeTab === 'print' && (
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportType')}</label>
              <select
                value={selectedReportType}
                onChange={e => setSelectedReportType(e.target.value as ProjectReportType)}
                className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:ring-[rgb(24,62,105)] focus:border-[rgb(24,62,105)]"
              >
                <option value="project_summary">{t('projectSummary')}</option>
                <option value="task_status">{t('taskStatus')}</option>
                <option value="budget_overview">{t('budgetOverview')}</option>
                <option value="material_usage">{t('materialUsage')}</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dashboardCharts.map(chart => (
                <div key={chart.id}>
                  <MobileChartComponent
                    title={chart.title}
                    chartId={chart.id}
                    initialData={chart.data}
                    options={{ 
                      type: chart.type as any,
                      showLegend: true,
                      height: 300
                    }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Export Tab */}
        {activeTab === 'export' && (
          <div>
            <DataExportComponent
              projectId={selectedProjectId}
              availableTypes={['project', 'tasks', 'materials', 'documents', 'team', 'financial']}
              className="bg-white rounded-lg shadow-md"
            />
          </div>
        )}
        
        {/* Print Tab */}
        {activeTab === 'print' && (
          <div>
            <PrintableReport
              projectId={selectedProjectId}
              reportType={selectedReportType}
              dateRange={{
                start: new Date(dateRange.start),
                end: new Date(dateRange.end)
              }}
              paperSize="a4"
              orientation="portrait"
              includeHeader={true}
              includeFooter={true}
              includeCompanyLogo={true}
              includePageNumbers={true}
              includePrintDate={true}
              className="shadow-xl rounded-lg overflow-hidden"
            />
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{t('advancedAnalytics')}</h3>
              <p className="mt-2 text-gray-600">
                {t('advancedAnalyticsComingSoon')}
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(24,62,105)] hover:bg-[rgb(19,50,84)]"
                >
                  {t('returnToDashboard')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
