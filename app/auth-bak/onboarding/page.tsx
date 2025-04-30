'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth/AuthContext'
import { OnboardingData } from '../../../lib/auth/types'

export default function OnboardingPage() {
  const { completeOnboarding, isLoading, error, clearErrors } = useAuth()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<OnboardingData>({
    role: '',
    teamSize: '',
    focusAreas: [] as string[],
    sampleProject: false
  })

  const handleRoleChange = (role: string) => {
    setProfile(prev => ({ ...prev, role }))
  }

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, teamSize: e.target.value }))
  }

  const handleFocusToggle = (area: string) => {
    setProfile(prev => {
      const focusAreas = [...prev.focusAreas]
      if (focusAreas.includes(area)) {
        return { ...prev, focusAreas: focusAreas.filter(a => a !== area) }
      } else {
        return { ...prev, focusAreas: [...focusAreas, area] }
      }
    })
  }

  const handleSampleProjectToggle = () => {
    setProfile(prev => ({ ...prev, sampleProject: !prev.sampleProject }))
  }

  // Clear any auth errors when component mounts
  useEffect(() => {
    clearErrors()
  }, [])

  const handleNext = async () => {
    // Validate current step
    if (step === 1 && !profile.role) {
      return // Require role selection
    }
    if (step === 2 && !profile.teamSize) {
      return // Require team size
    }
    if (step === 3 && profile.focusAreas.length === 0) {
      return // Require at least one focus area
    }

    if (step < 4) {
      setStep(step + 1)
    } else {
      // Complete onboarding using auth context
      await completeOnboarding(profile)
      // Note: Navigation is handled inside the completeOnboarding function
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Calculate progress percentage
  const progress = (step / 4) * 100

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-xl mt-8 px-4 sm:px-0">
      <div className="animate-fade-in">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-[rgb(24,62,105)]">
                  Setting up your workspace
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-[rgb(24,62,105)]">
                  Step {step} of 4
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
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">Welcome to BuildTrack Pro!</h2>
              <p className="text-gray-600 mb-6">Let's start by understanding your role. This helps us customize your experience.</p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">What's your primary role?</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'project-manager', title: 'Project Manager', description: 'Oversee project planning and execution' },
                    { id: 'contractor', title: 'Contractor', description: 'Manage construction and subcontractors' },
                    { id: 'architect', title: 'Architect', description: 'Design and oversee building plans' },
                    { id: 'owner', title: 'Owner/Developer', description: 'Develop and finance projects' }
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
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">Tell us about your team</h2>
              <p className="text-gray-600 mb-6">This helps us configure user permissions and collaboration features.</p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">How many people will be using BuildTrack Pro?</h3>
                
                <div className="mb-6">
                  <select
                    id="teamSize"
                    name="teamSize"
                    value={profile.teamSize}
                    onChange={handleTeamSizeChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm rounded-md"
                  >
                    <option value="">Select team size</option>
                    <option value="just-me">Just me</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-25">11-25 people</option>
                    <option value="26-50">26-50 people</option>
                    <option value="50+">More than 50 people</option>
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
                      <h3 className="text-sm font-medium text-[rgb(24,62,105)]">Need more users later?</h3>
                      <div className="mt-2 text-sm text-blue-800">
                        <p>You can always add more team members later from your dashboard settings.</p>
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
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">What do you want to focus on?</h2>
              <p className="text-gray-600 mb-6">We'll customize your dashboard based on your priorities.</p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">Select your key focus areas:</h3>
                <p className="text-sm text-gray-500">(Select all that apply)</p>
                
                <div className="space-y-3">
                  {[
                    { id: 'project-tracking', title: 'Project Tracking', description: 'Monitor progress, timelines, and status' },
                    { id: 'budget-management', title: 'Budget Management', description: 'Track costs, expenses, and financial metrics' },
                    { id: 'team-collaboration', title: 'Team Collaboration', description: 'Coordinate tasks and communication' },
                    { id: 'document-management', title: 'Document Management', description: 'Organize plans, contracts, and files' },
                    { id: 'materials-tracking', title: 'Materials Tracking', description: 'Inventory and procurement management' },
                    { id: 'reporting-analytics', title: 'Reporting & Analytics', description: 'Generate insights and performance data' }
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
              <h2 className="text-2xl font-bold text-[rgb(24,62,105)] mb-4">Almost there!</h2>
              <p className="text-gray-600 mb-6">One last step before we take you to your dashboard.</p>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[rgb(24,62,105)]">Would you like a sample project?</h3>
                <p className="text-sm text-gray-600 mb-4">We can populate your account with a demo project to help you learn the system.</p>
                
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
                      Yes, add a sample project to my account
                    </label>
                    <p className="text-gray-500">
                      This includes sample tasks, materials, documents, and team members.
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-md p-4 border border-green-100 mt-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Your workspace is ready!</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Click "Complete Setup" to access your dashboard and start managing your projects.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`${
              step === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-[rgb(24,62,105)] hover:bg-gray-50'
            } py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)]`}
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === 1 && !profile.role) || 
              (step === 2 && !profile.teamSize) || 
              (step === 3 && profile.focusAreas.length === 0) ||
              isLoading
            }
            className={`${
              ((step === 1 && !profile.role) || 
              (step === 2 && !profile.teamSize) || 
              (step === 3 && profile.focusAreas.length === 0)) 
                ? 'bg-[rgb(236,167,124)] cursor-not-allowed' 
                : 'bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)]'
            } py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)]`}
          >
            {isLoading 
              ? 'Setting up...' 
              : step < 4 
                ? 'Continue' 
                : 'Complete Setup'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-[rgb(236,107,44)] hover:text-[rgb(220,100,40)]">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  )
}
