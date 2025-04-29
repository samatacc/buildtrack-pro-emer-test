'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Info, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, Milestone, MilestoneStatus } from '@/lib/types/project';

/**
 * MilestonesStep Component
 * 
 * Allows users to create and manage project milestones with dates,
 * descriptions, and deliverables.
 */

interface MilestonesStepProps {
  formData: Partial<Project>;
  updateFormData: (data: Partial<Project>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

export default function MilestonesStep({
  formData,
  updateFormData,
  updateStepValidation
}: MilestonesStepProps) {
  const { t } = useNamespacedTranslations('projects');
  
  // Initialize milestones from form data or with an empty array
  const [milestones, setMilestones] = useState<Milestone[]>(formData.milestones || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // New milestone form data
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    name: '',
    description: '',
    targetDate: '',
    status: MilestoneStatus.NOT_STARTED,
    deliverables: []
  });
  
  // New deliverable input
  const [newDeliverable, setNewDeliverable] = useState('');
  
  // Update parent form data
  useEffect(() => {
    updateFormData({ milestones });
    
    // Milestones are optional, so this step is always valid
    updateStepValidation(true);
  }, [milestones, updateFormData, updateStepValidation]);
  
  // Sort milestones by target date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );
  
  // Validate new milestone
  const validateNewMilestone = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!newMilestone.name?.trim()) {
      newErrors.name = t('validation.nameRequired');
    }
    
    if (!newMilestone.targetDate) {
      newErrors.targetDate = t('validation.dateRequired');
    } else if (
      formData.startDate && 
      new Date(newMilestone.targetDate) < new Date(formData.startDate)
    ) {
      newErrors.targetDate = t('validation.dateAfterStart');
    } else if (
      formData.targetEndDate && 
      new Date(newMilestone.targetDate) > new Date(formData.targetEndDate)
    ) {
      newErrors.targetDate = t('validation.dateBeforeEnd');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Add a new deliverable to the current milestone form
  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    
    setNewMilestone(prev => ({
      ...prev,
      deliverables: [...(prev.deliverables || []), { 
        id: `deliverable-${Date.now()}`,
        name: newDeliverable.trim(),
        completed: false
      }]
    }));
    
    setNewDeliverable('');
  };
  
  // Remove a deliverable from the current milestone form
  const removeDeliverable = (id: string) => {
    setNewMilestone(prev => ({
      ...prev,
      deliverables: prev.deliverables?.filter(d => d.id !== id) || []
    }));
  };
  
  // Add a new milestone
  const addMilestone = () => {
    if (!validateNewMilestone()) return;
    
    const milestone: Milestone = {
      id: `milestone-${Date.now()}`,
      name: newMilestone.name || '',
      description: newMilestone.description || '',
      targetDate: new Date(newMilestone.targetDate || ''),
      status: MilestoneStatus.NOT_STARTED,
      deliverables: newMilestone.deliverables || [],
      dateCreated: new Date()
    };
    
    setMilestones([...milestones, milestone]);
    setNewMilestone({
      name: '',
      description: '',
      targetDate: '',
      status: MilestoneStatus.NOT_STARTED,
      deliverables: []
    });
    setShowAddForm(false);
  };
  
