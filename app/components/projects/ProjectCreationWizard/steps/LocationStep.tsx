'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Building, Info } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, ProjectLocation } from '@/lib/types/project';

/**
 * LocationStep Component
 * 
 * Collects project location information including address, city, state,
 * zip code, and country, as well as site-specific details.
 */

interface LocationStepProps {
  formData: Partial<Project>;
  updateFormData: (data: Partial<Project>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

export default function LocationStep({
  formData,
  updateFormData,
  updateStepValidation
}: LocationStepProps) {
  const { t } = useNamespacedTranslations('projects');
  
  // Initialize location from form data or with empty values
  const initialLocation: ProjectLocation = formData.location || {
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    coordinates: { latitude: 0, longitude: 0 },
    siteDetails: {
      siteArea: 0,
      areaUnit: 'sqft',
      siteConditions: '',
      zoningInformation: '',
      existingStructures: false
    }
  };
  
  // Local form state
  const [location, setLocation] = useState<ProjectLocation>(initialLocation);
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., siteDetails.siteArea)
      const [parent, child] = name.split('.');
      setLocation(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProjectLocation],
          [child]: value
        }
      }));
    } else {
      // Handle top-level properties
      setLocation(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Toggle existing structures
  const toggleExistingStructures = () => {
    setLocation(prev => ({
      ...prev,
      siteDetails: {
        ...prev.siteDetails,
        existingStructures: !prev.siteDetails.existingStructures
      }
    }));
  };
  
  // Validate inputs and update parent form
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!location.address.trim()) {
      newErrors.address = t('validation.addressRequired');
    }
    
    if (!location.city.trim()) {
      newErrors.city = t('validation.cityRequired');
    }
    
    if (!location.state.trim()) {
      newErrors.state = t('validation.stateRequired');
    }
    
    if (!location.zipCode.trim()) {
      newErrors.zipCode = t('validation.zipCodeRequired');
    }
    
    if (!location.country.trim()) {
      newErrors.country = t('validation.countryRequired');
    }
    
    // Validate site area if provided
    if (location.siteDetails.siteArea && location.siteDetails.siteArea < 0) {
      newErrors['siteDetails.siteArea'] = t('validation.siteAreaPositive');
    }
    
    setErrors(newErrors);
    
    // Update parent validation state
    const isValid = Object.keys(newErrors).length === 0;
    updateStepValidation(isValid);
    
    // Update parent form data if valid
    if (isValid) {
      updateFormData({ location });
    }
  }, [location, updateFormData, updateStepValidation, t]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.location')}</h2>
        <p className="text-gray-600">{t('locationDescription')}</p>
      </div>
      
      {/* Basic Location Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('basicLocationInfo')}</h3>
        
        {/* Address Line 1 */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            {t('address')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="address"
              name="address"
              value={location.address}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('addressPlaceholder')}
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        
        {/* Address Line 2 */}
        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
            {t('address2')}
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={location.address2}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
            placeholder={t('address2Placeholder')}
          />
        </div>
        
        {/* City, State, Zip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              {t('city')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={location.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('cityPlaceholder')}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          
          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              {t('state')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={location.state}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('statePlaceholder')}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
          
          {/* Zip Code */}
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              {t('zipCode')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={location.zipCode}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors.zipCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('zipCodePlaceholder')}
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
            )}
          </div>
        </div>
        
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            {t('country')} <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            name="country"
            value={location.country}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
              errors.country ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">{t('selectCountry')}</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
            <option value="UK">United Kingdom</option>
            {/* Add more countries as needed */}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>
      </div>
      
      {/* Site Details */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{t('siteDetails')}</h3>
        <p className="text-sm text-gray-600">{t('siteDetailsDescription')}</p>
        
        {/* Site Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="siteArea" className="block text-sm font-medium text-gray-700 mb-1">
              {t('siteArea')}
            </label>
            <input
              type="number"
              id="siteArea"
              name="siteDetails.siteArea"
              value={location.siteDetails.siteArea || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)] ${
                errors['siteDetails.siteArea'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors['siteDetails.siteArea'] && (
              <p className="mt-1 text-sm text-red-600">{errors['siteDetails.siteArea']}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="areaUnit" className="block text-sm font-medium text-gray-700 mb-1">
              {t('areaUnit')}
            </label>
            <select
              id="areaUnit"
              name="siteDetails.areaUnit"
              value={location.siteDetails.areaUnit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
            >
              <option value="sqft">{t('squareFeet')}</option>
              <option value="sqm">{t('squareMeters')}</option>
              <option value="acres">{t('acres')}</option>
              <option value="hectares">{t('hectares')}</option>
            </select>
          </div>
        </div>
        
        {/* Zoning Information */}
        <div>
          <label htmlFor="zoningInformation" className="block text-sm font-medium text-gray-700 mb-1">
            {t('zoningInformation')}
          </label>
          <input
            type="text"
            id="zoningInformation"
            name="siteDetails.zoningInformation"
            value={location.siteDetails.zoningInformation || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
            placeholder={t('zoningInformationPlaceholder')}
          />
        </div>
        
        {/* Site Conditions */}
        <div>
          <label htmlFor="siteConditions" className="block text-sm font-medium text-gray-700 mb-1">
            {t('siteConditions')}
          </label>
          <textarea
            id="siteConditions"
            name="siteDetails.siteConditions"
            value={location.siteDetails.siteConditions || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(24,62,105)]"
            placeholder={t('siteConditionsPlaceholder')}
          ></textarea>
        </div>
        
        {/* Existing Structures */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="existingStructures"
            checked={location.siteDetails.existingStructures}
            onChange={toggleExistingStructures}
            className="h-4 w-4 text-[rgb(24,62,105)] focus:ring-[rgb(24,62,105)] border-gray-300 rounded"
          />
          <label htmlFor="existingStructures" className="ml-2 block text-sm text-gray-700">
            {t('existingStructures')}
          </label>
        </div>
      </div>
      
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">{t('tip')}</h4>
          <p className="text-sm text-blue-700 mt-1">{t('locationTip')}</p>
        </div>
      </div>
    </div>
  );
}
