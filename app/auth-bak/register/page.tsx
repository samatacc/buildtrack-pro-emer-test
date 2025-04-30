'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth/AuthContext'
import { RegisterFormData } from '../../../lib/auth/types'

export default function RegisterPage() {
  const { register, error: authError, isLoading, clearErrors } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companySize: '',
    phoneNumber: '',
    industry: '',
    plan: 'freemium'
  })
  const [validationError, setValidationError] = useState('')

  // Clear any auth errors when component mounts
  useEffect(() => {
    clearErrors()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        setValidationError('Please fill in all fields')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match')
        return false
      }
      if (formData.password.length < 8) {
        setValidationError('Password must be at least 8 characters')
        return false
      }
    } else if (step === 2) {
      if (!formData.companyName || !formData.companySize || !formData.industry) {
        setValidationError('Please fill in all required fields')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    
    if (step < 3) {
      if (validateStep()) {
        setStep(step + 1)
      }
      return
    }
    
    if (validateStep()) {
      // Call register function from auth context
      await register(formData)
    }
  }

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
        <h2 className="text-center text-3xl font-extrabold text-[rgb(24,62,105)]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-[rgb(236,107,44)] hover:text-[rgb(220,100,40)]">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {(validationError || authError) && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              <p>{validationError || authError}</p>
            </div>
          )}
          
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="w-full flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[rgb(236,107,44)] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-[rgb(236,107,44)]' : 'bg-gray-200'}`}></div>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[rgb(236,107,44)] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-[rgb(236,107,44)]' : 'bg-gray-200'}`}></div>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[rgb(236,107,44)] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Account</span>
              <span>Company</span>
              <span>Plan</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Company Information */}
            {step === 2 && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company name
                  </label>
                  <div className="mt-1">
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                    Company size
                  </label>
                  <div className="mt-1">
                    <select
                      id="companySize"
                      name="companySize"
                      required
                      value={formData.companySize}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501+">501+ employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <div className="mt-1">
                    <select
                      id="industry"
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[rgb(236,107,44)] focus:border-[rgb(236,107,44)] sm:text-sm"
                    >
                      <option value="">Select industry</option>
                      <option value="residential">Residential Construction</option>
                      <option value="commercial">Commercial Construction</option>
                      <option value="industrial">Industrial Construction</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="renovation">Renovation & Remodeling</option>
                      <option value="specialty">Specialty Contractor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-medium text-[rgb(24,62,105)] mb-2">Choose your plan</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    All plans come with a 14-day free trial. No credit card required.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="relative border rounded-lg p-4 flex cursor-pointer bg-white">
                      <div className="flex items-center h-5">
                        <input
                          id="plan-freemium"
                          name="plan"
                          type="radio"
                          value="freemium"
                          checked={formData.plan === 'freemium'}
                          onChange={handleChange}
                          className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <label htmlFor="plan-freemium" className="font-medium text-gray-900 block">
                          Freemium
                        </label>
                        <p className="text-gray-500 text-sm">
                          Basic project management for small teams
                        </p>
                        <p className="text-[rgb(24,62,105)] font-medium mt-1">Free forever</p>
                        <ul className="mt-2 text-sm text-gray-500 space-y-1">
                          <li>Up to 3 projects</li>
                          <li>Basic task management</li>
                          <li>Limited file storage (1GB)</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="relative border rounded-lg p-4 flex cursor-pointer bg-white border-[rgb(236,107,44)]">
                      <div className="flex items-center h-5">
                        <input
                          id="plan-pro"
                          name="plan"
                          type="radio"
                          value="pro"
                          checked={formData.plan === 'pro'}
                          onChange={handleChange}
                          className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <label htmlFor="plan-pro" className="font-medium text-gray-900 block">
                          Pro
                        </label>
                        <div className="absolute top-4 right-4 bg-[rgb(236,107,44)] text-white text-xs px-2 py-1 rounded-full">
                          MOST POPULAR
                        </div>
                        <p className="text-gray-500 text-sm">
                          Advanced project management for growing teams
                        </p>
                        <p className="text-[rgb(24,62,105)] font-medium mt-1">$29 per user / month</p>
                        <ul className="mt-2 text-sm text-gray-500 space-y-1">
                          <li>Unlimited projects</li>
                          <li>Advanced project tracking</li>
                          <li>Team collaboration tools</li>
                          <li>10GB file storage</li>
                          <li>Materials management</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="relative border rounded-lg p-4 flex cursor-pointer bg-white">
                      <div className="flex items-center h-5">
                        <input
                          id="plan-enterprise"
                          name="plan"
                          type="radio"
                          value="enterprise"
                          checked={formData.plan === 'enterprise'}
                          onChange={handleChange}
                          className="h-4 w-4 text-[rgb(236,107,44)] focus:ring-[rgb(236,107,44)] border-gray-300"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <label htmlFor="plan-enterprise" className="font-medium text-gray-900 block">
                          Enterprise
                        </label>
                        <p className="text-gray-500 text-sm">
                          Complete solution for large organizations
                        </p>
                        <p className="text-[rgb(24,62,105)] font-medium mt-1">Contact sales</p>
                        <ul className="mt-2 text-sm text-gray-500 space-y-1">
                          <li>Everything in Pro</li>
                          <li>Advanced security</li>
                          <li>Custom integrations</li>
                          <li>Dedicated support</li>
                          <li>Unlimited storage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(236,107,44)] hover:bg-[rgb(220,100,40)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(236,107,44)]"
              >
                {step < 3 ? 'Continue' : (isLoading ? 'Creating account...' : 'Create Account')}
              </button>
            </div>
            
            {step > 1 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-sm text-[rgb(236,107,44)] hover:text-[rgb(220,100,40)]"
                >
                  Go back to previous step
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
