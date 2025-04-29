'use client';

import React from 'react';
import { Calendar, MapPin, Users, BarChart3, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, ProjectStatus, ProjectHealth, TeamRole, MilestoneStatus } from '@/lib/types/project';

/**
 * ReviewStep Component
 * 
 * Shows a comprehensive summary of all project details for review
 * before final submission.
 */

interface ReviewStepProps {
  formData: Partial<Project>;
  updateFormData: (data: Partial<Project>) => void;
}

export default function ReviewStep({
  formData,
  updateFormData
}: ReviewStepProps) {
  const { t } = useNamespacedTranslations('projects');
  
  // Format date to locale string
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number = 0, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get project manager
  const projectManager = formData.team?.find(member => member.role === TeamRole.PROJECT_MANAGER);
  
  // Get completion status
  const getCompletionStatus = () => {
    const missingFields = [];
    
    if (!formData.name) missingFields.push(t('projectName'));
    if (!formData.description) missingFields.push(t('projectDescription'));
    if (!formData.startDate) missingFields.push(t('startDate'));
    if (!formData.targetEndDate) missingFields.push(t('targetEndDate'));
    if (!formData.location?.address) missingFields.push(t('address'));
    if (!formData.location?.city) missingFields.push(t('city'));
    if (!formData.location?.state) missingFields.push(t('state'));
    if (!formData.location?.country) missingFields.push(t('country'));
    if (!projectManager) missingFields.push(t('projectManager'));
    if (!formData.budget?.totalBudget || formData.budget.totalBudget <= 0) missingFields.push(t('budget'));
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  };
  
  const completionStatus = getCompletionStatus();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.review')}</h2>
        <p className="text-gray-600">{t('reviewDescription')}</p>
      </div>
      
      {/* Completion Status */}
      <div className={`p-4 rounded-md ${
        completionStatus.isComplete 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        <div className="flex items-start">
          {completionStatus.isComplete ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          )}
          <div>
            <h4 className={`text-sm font-medium ${
              completionStatus.isComplete ? 'text-green-800' : 'text-amber-800'
            }`}>
              {completionStatus.isComplete ? t('projectComplete') : t('projectIncomplete')}
            </h4>
            {!completionStatus.isComplete && (
              <div className="mt-2">
                <p className="text-sm text-amber-700">{t('missingFields')}:</p>
                <ul className="mt-1 ml-4 list-disc text-sm text-amber-700">
                  {completionStatus.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Project Summary */}
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('projectSummary')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Info className="h-4 w-4 mr-2 text-[rgb(24,62,105)]" />
              {t('basicDetails')}
            </h4>
            
            {/* Project Name */}
            <div>
              <p className="text-xs text-gray-500">{t('projectName')}</p>
              <p className="text-base font-medium text-gray-900">{formData.name || t('notProvided')}</p>
            </div>
            
            {/* Project Type */}
            <div>
              <p className="text-xs text-gray-500">{t('projectType')}</p>
              <p className="text-base text-gray-900">
                {formData.type ? t(`projectTypes.${formData.type.toLowerCase()}`) : t('notProvided')}
              </p>
            </div>
            
            {/* Project Status */}
            <div>
              <p className="text-xs text-gray-500">{t('status')}</p>
              <div className="flex items-center">
                <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                  formData.status === ProjectStatus.ACTIVE ? 'bg-green-500' :
                  formData.status === ProjectStatus.PLANNING ? 'bg-blue-500' :
                  formData.status === ProjectStatus.ON_HOLD ? 'bg-yellow-500' :
                  formData.status === ProjectStatus.DELAYED ? 'bg-orange-500' :
                  formData.status === ProjectStatus.COMPLETED ? 'bg-purple-500' :
                  'bg-red-500'
                }`}></div>
                <p className="text-base text-gray-900">
                  {formData.status ? t(`status.${formData.status.toLowerCase()}`) : t('notProvided')}
                </p>
              </div>
            </div>
            
            {/* Project Health */}
            <div>
              <p className="text-xs text-gray-500">{t('health')}</p>
              <div className="flex items-center">
                <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                  formData.health === ProjectHealth.ON_TRACK ? 'bg-green-500' :
                  formData.health === ProjectHealth.AT_RISK ? 'bg-yellow-500' :
                  formData.health === ProjectHealth.DELAYED ? 'bg-orange-500' :
                  'bg-red-500'
                }`}></div>
                <p className="text-base text-gray-900">
                  {formData.health ? t(`health.${formData.health.toLowerCase()}`) : t('notProvided')}
                </p>
              </div>
            </div>
            
            {/* Project Dates */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t('startDate')}</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                  <p className="text-base text-gray-900">{formatDate(formData.startDate)}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t('targetEndDate')}</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                  <p className="text-base text-gray-900">{formatDate(formData.targetEndDate)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-[rgb(24,62,105)]" />
              {t('location')}
            </h4>
            
            {/* Address */}
            <div>
              <p className="text-xs text-gray-500">{t('address')}</p>
              <p className="text-base text-gray-900">
                {formData.location?.address || t('notProvided')}
                {formData.location?.address2 && `, ${formData.location.address2}`}
              </p>
            </div>
            
            {/* City, State, Zip */}
            <div>
              <p className="text-xs text-gray-500">{t('cityStateZip')}</p>
              <p className="text-base text-gray-900">
                {[
                  formData.location?.city,
                  formData.location?.state,
                  formData.location?.zipCode
                ].filter(Boolean).join(', ') || t('notProvided')}
              </p>
            </div>
            
            {/* Country */}
            <div>
              <p className="text-xs text-gray-500">{t('country')}</p>
              <p className="text-base text-gray-900">
                {formData.location?.country || t('notProvided')}
              </p>
            </div>
            
            {/* Site Details */}
            {formData.location?.siteDetails && formData.location.siteDetails.siteArea > 0 && (
              <div>
                <p className="text-xs text-gray-500">{t('siteArea')}</p>
                <p className="text-base text-gray-900">
                  {`${formData.location.siteDetails.siteArea} ${formData.location.siteDetails.areaUnit}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Team Summary */}
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('teamSummary')}</h3>
          <div className="text-sm text-gray-600 flex items-center">
            <Users className="h-4 w-4 mr-1.5" />
            {formData.team?.length || 0} {t('members')}
          </div>
        </div>
        
        {formData.team && formData.team.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formData.team.map(member => (
              <div key={member.userId} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {member.avatarUrl ? (
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[rgb(24,62,105)] text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    member.role === TeamRole.PROJECT_MANAGER
                      ? 'bg-blue-100 text-blue-800'
                      : member.role === TeamRole.SUPERVISOR
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {t(`teamRoles.${member.role.toLowerCase()}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
            {t('noTeamMembers')}
          </div>
        )}
      </div>
      
      {/* Budget Summary */}
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('budgetSummary')}</h3>
          <div className="text-lg font-semibold text-[rgb(24,62,105)]">
            {formatCurrency(formData.budget?.totalBudget, formData.budget?.currency)}
          </div>
        </div>
        
        {formData.budget ? (
          <>
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <BarChart3 className="h-4 w-4 mr-1.5" />
                {t('budgetBreakdown')}
              </div>
              <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden">
                {formData.budget.categories.map((category, index) => {
                  // Generate a color based on index
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-purple-500',
                    'bg-red-500',
                    'bg-indigo-500',
                    'bg-pink-500',
                    'bg-teal-500'
                  ];
                  const color = colors[index % colors.length];
                  
                  // Calculate percentage of total budget
                  const percentage = formData.budget?.totalBudget
                    ? (category.plannedAmount / formData.budget.totalBudget) * 100
                    : 0;
                  
                  return (
                    <div
                      key={category.id}
                      className={`h-full ${color} inline-block`}
                      style={{ width: `${percentage}%` }}
                      title={`${category.name}: ${formatCurrency(category.plannedAmount, formData.budget?.currency)}`}
                    ></div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.budget.categories.map((category, index) => {
                // Use the same colors as above for consistency
                const colors = [
                  'bg-blue-100 text-blue-800',
                  'bg-green-100 text-green-800',
                  'bg-yellow-100 text-yellow-800',
                  'bg-purple-100 text-purple-800',
                  'bg-red-100 text-red-800',
                  'bg-indigo-100 text-indigo-800',
                  'bg-pink-100 text-pink-800',
                  'bg-teal-100 text-teal-800'
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div 
                    key={category.id} 
                    className={`p-2 rounded-md ${color}`}
                  >
                    <p className="text-xs font-medium mb-1">{category.name}</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(category.plannedAmount, formData.budget?.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
            {t('noBudgetDefined')}
          </div>
        )}
      </div>
      
      {/* Milestones Summary */}
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('milestonesSummary')}</h3>
          <div className="text-sm text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            {formData.milestones?.length || 0} {t('milestones')}
          </div>
        </div>
        
        {formData.milestones && formData.milestones.length > 0 ? (
          <div className="space-y-3">
            {[...formData.milestones]
              .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
              .map(milestone => (
                <div key={milestone.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{milestone.name}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span>{formatDate(milestone.targetDate)}</span>
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      milestone.status === MilestoneStatus.COMPLETED
                        ? 'bg-green-100 text-green-800'
                        : milestone.status === MilestoneStatus.IN_PROGRESS
                          ? 'bg-blue-100 text-blue-800'
                          : milestone.status === MilestoneStatus.DELAYED
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`milestoneStatus.${milestone.status.toLowerCase()}`)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
            {t('noMilestones')}
          </div>
        )}
      </div>
      
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">{t('tip')}</h4>
          <p className="text-sm text-blue-700 mt-1">{t('reviewTip')}</p>
        </div>
      </div>
    </div>
  );
}
