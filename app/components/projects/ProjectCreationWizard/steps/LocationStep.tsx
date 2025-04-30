'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Building, Info, AlertTriangle } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, ProjectLocation } from '@/lib/types/project';
import AutocompleteInput, { AutocompleteOption } from '@/app/components/shared/AutocompleteInput';
import { getAddressSuggestions, getAddressDetails, getWeatherImpact, WeatherImpact } from '@/lib/services/geocodingService';
import { debounce } from 'lodash';

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
  
  // Address autocomplete state
  const [addressInput, setAddressInput] = useState(location.address);
  const [addressSuggestions, setAddressSuggestions] = useState<AutocompleteOption[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Weather impact state
  const [weatherImpact, setWeatherImpact] = useState<WeatherImpact | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [showWeatherAnalysis, setShowWeatherAnalysis] = useState(false);
  
  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'address') {
      setAddressInput(value);
      fetchAddressSuggestions(value);
    }
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., siteDetails.siteArea)
      const [parent, child] = name.split('.');
      setLocation(prev => {
        // Create a copy of the previous state
        const updatedLocation = { ...prev };
        
        // Handle different parent properties
        if (parent === 'siteDetails') {
          // Create a copy of the nested object
          updatedLocation.siteDetails = {
            ...prev.siteDetails,
            [child]: value
          };
        } else if (parent === 'coordinates') {
          updatedLocation.coordinates = {
            ...prev.coordinates,
            [child]: value
          };
        }
        
        return updatedLocation;
      });
    } else {
      // Handle top-level properties
      setLocation(prev => {
        const updatedLocation = { ...prev };
        // Type assertion to ensure the property exists on the object
        (updatedLocation as any)[name] = value;
        return updatedLocation;
      });
    }
  };
  
  // Fetch address suggestions with debouncing
  const fetchAddressSuggestions = useCallback(
    debounce(async (input: string) => {
      if (input.length < 3) {
        setAddressSuggestions([]);
        return;
      }
      
      setIsLoadingSuggestions(true);
      try {
        const suggestions = await getAddressSuggestions(input);
        const options: AutocompleteOption[] = suggestions.map(suggestion => ({
          id: suggestion.placeId,
          label: suggestion.mainText,
          value: suggestion.description,
          secondaryText: suggestion.secondaryText
        }));
        
        setAddressSuggestions(options);
        setShowSuggestions(options.length > 0);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    []
  );
  
  // Handle address selection
  const handleAddressSelect = async (option: AutocompleteOption) => {
    setAddressInput(option.value);
    setShowSuggestions(false);
    
    try {
      const addressDetails = await getAddressDetails(option.id);
      if (addressDetails) {
        setLocation(prev => {
          // Create a copy of the previous state
          const updatedLocation = { ...prev };
          
          // Update address details
          updatedLocation.address = addressDetails.formattedAddress;
          updatedLocation.city = addressDetails.city || prev.city;
          updatedLocation.state = addressDetails.state || prev.state;
          updatedLocation.zipCode = addressDetails.postalCode || prev.zipCode;
          updatedLocation.country = addressDetails.country || prev.country;
          
          // Copy the coordinates to avoid reference issues
          updatedLocation.coordinates = { 
            latitude: addressDetails.coordinates.latitude,
            longitude: addressDetails.coordinates.longitude
          };
          
          return updatedLocation;
        });
        
        // If project has start and end dates, fetch weather impact
        if (formData.startDate && formData.targetEndDate) {
          fetchWeatherImpact(
            addressDetails.coordinates.latitude,
            addressDetails.coordinates.longitude,
            new Date(formData.startDate),
            new Date(formData.targetEndDate)
          );
        }
      }
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  };
  
  // Fetch weather impact analysis
  const fetchWeatherImpact = async (
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ) => {
    if (latitude === 0 && longitude === 0) return;
    
    setIsLoadingWeather(true);
    try {
      const impact = await getWeatherImpact(latitude, longitude, startDate, endDate);
      setWeatherImpact(impact);
      setShowWeatherAnalysis(true);
    } catch (error) {
      console.error('Error fetching weather impact:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };
  
  // Toggle existing structures
  const toggleExistingStructures = () => {
    setLocation(prev => {
      // Create a proper copy of the previous state to avoid spread type issues
      const updatedLocation = { ...prev };
      
      // Update the specific nested property
      updatedLocation.siteDetails = {
        ...prev.siteDetails,
        existingStructures: !prev.siteDetails.existingStructures
      };
      
      return updatedLocation;
    });
  };
  
  // Sync address input with location state
  useEffect(() => {
    setAddressInput(location.address);
  }, [location.address]);
  
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
  
  // Trigger weather impact analysis when coordinates change
  useEffect(() => {
    if (
      location.coordinates.latitude !== 0 &&
      location.coordinates.longitude !== 0 &&
      formData.startDate &&
      formData.targetEndDate
    ) {
      fetchWeatherImpact(
        location.coordinates.latitude,
        location.coordinates.longitude,
        new Date(formData.startDate),
        new Date(formData.targetEndDate)
      );
    }
  }, [location.coordinates, formData.startDate, formData.targetEndDate]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.location')}</h2>
        <p className="text-gray-600">{t('locationDescription')}</p>
      </div>
      
      {/* Basic Location Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('basicLocationInfo')}</h3>
        
        {/* Address Line 1 with Autocomplete */}
        <div>
          <AutocompleteInput
            id="address"
            name="address"
            value={addressInput}
            onChange={handleInputChange}
            onSelect={handleAddressSelect}
            placeholder={t('addressSearchPlaceholder')}
            className={errors.address ? 'border-red-300' : ''}
            options={addressSuggestions}
            loading={isLoadingSuggestions}
            error={errors.address}
            required={true}
            label={t('address')}
            icon={<MapPin className="h-5 w-5 text-gray-400" />}
            showSuggestions={showSuggestions}
            setSuggestionVisibility={setShowSuggestions}
          />
          <p className="mt-1 text-xs text-gray-500">{t('addressTip')}</p>
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
      
      {/* Weather Impact Analysis */}
      {showWeatherAnalysis && weatherImpact && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle 
                className={`h-5 w-5 ${
                  weatherImpact.riskLevel === 'high' ? 'text-red-500' :
                  weatherImpact.riskLevel === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} 
              />
            </div>
            <div className="flex-1">
              <h4 className="text-md font-medium text-gray-900">{t('weatherImpactAnalysis')}</h4>
              <p className="text-sm text-gray-600 mt-1">{weatherImpact.summary}</p>
              
              {/* Weather impact details */}
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Precipitation */}
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-gray-800">{t('precipitation')}</h5>
                    <div className="flex items-center mt-1">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          weatherImpact.details.precipitation.risk === 'high' ? 'bg-red-500' :
                          weatherImpact.details.precipitation.risk === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                      ></div>
                      <span className="text-sm">
                        {weatherImpact.details.precipitation.average} mm
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {weatherImpact.details.precipitation.impact}
                    </p>
                  </div>
                  
                  {/* Temperature */}
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-gray-800">{t('temperature')}</h5>
                    <div className="flex items-center mt-1">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          weatherImpact.details.temperature.risk === 'high' ? 'bg-red-500' :
                          weatherImpact.details.temperature.risk === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                      ></div>
                      <span className="text-sm">
                        {weatherImpact.details.temperature.average}°C (Range: {weatherImpact.details.temperature.extremes.low}°C to {weatherImpact.details.temperature.extremes.high}°C)
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {weatherImpact.details.temperature.impact}
                    </p>
                  </div>
                </div>
                
                {/* Seasonal risks */}
                {weatherImpact.details.seasonalRisks.length > 0 && (
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-gray-800">{t('seasonalRisks')}</h5>
                    <ul className="mt-1 space-y-1">
                      {weatherImpact.details.seasonalRisks.map((risk, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                {t('weatherImpactDisclaimer')}
              </p>
            </div>
          </div>
        </div>
      )}
      
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
