'use client';

import { useState } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import Link from 'next/link';

/**
 * ProjectCard Component
 * 
 * Displays project information in a card format with interactive elements.
 * Follows BuildTrack Pro's design principles with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)) color scheme.
 * 
 * Features:
 * - Responsive design for mobile-first approach
 * - Interactive progress indicators
 * - Status badges with appropriate colors
 * - Quick-access actions for common tasks
 * - Internationalization support
 */
interface ProjectCardProps {
  project: {
    id: number | string;
    name: string;
    status: string;
    completion: number;
    dueDate: string;
    client?: string;
    budget?: {
      total: number;
      spent: number;
      currency: string;
    };
    location?: string;
  };
  variant?: 'compact' | 'standard' | 'detailed';
  showActions?: boolean;
  className?: string;
}

export default function ProjectCard({
  project,
  variant = 'standard',
  showActions = true,
  className = '',
}: ProjectCardProps) {
  const { t } = useNamespacedTranslations('projects');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format date to locale string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Determine status badge color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Check if project is near deadline (within 7 days)
  const isNearDeadline = () => {
    const today = new Date();
    const dueDate = new Date(project.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Calculate days remaining or overdue
  const getDaysRemaining = () => {
    const today = new Date();
    const dueDate = new Date(project.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return t('daysRemaining', { count: diffDays });
    } else if (diffDays === 0) {
      return t('dueToday');
    } else {
      return t('daysOverdue', { count: Math.abs(diffDays) });
    }
  };

  // Budget utilization percentage
  const getBudgetUtilization = () => {
    if (!project.budget) return null;
    return Math.round((project.budget.spent / project.budget.total) * 100);
  };
  
  // Format currency based on locale
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(undefined, { 
      style: 'currency', 
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Project Header */}
      <div className="px-4 py-3 bg-[rgb(24,62,105)] bg-opacity-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-[rgb(24,62,105)] mb-1 truncate">{project.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
            {t(`status.${project.status.toLowerCase().replace(' ', '')}`)}
          </span>
        </div>
        {project.client && variant !== 'compact' && (
          <p className="text-sm text-gray-600">{t('client')}: {project.client}</p>
        )}
      </div>
      
      {/* Project Details */}
      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">{t('progress')}</span>
            <span className="text-sm font-medium">{project.completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-[rgb(236,107,44)] h-2.5 rounded-full" 
              style={{ width: `${project.completion}%` }}
            ></div>
          </div>
        </div>
        
        {/* Date Information */}
        <div className="mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('dueDate')}</span>
            <span className={`text-sm font-medium ${isNearDeadline() ? 'text-red-600' : ''}`}>
              {formatDate(project.dueDate)}
            </span>
          </div>
          {variant !== 'compact' && (
            <p className={`text-xs mt-1 text-right ${isNearDeadline() ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              {getDaysRemaining()}
            </p>
          )}
        </div>
        
        {/* Budget Information - only show in standard and detailed variants */}
        {variant !== 'compact' && project.budget && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">{t('budget')}</span>
              <span className="text-sm font-medium">
                {formatCurrency(project.budget.spent, project.budget.currency)} / 
                {formatCurrency(project.budget.total, project.budget.currency)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  getBudgetUtilization()! > 90 ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${getBudgetUtilization()}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1 text-right text-gray-500">
              {getBudgetUtilization()}% {t('utilized')}
            </p>
          </div>
        )}
        
        {/* Location - only in detailed variant */}
        {variant === 'detailed' && project.location && (
          <div className="mb-4">
            <span className="text-sm text-gray-600">{t('location')}: </span>
            <span className="text-sm">{project.location}</span>
          </div>
        )}
        
        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 flex justify-between">
            <Link
              href={`/projects/${project.id}`}
              className="text-sm text-[rgb(24,62,105)] hover:text-[rgb(19,49,84)] transition-colors"
            >
              {t('viewDetails')} →
            </Link>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? t('showLess') : t('showMore')}
            </button>
          </div>
        )}
        
        {/* Expanded Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href={`/projects/${project.id}/tasks`}
                className="text-center py-2 bg-[rgb(24,62,105)] text-white text-sm rounded hover:bg-[rgb(19,49,84)] transition-colors"
              >
                {t('viewTasks')}
              </Link>
              <Link
                href={`/projects/${project.id}/documents`}
                className="text-center py-2 bg-white border border-[rgb(24,62,105)] text-[rgb(24,62,105)] text-sm rounded hover:bg-gray-50 transition-colors"
              >
                {t('viewDocuments')}
              </Link>
              <Link
                href={`/projects/${project.id}/timeline`}
                className="text-center py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                {t('timeline')}
              </Link>
              <Link
                href={`/projects/${project.id}/team`}
                className="text-center py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                {t('team')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
