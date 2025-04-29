'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import projectService from '@/lib/services/projectService';
import { Project, ProjectStatus, ProjectHealth } from '@/lib/types/project';

// Import step components
// Note: These will be implemented separately
// import BasicDetailsStep from './steps/BasicDetailsStep';
// import LocationStep from './steps/LocationStep';
// import TeamStep from './steps/TeamStep';
// import MilestonesStep from './steps/MilestonesStep';
// import BudgetStep from './steps/BudgetStep';
// import ReviewStep from './steps/ReviewStep';
// import TemplateSelectionStep from './steps/TemplateSelectionStep';

/**
 * ProjectCreationWizard Component
 * 
 * A multi-step form wizard for creating new projects in BuildTrack Pro.
 * Follows BuildTrack Pro's design system with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)) color scheme.
 * 
 * Features:
 * - Step-by-step guided creation process
 * - Progress tracking
 * - Template selection option
 * - Validation at each step
 * - Mobile responsive design
 */

interface ProjectCreationWizardProps {
  locale: string;
}

// Wizard steps
const WIZARD_STEPS = [
  'template',
  'basics',
  'location',
  'team',
  'milestones',
  'budget',
  'review'
];

export default function ProjectCreationWizard({ locale }: ProjectCreationWizardProps) {
  const { t } = useNamespacedTranslations('projects');
  const router = useRouter();
  
  // State for wizard
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState<Partial<Project>>({
    status: ProjectStatus.PLANNING,
    health: ProjectHealth.ON_TRACK,
    team: [],
    milestones: [],
    completion: 0,
    settings: {
      isPublic: false,
      allowGuestComments: false,
      notificationPreferences: {
        dailyDigest: true,
        milestoneAlerts: true,
        taskAssignments: true,
        budgetAlerts: true
      }
    }
  });
  
  // Step validation state
  const [stepsValid, setStepsValid] = useState({
    template: true, // Optional step
    basics: false,
    location: false,
    team: false,
    milestones: true, // Optional step
    budget: false,
    review: true // Always valid as it's just a review
  });
  
  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToStep = (step: number) => {
    if (step >= 0 && step < WIZARD_STEPS.length) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };
  
  // Update form data
  const updateFormData = (data: Partial<Project>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };
  
  // Update step validation
  const updateStepValidation = (step: string, isValid: boolean) => {
    setStepsValid(prev => ({
      ...prev,
      [step]: isValid
    }));
  };
  
  // Check if current step is valid
  const isCurrentStepValid = (): boolean => {
    const currentStepName = WIZARD_STEPS[currentStep];
    return stepsValid[currentStepName as keyof typeof stepsValid];
  };
  
  // Submit the form
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create the project
      const project = await projectService.createProject(formData as any);
      
      // Redirect to the project page
      router.push(`/${locale}/dashboard/projects/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(t('createProjectError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel and go back
  const handleCancel = () => {
    router.push(`/${locale}/dashboard/projects`);
  };
  
  // Render the current step
  const renderStep = () => {
    // This will be implemented when we create the individual step components
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">{t(`steps.${WIZARD_STEPS[currentStep]}`)}</h3>
        <p className="mt-2 text-gray-600">
          Step component for '{WIZARD_STEPS[currentStep]}' will be implemented separately.
        </p>
      </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('createProject')}</h1>
        <p className="text-gray-600">{t('createProjectDescription')}</p>
      </div>
      
      {/* Progress Indicators */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              {/* Step connector line */}
              {index > 0 && (
                <div 
                  className={`w-10 h-1 ${
                    index <= currentStep ? 'bg-[rgb(24,62,105)]' : 'bg-gray-200'
                  }`}
                ></div>
              )}
              
              {/* Step circle */}
              <button
                onClick={() => {
                  // Only allow going to steps that have been visited or are valid
                  if (index <= currentStep || Object.values(stepsValid).slice(0, index).every(v => v)) {
                    goToStep(index);
                  }
                }}
                disabled={index > currentStep && !Object.values(stepsValid).slice(0, index).every(v => v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep 
                    ? 'bg-[rgb(24,62,105)] text-white' 
                    : index === currentStep
                      ? 'bg-[rgb(236,107,44)] text-white'
                      : 'bg-gray-200 text-gray-500'
                } ${
                  index <= currentStep || Object.values(stepsValid).slice(0, index).every(v => v)
                    ? 'cursor-pointer hover:opacity-90'
                    : 'cursor-not-allowed'
                }`}
              >
                {index + 1}
              </button>
              
              {/* Step label */}
              <span 
                className={`ml-2 text-sm font-medium ${
                  index === currentStep ? 'text-[rgb(24,62,105)]' : 'text-gray-500'
                }`}
              >
                {t(`steps.${step}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}
      
      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        {renderStep()}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 0 ? (
            <button
              onClick={goToPreviousStep}
              className="px-4 py-2 border border-gray-300 rounded-md flex items-center hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              {t('previous')}
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
          )}
        </div>
        
        <div>
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <button
              onClick={goToNextStep}
              disabled={!isCurrentStepValid()}
              className={`px-4 py-2 rounded-md flex items-center ${
                isCurrentStepValid()
                  ? 'bg-[rgb(24,62,105)] text-white hover:bg-[rgb(19,50,86)]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('next')}
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isCurrentStepValid()}
              className={`px-4 py-2 rounded-md flex items-center ${
                isLoading || !isCurrentStepValid()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[rgb(24,62,105)] text-white hover:bg-[rgb(19,50,86)]'
              }`}
            >
              {isLoading ? t('creating') : t('createProject')}
              {isLoading ? (
                <div className="ml-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="h-5 w-5 ml-1" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
