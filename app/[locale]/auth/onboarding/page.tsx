'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabaseAuth, OnboardingData } from '../../../../lib/auth/SupabaseAuthContext';
import { useTranslations } from '../../../hooks/useTranslations';

/**
 * Internationalized Onboarding Page
 * 
 * Multi-step user onboarding flow that collects user preferences and sets up
 * their workspace. Follows BuildTrack Pro's design system with primary colors:
 * - Primary Blue: rgb(24,62,105)
 * - Primary Orange: rgb(236,107,44)
 */
export default function LocalizedOnboardingPage() {
  const { completeOnboarding, isLoading, error, clearErrors } = useSupabaseAuth();
  const { t } = useTranslations('auth');
  
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingData>({
    role: '',
    teamSize: '',
    focusAreas: [] as string[],
    sampleProject: false
  });

  const handleRoleChange = (role: string) => {
    setProfile(prev => ({ ...prev, role }));
  };

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, teamSize: e.target.value }));
  };

  const handleFocusToggle = (area: string) => {
    setProfile(prev => {
      const focusAreas = [...prev.focusAreas];
      if (focusAreas.includes(area)) {
        return { ...prev, focusAreas: focusAreas.filter(a => a !== area) };
      } else {
        return { ...prev, focusAreas: [...focusAreas, area] };
      }
    });
  };

  const handleSampleProjectToggle = () => {
    setProfile(prev => ({ ...prev, sampleProject: !prev.sampleProject }));
  };

  // Clear any auth errors when component mounts
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const handleNext = async () => {
    // Validate current step
    if (step === 1 && !profile.role) {
      return; // Require role selection
    }
    if (step === 2 && !profile.teamSize) {
      return; // Require team size
    }
    if (step === 3 && profile.focusAreas.length === 0) {
      return; // Require at least one focus area
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete onboarding using auth context
      await completeOnboarding(profile);
      // Note: Navigation is handled inside the completeOnboarding function
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Calculate progress percentage
  const progress = (step / 4) * 100;

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-xl mt-8 px-4 sm:px-0">
      <div className="animate-fade-in">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-[rgb(24,62,105)]">
                  {t('settingUpWorkspace', { fallback: 'Setting up your workspace' })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-[rgb(24,62,105)]">
                  {t('stepProgress', { step, total: 4, fallback: `Step ${step} of 4` })}
                </span>
              </div>
            </div>
            <div className="flex h-2 mt-2 overflow-hidden bg-gray-200 rounded">
              <div
                style={{ width: `${progress}%` }}
                className="flex flex-col justify-center rounded-r bg-[rgb(236,107,44)] transition-all duration-500 ease-out"
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 mb-6 animate-fade-in-up">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">
                {t('welcomeToBuildTrack', { fallback: 'Welcome to BuildTrack Pro!' })}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('roleCustomization', { 
                  fallback: "Let's start by understanding your role. This helps us customize your experience." 
                })}
              </p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">
                  {t('primaryRole', { fallback: "What's your primary role?" })}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      id: 'project-manager', 
                      title: t('projectManager', { fallback: 'Project Manager' }), 
                      description: t('projectManagerDesc', { 
                        fallback: 'Oversee project planning and execution' 
                      }) 
                    },
                    { 
                      id: 'contractor', 
                      title: t('contractor', { fallback: 'Contractor' }), 
                      description: t('contractorDesc', { 
                        fallback: 'Manage construction and subcontractors' 
                      }) 
                    },
                    { 
                      id: 'architect', 
                      title: t('architect', { fallback: 'Architect' }), 
                      description: t('architectDesc', { 
                        fallback: 'Design and oversee building plans' 
                      }) 
                    },
                    { 
                      id: 'owner', 
                      title: t('ownerDeveloper', { fallback: 'Owner/Developer' }), 
                      description: t('ownerDeveloperDesc', { 
                        fallback: 'Develop and finance projects' 
                      }) 
                    }
                  ].map(role => (
                    <div 
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        profile.role === role.id 
                          ? 'border-[rgb(236,107,44)] bg-orange-50 ring-2 ring-[rgb(236,107,44)]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{role.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Team Size */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">
                {t('tellAboutTeam', { fallback: 'Tell us about your team' })}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('teamConfigReason', { 
                  fallback: 'This helps us configure user permissions and collaboration features.' 
                })}
              </p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">
                  {t('teamSizeQuestion', { 
                    fallback: 'How many people will be using BuildTrack Pro?' 
                  })}
                </h3>
                
                <div className="mb-6">
                  <select
                    id="teamSize"
                    name="teamSize"
                    value={profile.teamSize}
                    onChange={handleTeamSizeChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm rounded-md"
                  >
                    <option value="">{t('selectTeamSize', { fallback: 'Select team size' })}</option>
                    <option value="just-me">{t('justMe', { fallback: 'Just me' })}</option>
                    <option value="2-5">{t('twoToFive', { fallback: '2-5 people' })}</option>
                    <option value="6-10">{t('sixToTen', { fallback: '6-10 people' })}</option>
                    <option value="11-25">{t('elevenToTwentyFive', { fallback: '11-25 people' })}</option>
                    <option value="26-50">{t('twentySixToFifty', { fallback: '26-50 people' })}</option>
                    <option value="50+">{t('moreThanFifty', { fallback: 'More than 50 people' })}</option>
                  </select>
                </div>
                
                <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-[rgb(24,62,105)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-[rgb(24,62,105)]">
                        {t('needMoreUsers', { fallback: 'Need more users later?' })}
                      </h3>
                      <div className="mt-2 text-sm text-blue-800">
                        <p>{t('addMoreTeamMembers', { 
                          fallback: 'You can always add more team members later from your dashboard settings.' 
                        })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Focus Areas */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">
                {t('whatToFocusOn', { fallback: 'What do you want to focus on?' })}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('customizeDashboard', { 
                  fallback: "We'll customize your dashboard based on your priorities." 
                })}
              </p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">
                  {t('selectFocusAreas', { fallback: 'Select your key focus areas:' })}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('selectAllApply', { fallback: '(Select all that apply)' })}
                </p>
                
                <div className="space-y-3">
                  {[
                    { 
                      id: 'project-tracking', 
                      title: t('projectTracking', { fallback: 'Project Tracking' }), 
                      description: t('projectTrackingDesc', { 
                        fallback: 'Monitor progress, timelines, and status' 
                      }) 
                    },
                    { 
                      id: 'budget-management', 
                      title: t('budgetManagement', { fallback: 'Budget Management' }), 
                      description: t('budgetManagementDesc', { 
                        fallback: 'Track costs, expenses, and financial metrics' 
                      }) 
                    },
                    { 
                      id: 'team-collaboration', 
                      title: t('teamCollaboration', { fallback: 'Team Collaboration' }), 
                      description: t('teamCollaborationDesc', { 
                        fallback: 'Coordinate tasks and communication' 
                      }) 
                    },
                    { 
                      id: 'document-management', 
                      title: t('documentManagement', { fallback: 'Document Management' }), 
                      description: t('documentManagementDesc', { 
                        fallback: 'Organize plans, contracts, and files' 
                      }) 
                    },
                    { 
                      id: 'materials-tracking', 
                      title: t('materialsTracking', { fallback: 'Materials Tracking' }), 
                      description: t('materialsTrackingDesc', { 
                        fallback: 'Inventory and procurement management' 
                      }) 
                    },
                    { 
                      id: 'reporting-analytics', 
                      title: t('reportingAnalytics', { fallback: 'Reporting & Analytics' }), 
                      description: t('reportingAnalyticsDesc', { 
                        fallback: 'Generate insights and performance data' 
                      }) 
                    }
                  ].map(area => (
                    <div 
                      key={area.id}
                      className="relative flex items-start"
                    >
                      <div className="flex items-center h-5">
                        <input
                          id={area.id}
                          name={area.id}
                          type="checkbox"
                          checked={profile.focusAreas.includes(area.id)}
                          onChange={() => handleFocusToggle(area.id)}
                          className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={area.id} className="font-medium text-gray-700">{area.title}</label>
                        <p className="text-gray-500">{area.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Sample Project */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">
                {t('almostThere', { fallback: 'Almost there!' })}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('oneLastStep', { 
                  fallback: 'One last step before we take you to your dashboard.' 
                })}
              </p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">
                  {t('wantSampleProject', { fallback: 'Would you like a sample project?' })}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('sampleProjectDesc', { 
                    fallback: 'We can populate your account with a demo project to help you learn the system.' 
                  })}
                </p>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sample-project"
                      name="sample-project"
                      type="checkbox"
                      checked={profile.sampleProject}
                      onChange={handleSampleProjectToggle}
                      className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sample-project" className="font-medium text-gray-700">
                      {t('yesSampleProject', { 
                        fallback: 'Yes, add a sample construction project to my account' 
                      })}
                    </label>
                    <p className="text-gray-500">
                      {t('sampleProjectHelp', { 
                        fallback: 'This will help you understand how to use BuildTrack Pro' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-md p-4 border border-green-100 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        {t('completeProfile', { 
                          fallback: 'Your profile is almost complete!' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)] ${
                step === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {t('back', { fallback: 'Back' })}
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[rgb(24,62,105)] hover:bg-[rgb(19,50,86)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)] ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {step < 4 ? 
                t('continue', { fallback: 'Continue' }) : 
                t('finishSetup', { fallback: 'Finish Setup' })
              }
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Skip for now link */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-[rgb(236,107,44)]"
          >
            {t('skipForNow', { fallback: 'Skip for now' })}
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            {t('canCompleteProfileLater', { 
              fallback: 'You can complete your profile later from your account settings' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
