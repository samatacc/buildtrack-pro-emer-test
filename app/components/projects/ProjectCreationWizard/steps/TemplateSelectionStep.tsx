'use client';

import React, { useState, useEffect } from 'react';
import { Check, Home, Building, Factory, Landmark, Tool, ClipboardList, Info } from 'lucide-react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { Project, ProjectType } from '@/lib/types/project';
import projectService from '@/lib/services/projectService';

/**
 * TemplateSelectionStep Component
 * 
 * Allows users to select a project template to pre-fill project details or
 * choose to create a project from scratch.
 */

interface TemplateSelectionStepProps {
  formData: Partial<Project>;
  updateFormData: (data: Partial<Project>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  icon: React.ReactNode;
  templateData: Partial<Project>;
}

export default function TemplateSelectionStep({
  formData,
  updateFormData,
  updateStepValidation
}: TemplateSelectionStepProps) {
  const { t } = useNamespacedTranslations('projects');
  
  // State for selected template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would call an API to fetch templates
        // For now, we'll use mock data from the project service
        const templateData = await projectService.getProjectTemplates();
        
        // Map template data to include icons
        const templatesWithIcons = templateData.map(template => {
          let icon;
          
          switch (template.type) {
            case ProjectType.RESIDENTIAL:
              icon = <Home className="h-6 w-6" />;
              break;
            case ProjectType.COMMERCIAL:
              icon = <Building className="h-6 w-6" />;
              break;
            case ProjectType.INDUSTRIAL:
              icon = <Factory className="h-6 w-6" />;
              break;
            case ProjectType.INFRASTRUCTURE:
              icon = <Landmark className="h-6 w-6" />;
              break;
            case ProjectType.RENOVATION:
              icon = <Tool className="h-6 w-6" />;
              break;
            default:
              icon = <ClipboardList className="h-6 w-6" />;
          }
          
          return {
            ...template,
            icon
          };
        });
        
        setTemplates(templatesWithIcons);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  // Update parent form data when a template is selected
  useEffect(() => {
    // This step is always valid as it's optional
    updateStepValidation(true);
    
    if (selectedTemplateId) {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      if (selectedTemplate) {
        updateFormData(selectedTemplate.templateData);
      }
    }
  }, [selectedTemplateId, templates, updateFormData, updateStepValidation]);
  
  // Handle template selection
  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };
  
  // Handle the "start from scratch" option
  const startFromScratch = () => {
    setSelectedTemplateId(null);
    // Don't update form data, let the user start with a blank project
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('steps.template')}</h2>
        <p className="text-gray-600">{t('templateDescription')}</p>
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[rgb(24,62,105)]"></div>
          <p className="mt-2 text-gray-600">{t('loadingTemplates')}</p>
        </div>
      ) : (
        <>
          {/* Start from Scratch Option */}
          <div 
            onClick={startFromScratch}
            className={`cursor-pointer p-5 bg-white rounded-lg border ${
              selectedTemplateId === null
                ? 'border-[rgb(24,62,105)] ring-2 ring-[rgb(24,62,105)] ring-opacity-50'
                : 'border-gray-200 hover:border-gray-300'
            } transition-all`}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedTemplateId === null
                  ? 'bg-[rgb(24,62,105)] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {selectedTemplateId === null ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <ClipboardList className="h-6 w-6" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{t('startFromScratch')}</h3>
                <p className="text-sm text-gray-600 mt-1">{t('startFromScratchDescription')}</p>
              </div>
            </div>
          </div>
          
          {/* Templates */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">{t('projectTemplates')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template.id)}
                  className={`cursor-pointer p-4 bg-white rounded-lg border ${
                    selectedTemplateId === template.id
                      ? 'border-[rgb(24,62,105)] ring-2 ring-[rgb(24,62,105)] ring-opacity-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-all`}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedTemplateId === template.id
                        ? 'bg-[rgb(24,62,105)] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {selectedTemplateId === template.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        template.icon
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="mt-1">
                        <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {t(`projectTypes.${template.type.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800">{t('tip')}</h4>
          <p className="text-sm text-blue-700 mt-1">{t('templateTip')}</p>
        </div>
      </div>
    </div>
  );
}
