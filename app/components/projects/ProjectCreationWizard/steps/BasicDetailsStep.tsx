'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Info } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, ProjectType, ProjectPriority } from '@/lib/types/project';

/**
 * BasicDetailsStep Component
 * 
 * Collects essential project information including name, description, type, 
 * priority, start date, and estimated completion date.
 */

interface BasicDetailsStepProps {
  formData: Partial<Project>;
  updateFormData: (data: Partial<Project>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

export default function BasicDetailsStep({
  formData,
  updateFormData,
  updateStepValidation
}: BasicDetailsStepProps) {
  const { t } = useNamespacedTranslations('projects');
  
  // Local form state
  const [name, setName] = useState(formData.name || '');
  const [description, setDescription] = useState(formData.description || '');
  const [type, setType] = useState<ProjectType>(formData.type || ProjectType.RESIDENTIAL);
  const [priority, setPriority] = useState<ProjectPriority>(formData.priority || ProjectPriority.MEDIUM);
  const [startDate, setStartDate] = useState(
    formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''
  );
  const [targetEndDate, setTargetEndDate] = useState(
    formData.targetEndDate ? new Date(formData.targetEndDate).toISOString().split('T')[0] : ''
  );
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validate inputs and update parent form
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!name.trim()) {
      newErrors.name = t('validation.nameRequired');
    } else if (name.length < 3) {
      newErrors.name = t('validation.nameLength');
    }
    
    if (!description.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    }
    
    if (!startDate) {
      newErrors.startDate = t('validation.startDateRequired');
    }
    
    if (!targetEndDate) {
      newErrors.targetEndDate = t('validation.endDateRequired');
    } else if (startDate && targetEndDate && new Date(targetEndDate) <= new Date(startDate)) {
      newErrors.targetEndDate = t('validation.endDateAfterStart');
    }
    
    setErrors(newErrors);
    
    // Update parent validation state
    const isValid = Object.keys(newErrors).length === 0;
    updateStepValidation(isValid);
    
    // Update parent form data if valid
    if (isValid) {
      updateFormData({
        name,
        description,
        type,
        priority,
        startDate: startDate ? new Date(startDate) : undefined,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined
      });
    }
  }, [name, description, type, priority, startDate, targetEndDate, updateFormData, updateStepValidation, t]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.basics')}</h2>
        <p className="text-gray-600">{t('basicDetailsDescription')}</p>
      </div>
      
      {/* Project Name */}
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
          {t('projectName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={t('projectNamePlaceholder')}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      {/* Project Description */}
      <div>
        <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
          {t('projectDescription')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="projectDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={t('projectDescriptionPlaceholder')}
        ></textarea>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
      
      {/* Project Type and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Type */}
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
            {t('projectType')} <span className="text-red-500">*</span>
          </label>
          <select
            id="projectType"
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
          >
            {Object.values(ProjectType).map((projectType) => (
              <option key={projectType} value={projectType}>
                {t(`projectTypes.${projectType.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Project Priority */}
        <div>
          <label htmlFor="projectPriority" className="block text-sm font-medium text-gray-700 mb-1">
            {t('projectPriority')} <span className="text-red-500">*</span>
          </label>
          <div className="flex justify-between items-center gap-4">
            {Object.values(ProjectPriority).map((priorityValue) => (
              <button
                key={priorityValue}
                type="button"
                onClick={() => setPriority(priorityValue)}
                className={`flex-1 py-2 px-4 rounded-md border ${
                  priority === priorityValue
                    ? priorityValue === ProjectPriority.HIGH
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : priorityValue === ProjectPriority.MEDIUM
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700'
                } transition-colors`}
              >
                {t(`priority.${priorityValue.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Project Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            {t('startDate')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>
        
        {/* End Date */}
        <div>
          <label htmlFor="targetEndDate" className="block text-sm font-medium text-gray-700 mb-1">
            {t('targetEndDate')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              id="targetEndDate"
              value={targetEndDate}
              onChange={(e) => setTargetEndDate(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors.targetEndDate ? 'border-red-300' : 'border-gray-300'
              }`}
              min={startDate} // Prevent selecting a date before start date
            />
          </div>
          {errors.targetEndDate && (
            <p className="mt-1 text-sm text-red-600">{errors.targetEndDate}</p>
          )}
        </div>
      </div>
      
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">{t('tip')}</h4>
          <p className="text-sm text-blue-700 mt-1">{t('basicDetailsTip')}</p>
        </div>
      </div>
    </div>
  );
}