  // Remove a milestone
  const removeMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };
  
  // Handle input change for new milestone
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMilestone(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge classes
  const getStatusBadge = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.COMPLETED:
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: t('milestoneStatus.completed'),
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case MilestoneStatus.IN_PROGRESS:
        return {
          icon: <Calendar className="h-4 w-4" />,
          text: t('milestoneStatus.inProgress'),
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case MilestoneStatus.DELAYED:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: t('milestoneStatus.delayed'),
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800'
        };
      case MilestoneStatus.NOT_STARTED:
      default:
        return {
          icon: <Calendar className="h-4 w-4" />,
          text: t('milestoneStatus.notStarted'),
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.milestones')}</h2>
        <p className="text-gray-600">{t('milestonesDescription')}</p>
      </div>
      
      {/* Milestones Timeline */}
      <div className="relative">
        {sortedMilestones.length > 0 ? (
          <div className="space-y-8">
            {/* Timeline line */}
            <div className="absolute left-7 top-7 bottom-7 w-0.5 bg-gray-200 z-0"></div>
            
            {/* Milestone cards */}
            {sortedMilestones.map((milestone, index) => {
              const statusBadge = getStatusBadge(milestone.status);
              
              return (
                <div key={milestone.id} className="relative z-10 flex">
                  {/* Timeline node */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white border-2 border-[rgb(24,62,105)] flex items-center justify-center">
                    <span className="text-[rgb(24,62,105)] font-semibold">{index + 1}</span>
                  </div>
                  
                  {/* Milestone card */}
                  <div className="ml-4 flex-grow bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bgColor} ${statusBadge.textColor}`}
                        >
                          {statusBadge.icon}
                          <span className="ml-1">{statusBadge.text}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => removeMilestone(milestone.id)}
                        className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"
                        aria-label="Remove milestone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{milestone.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span>{formatDate(milestone.targetDate)}</span>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                      )}
                      
                      {/* Deliverables */}
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('deliverables')}</h4>
                          <ul className="space-y-1.5">
                            {milestone.deliverables.map(deliverable => (
                              <li 
                                key={deliverable.id}
                                className="flex items-start text-sm"
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                                <span className="text-gray-700">{deliverable.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">{t('noMilestones')}</h3>
            <p className="text-gray-600 text-sm mb-4">{t('addMilestonesDescription')}</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)] transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t('addFirstMilestone')}
            </button>
          </div>
        )}
      </div>
      
      {/* Add Milestone Form */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('addMilestone')}</h3>
          
          {/* Milestone Name */}
          <div>
            <label htmlFor="milestoneName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('milestoneName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="milestoneName"
              name="name"
              value={newMilestone.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('milestoneNamePlaceholder')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          {/* Target Date */}
          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-1">
              {t('targetDate')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="targetDate"
                name="targetDate"
                value={newMilestone.targetDate}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                  errors.targetDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.targetDate && (
              <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="milestoneDescription" className="block text-sm font-medium text-gray-700 mb-1">
              {t('milestoneDescription')}
            </label>
            <textarea
              id="milestoneDescription"
              name="description"
              value={newMilestone.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
              placeholder={t('milestoneDescriptionPlaceholder')}
            ></textarea>
          </div>
          
          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('deliverables')}
            </label>
            
            {/* Deliverables List */}
            {newMilestone.deliverables && newMilestone.deliverables.length > 0 && (
              <ul className="mb-3 space-y-2">
                {newMilestone.deliverables.map(deliverable => (
                  <li 
                    key={deliverable.id}
                    className="flex items-center bg-gray-50 p-2 rounded-md"
                  >
                    <span className="flex-grow text-gray-700">{deliverable.name}</span>
                    <button
                      onClick={() => removeDeliverable(deliverable.id)}
                      className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"
                      aria-label="Remove deliverable"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Add Deliverable Input */}
            <div className="flex">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDeliverable();
                  }
                }}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
                placeholder={t('deliverablePlaceholder')}
              />
              <button
                onClick={addDeliverable}
                className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('deliverableHint')}</p>
          </div>
          
          {/* Form Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewMilestone({
                  name: '',
                  description: '',
                  targetDate: '',
                  status: MilestoneStatus.NOT_STARTED,
                  deliverables: []
                });
                setErrors({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={addMilestone}
              className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)]"
            >
              {t('addMilestone')}
            </button>
          </div>
        </div>
      )}
      
      {/* Add Milestone Button (only show if form is not visible) */}
      {!showAddForm && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md hover:bg-[rgb(19,50,86)] transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-1.5" />
            {t('addMilestone')}
          </button>
        </div>
      )}
      
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">{t('tip')}</h4>
          <p className="text-sm text-blue-700 mt-1">{t('milestonesTip')}</p>
        </div>
      </div>
    </div>
  );
}
