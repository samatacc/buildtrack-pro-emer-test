'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  MapPin, 
  MoreHorizontal, 
  Plus, 
  Search,
  Users,
  Filter,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock4
} from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import projectService from '@/lib/services/projectService';
import { ProjectSummary, ProjectHealth, ProjectStatus, ProjectType } from '@/lib/types/project';

/**
 * ProjectList Component
 * 
 * Displays a filterable, searchable list of projects with cards showing key project information.
 * Follows BuildTrack Pro's design system with Primary Blue (rgb(24,62,105)) and Primary Orange (rgb(236,107,44)).
 * 
 * Features:
 * - Responsive grid layout for project cards
 * - Status and health indicators
 * - Progress bars and completion percentages
 * - Quick action buttons
 * - Filtering by status, health, and search
 * - Create new project button
 */

interface ProjectListProps {
  locale: string;
}

export default function ProjectList({ locale }: ProjectListProps) {
  const { t } = useNamespacedTranslations('projects');
  const router = useRouter();
  
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<ProjectStatus[]>([]);
  const [healthFilters, setHealthFilters] = useState<ProjectHealth[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Load projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const data = await projectService.getProjectSummaries();
        setProjects(data);
        setFilteredProjects(data);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
        console.error('Error loading projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Apply filters when search or filters change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setIsLoading(true);
        
        const filters: {
          status?: ProjectStatus[];
          health?: ProjectHealth[];
          search?: string;
        } = {};
        
        if (statusFilters.length > 0) {
          filters.status = statusFilters;
        }
        
        if (healthFilters.length > 0) {
          filters.health = healthFilters;
        }
        
        if (searchQuery.trim()) {
          filters.search = searchQuery.trim();
        }
        
        // If we have any filters, apply them
        if (Object.keys(filters).length > 0) {
          const data = await projectService.getProjectSummaries(filters);
          setFilteredProjects(data);
        } else {
          // Otherwise show all projects
          setFilteredProjects(projects);
        }
      } catch (err) {
        setError('Failed to apply filters. Please try again.');
        console.error('Error applying filters:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    applyFilters();
  }, [searchQuery, statusFilters, healthFilters, projects]);
  
  // Toggle status filter
  const toggleStatusFilter = (status: ProjectStatus) => {
    setStatusFilters(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  // Toggle health filter
  const toggleHealthFilter = (health: ProjectHealth) => {
    setHealthFilters(prev => 
      prev.includes(health)
        ? prev.filter(h => h !== health)
        : [...prev, health]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilters([]);
    setHealthFilters([]);
    setIsFilterOpen(false);
  };
  
  // Navigate to create project
  const handleCreateProject = () => {
    router.push(`/${locale}/dashboard/projects/create`);
  };
  
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get status badge classes and text
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return {
          text: t('status.planning'),
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case ProjectStatus.ACTIVE:
        return {
          text: t('status.active'),
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case ProjectStatus.ON_HOLD:
        return {
          text: t('status.onHold'),
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case ProjectStatus.DELAYED:
        return {
          text: t('status.delayed'),
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800'
        };
      case ProjectStatus.COMPLETED:
        return {
          text: t('status.completed'),
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800'
        };
      case ProjectStatus.CANCELLED:
        return {
          text: t('status.cancelled'),
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      default:
        return {
          text: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };
  
  // Get health indicator icon and color
  const getHealthIndicator = (health: ProjectHealth) => {
    switch (health) {
      case ProjectHealth.ON_TRACK:
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          text: t('health.onTrack'),
          textColor: 'text-green-600'
        };
      case ProjectHealth.AT_RISK:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          text: t('health.atRisk'),
          textColor: 'text-amber-500'
        };
      case ProjectHealth.DELAYED:
        return {
          icon: <Clock4 className="h-5 w-5 text-orange-600" />,
          text: t('health.delayed'),
          textColor: 'text-orange-600'
        };
      case ProjectHealth.CRITICAL:
        return {
          icon: <X className="h-5 w-5 text-red-600" />,
          text: t('health.critical'),
          textColor: 'text-red-600'
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          text: health,
          textColor: 'text-gray-500'
        };
    }
  };
  
  // Format date to locale string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render project card
  const renderProjectCard = (project: ProjectSummary) => {
    const statusBadge = getStatusBadge(project.status);
    const healthIndicator = getHealthIndicator(project.health);
    
    return (
      <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${project.health === ProjectHealth.ON_TRACK ? 'bg-green-500' : project.health === ProjectHealth.AT_RISK ? 'bg-amber-500' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadge.bgColor} ${statusBadge.textColor}`}>
              {statusBadge.text}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Project Name and Client */}
        <div className="p-4">
          <Link 
            href={`/${locale}/dashboard/projects/${project.id}`}
            className="block text-lg font-semibold text-[rgb(24,62,105)] hover:text-[rgb(19,50,86)] truncate"
          >
            {project.name}
          </Link>
          {project.client && (
            <p className="text-sm text-gray-600 mt-1">
              {project.client.name}
            </p>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{t('progress')}</span>
            <span className="text-sm font-medium text-gray-700">{project.completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                project.health === ProjectHealth.ON_TRACK 
                  ? 'bg-green-500' 
                  : project.health === ProjectHealth.AT_RISK 
                    ? 'bg-amber-500' 
                    : 'bg-orange-500'
              }`}
              style={{ width: `${project.completion}%` }}
            ></div>
          </div>
        </div>
        
        {/* Project Details */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{formatDate(project.targetEndDate)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{project.location.city}, {project.location.state}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{project.teamSize} {t('team')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BarChart3 className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">{formatCurrency(project.budget.spentBudget, project.budget.currency)}</span>
            </div>
          </div>
        </div>
        
        {/* Task Summary */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <span className="font-medium text-gray-700">{t('tasks')}</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                {project.tasks.completed}/{project.tasks.total}
              </span>
            </div>
            {project.tasks.overdue > 0 && (
              <div className="flex items-center text-red-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{project.tasks.overdue} {t('overdue')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('projectsTitle')}</h1>
        
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)] transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-1.5" />
          {t('createProject')}
        </button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(236,107,44)] focus:border-transparent"
              placeholder={t('searchProjects')}
            />
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 border ${isFilterOpen || statusFilters.length > 0 || healthFilters.length > 0 ? 'border-[rgb(236,107,44)] bg-orange-50 text-[rgb(236,107,44)]' : 'border-gray-300 bg-white text-gray-700'} rounded-md flex items-center`}
          >
            <Filter className="h-5 w-5 mr-1.5" />
            {t('filter')}
            {(statusFilters.length > 0 || healthFilters.length > 0) && (
              <span className="ml-1.5 px-2 py-0.5 bg-[rgb(236,107,44)] text-white text-xs rounded-full">
                {statusFilters.length + healthFilters.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-900">{t('filters')}</h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-[rgb(236,107,44)] hover:text-[rgb(214,97,40)]"
              >
                {t('clearAll')}
              </button>
            </div>
            
            {/* Status Filters */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('status')}</h4>
              <div className="flex flex-wrap gap-2">
                {Object.values(ProjectStatus).map(status => {
                  const badge = getStatusBadge(status);
                  return (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                        statusFilters.includes(status)
                          ? `${badge.bgColor} ${badge.textColor} ring-2 ring-offset-1 ring-[rgb(24,62,105)]`
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {badge.text}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Health Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('health')}</h4>
              <div className="flex flex-wrap gap-2">
                {Object.values(ProjectHealth).map(health => {
                  const indicator = getHealthIndicator(health);
                  return (
                    <button
                      key={health}
                      onClick={() => toggleHealthFilter(health)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                        healthFilters.includes(health)
                          ? `bg-white ${indicator.textColor} ring-2 ring-offset-1 ring-[rgb(24,62,105)]`
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-1.5">{indicator.icon}</span>
                      {indicator.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[rgb(24,62,105)]"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      )}
      
      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium underline"
          >
            {t('retry')}
          </button>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Briefcase className="h-12 w-12 text-[rgb(24,62,105)]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery || statusFilters.length > 0 || healthFilters.length > 0
              ? t('noProjectsFound')
              : t('noProjects')}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchQuery || statusFilters.length > 0 || healthFilters.length > 0
              ? t('noProjectsMatchFilters')
              : t('createYourFirstProject')}
          </p>
          {(searchQuery || statusFilters.length > 0 || healthFilters.length > 0) ? (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              {t('clearFilters')}
            </button>
          ) : (
            <button
              onClick={handleCreateProject}
              className="mt-4 px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)] transition-colors"
            >
              {t('createProject')}
            </button>
          )}
        </div>
      )}
      
      {/* Project Grid */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => renderProjectCard(project))}
        </div>
      )}
    </div>
  );
}
