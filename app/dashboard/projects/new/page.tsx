'use client';

import { useState } from 'react';
import Link from 'next/link';
import BudgetStep from '../../../features/projects/ProjectCreationWizard/steps/BudgetStep';

// Step navigation types
type WizardStep = 'details' | 'budget' | 'milestones' | 'team' | 'review';

export default function NewProject() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('budget');
  const [projectDetails, setProjectDetails] = useState({
    name: '',
    type: 'residential',
    size: 2500,
    location: 'Portland, OR',
    timeline: 180,
    complexity: 'medium'
  });

  // Steps configuration
  const steps = [
    { id: 'details', name: 'Project Details' },
    { id: 'budget', name: 'Budget Planning' },
    { id: 'milestones', name: 'Milestones' },
    { id: 'team', name: 'Team Assignment' },
    { id: 'review', name: 'Review & Create' }
  ];

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as WizardStep);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as WizardStep);
    }
  };

  // Form data state for the entire wizard
  const [formData, setFormData] = useState<any>(projectDetails);
  
  // Update form data handler
  const updateFormData = (data: any) => {
    setFormData({ ...formData, ...data });
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'budget':
        return (
          <BudgetStep 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handlePrevious}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">This step is under development</h3>
            <p className="text-gray-500 mt-2">We're currently showcasing the Budget Recommendation feature</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[rgb(24,62,105)] text-white rounded-md text-sm font-medium hover:bg-[rgb(19,49,84)]"
              >
                Next
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[rgb(24,62,105)]">Create New Project</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Progress">
          <ol className="border border-gray-300 rounded-md divide-y divide-gray-300 md:flex md:divide-y-0">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className="relative md:flex-1 md:flex">
                <div
                  className={`group flex items-center w-full ${
                    stepIdx !== steps.length - 1 ? 'md:pr-2' : ''
                  }`}
                >
                  <span className="px-6 py-4 flex items-center text-sm font-medium">
                    <span
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                        step.id === currentStep
                          ? 'bg-[rgb(24,62,105)] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {stepIdx + 1}
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Main content */}
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
