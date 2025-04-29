'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * DocumentWorkflow Component
 * 
 * Manages document workflows with language-specific templates for construction projects.
 * Supports internationalization for diverse construction teams.
 * 
 * Features:
 * - Language-specific document templates
 * - Workflow management with approval processes
 * - Status tracking and notifications
 * - Internationalization support for interface and templates
 */
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  documentType: string;
  language: string;
  steps: WorkflowStep[];
  createdBy: string;
  dateCreated: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  approvers: string[];
  requiredDocuments: string[];
  estimatedDuration: number; // in days
}

interface DocumentWorkflowProps {
  projectId?: string;
  className?: string;
  selectedLanguage?: string;
}

export default function DocumentWorkflow({
  projectId,
  className = '',
  selectedLanguage = 'en'
}: DocumentWorkflowProps) {
  const { t, metrics } = useNamespacedTranslations('documents');
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState(selectedLanguage || '');
  
  // Load workflow templates
  useEffect(() => {
    // Mock data
    const mockTemplates: WorkflowTemplate[] = [
      {
        id: 'tmp1',
        name: 'Building Permit Application',
        description: 'Standard workflow for building permit applications',
        documentType: 'permit',
        language: 'en',
        steps: [
          {
            id: 'step1',
            name: 'Document Preparation',
            description: 'Prepare all required documents for permit application',
            order: 1,
            approvers: ['Project Manager'],
            requiredDocuments: ['Site Plan', 'Floor Plans', 'Elevations'],
            estimatedDuration: 5
          },
          {
            id: 'step2',
            name: 'Internal Review',
            description: 'Review of application documents by internal team',
            order: 2,
            approvers: ['Project Architect', 'Structural Engineer'],
            requiredDocuments: [],
            estimatedDuration: 3
          },
          {
            id: 'step3',
            name: 'Submission',
            description: 'Submit application to local building department',
            order: 3,
            approvers: ['Project Manager'],
            requiredDocuments: [],
            estimatedDuration: 1
          },
          {
            id: 'step4',
            name: 'Tracking & Response',
            description: 'Track application status and respond to any requests for information',
            order: 4,
            approvers: ['Project Manager', 'Project Architect'],
            requiredDocuments: [],
            estimatedDuration: 14
          }
        ],
        createdBy: 'John Smith',
        dateCreated: '2025-01-15T10:30:00'
      },
      {
        id: 'tmp2',
        name: 'Solicitud de Permiso de Construcción',
        description: 'Flujo de trabajo estándar para solicitudes de permisos de construcción',
        documentType: 'permit',
        language: 'es',
        steps: [
          {
            id: 'step1',
            name: 'Preparación de Documentos',
            description: 'Preparar todos los documentos requeridos para la solicitud de permiso',
            order: 1,
            approvers: ['Gerente de Proyecto'],
            requiredDocuments: ['Plano del Sitio', 'Planos de Planta', 'Elevaciones'],
            estimatedDuration: 5
          },
          {
            id: 'step2',
            name: 'Revisión Interna',
            description: 'Revisión de los documentos de solicitud por el equipo interno',
            order: 2,
            approvers: ['Arquitecto del Proyecto', 'Ingeniero Estructural'],
            requiredDocuments: [],
            estimatedDuration: 3
          },
          {
            id: 'step3',
            name: 'Presentación',
            description: 'Presentar solicitud al departamento de construcción local',
            order: 3,
            approvers: ['Gerente de Proyecto'],
            requiredDocuments: [],
            estimatedDuration: 1
          },
          {
            id: 'step4',
            name: 'Seguimiento y Respuesta',
            description: 'Hacer seguimiento del estado de la solicitud y responder a cualquier solicitud de información',
            order: 4,
            approvers: ['Gerente de Proyecto', 'Arquitecto del Proyecto'],
            requiredDocuments: [],
            estimatedDuration: 14
          }
        ],
        createdBy: 'Carlos Mendez',
        dateCreated: '2025-01-18T14:45:00'
      },
      {
        id: 'tmp3',
        name: 'Change Order Request',
        description: 'Workflow for managing construction change orders',
        documentType: 'change-order',
        language: 'en',
        steps: [
          {
            id: 'step1',
            name: 'Change Identification',
            description: 'Identify and document the requested change',
            order: 1,
            approvers: ['Project Manager'],
            requiredDocuments: ['Change Request Form'],
            estimatedDuration: 2
          },
          {
            id: 'step2',
            name: 'Impact Analysis',
            description: 'Analyze cost, schedule, and quality impacts',
            order: 2,
            approvers: ['Project Manager', 'Cost Estimator'],
            requiredDocuments: ['Cost Estimate', 'Schedule Impact'],
            estimatedDuration: 3
          },
          {
            id: 'step3',
            name: 'Client Approval',
            description: 'Present change order to client for approval',
            order: 3,
            approvers: ['Client Representative'],
            requiredDocuments: [],
            estimatedDuration: 5
          },
          {
            id: 'step4',
            name: 'Implementation',
            description: 'Update project documents and implement change',
            order: 4,
            approvers: ['Project Manager'],
            requiredDocuments: [],
            estimatedDuration: 2
          }
        ],
        createdBy: 'Emily Johnson',
        dateCreated: '2025-02-10T09:15:00'
      },
      {
        id: 'tmp4',
        name: 'Demande de Permis de Construire',
        description: 'Processus standard pour les demandes de permis de construire',
        documentType: 'permit',
        language: 'fr',
        steps: [
          {
            id: 'step1',
            name: 'Préparation des Documents',
            description: 'Préparer tous les documents requis pour la demande de permis',
            order: 1,
            approvers: ['Chef de Projet'],
            requiredDocuments: ['Plan de Site', 'Plans d\'Étage', 'Élévations'],
            estimatedDuration: 5
          },
          {
            id: 'step2',
            name: 'Revue Interne',
            description: 'Revue des documents de demande par l\'équipe interne',
            order: 2,
            approvers: ['Architecte du Projet', 'Ingénieur Structure'],
            requiredDocuments: [],
            estimatedDuration: 3
          },
          {
            id: 'step3',
            name: 'Soumission',
            description: 'Soumettre la demande au service d\'urbanisme local',
            order: 3,
            approvers: ['Chef de Projet'],
            requiredDocuments: [],
            estimatedDuration: 1
          },
          {
            id: 'step4',
            name: 'Suivi et Réponse',
            description: 'Suivre l\'état de la demande et répondre aux demandes d\'informations',
            order: 4,
            approvers: ['Chef de Projet', 'Architecte du Projet'],
            requiredDocuments: [],
            estimatedDuration: 14
          }
        ],
        createdBy: 'Pierre Dubois',
        dateCreated: '2025-02-05T11:30:00'
      }
    ];
    
    // Simulate API delay
    setTimeout(() => {
      setTemplates(mockTemplates);
      
      // Filter by language initially if specified
      const languageFiltered = selectedLanguage 
        ? mockTemplates.filter(template => template.language === selectedLanguage)
        : mockTemplates;
      
      setFilteredTemplates(languageFiltered);
      setIsLoading(false);
    }, 800);
  }, [selectedLanguage]);
  
  // Filter templates when search query or language filter changes
  useEffect(() => {
    if (!searchQuery) {
      const languageFiltered = languageFilter 
        ? templates.filter(template => template.language === languageFilter)
        : templates;
      
      setFilteredTemplates(languageFiltered);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = templates.filter(template => {
      // Match by name, description, or document type
      if (template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.documentType.toLowerCase().includes(query)) {
        return true;
      }
      
      // Match by step name or description
      return template.steps.some(step => 
        step.name.toLowerCase().includes(query) ||
        step.description.toLowerCase().includes(query)
      );
    });
    
    // Apply language filter if specified
    const languageFiltered = languageFilter 
      ? filtered.filter(template => template.language === languageFilter)
      : filtered;
    
    setFilteredTemplates(languageFiltered);
  }, [searchQuery, templates, languageFilter]);
  
  // Calculate total workflow duration
  const calculateDuration = (template: WorkflowTemplate): number => {
    return template.steps.reduce((total, step) => total + step.estimatedDuration, 0);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get language flag and name
  const getLanguageInfo = (languageCode: string): { flag: string, name: string } => {
    switch (languageCode) {
      case 'en':
        return { flag: '🇺🇸', name: 'English' };
      case 'es':
        return { flag: '🇪🇸', name: 'Español' };
      case 'fr':
        return { flag: '🇫🇷', name: 'Français' };
      case 'pt-BR':
        return { flag: '🇧🇷', name: 'Português (Brasil)' };
      default:
        return { flag: '🌐', name: languageCode };
    }
  };
  
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-center items-center h-40">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[rgb(24,62,105)]"></div>
          <p className="ml-2 text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-[rgb(24,62,105)] bg-opacity-5 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[rgb(24,62,105)]">
          {t('documentWorkflows')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {filteredTemplates.length} {t('templatesAvailable')}
          {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
        </p>
      </div>
      
      {!selectedTemplate ? (
        <>
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="max-w-md flex-grow">
                <label htmlFor="template-search" className="block text-xs font-medium text-gray-700 mb-1">
                  {t('search')}
                </label>
                <input
                  type="text"
                  id="template-search"
                  className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder={t('searchWorkflows')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="language-filter" className="block text-xs font-medium text-gray-700 mb-1">
                  {t('language')}
                </label>
                <select
                  id="language-filter"
                  className="border border-gray-300 rounded-md p-2 text-sm"
                  value={languageFilter || 'all'}
                  onChange={(e) => setLanguageFilter(e.target.value === 'all' ? '' : e.target.value)}
                >
                  <option value="all">{t('allLanguages')}</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Templates list */}
          <div className="divide-y divide-gray-200">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    </div>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                      {getLanguageInfo(template.language).flag} {getLanguageInfo(template.language).name}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center">
                    <span className="text-xs font-medium text-gray-500">
                      {template.documentType.toUpperCase()}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                      {template.steps.length} {t('steps')}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                      {calculateDuration(template)} {t('days')}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {t('createdBy')}: {template.createdBy} • {formatDate(template.dateCreated)}
                    </span>
                    <button className="text-sm text-[rgb(24,62,105)] hover:text-[rgb(19,49,84)]">
                      {t('useTemplate')} →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                {t('noWorkflowsFound')}
              </div>
            )}
          </div>
        </>
      ) : (
        // Template detail view
        <div>
          {/* Template header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-medium text-gray-900">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
              </div>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedTemplate(null)}
              >
                {t('backToList')}
              </button>
            </div>
            <div className="mt-3 flex items-center">
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {getLanguageInfo(selectedTemplate.language).flag} {getLanguageInfo(selectedTemplate.language).name}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                {t('totalEstimatedDuration')}: {calculateDuration(selectedTemplate)} {t('days')}
              </span>
            </div>
          </div>
          
          {/* Workflow steps */}
          <div className="p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">{t('workflowSteps')}</h4>
            <div className="space-y-6">
              {selectedTemplate.steps.map((step, index) => (
                <div key={step.id} className="flex">
                  {/* Step number and connector line */}
                  <div className="flex flex-col items-center mr-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgb(24,62,105)] text-white flex items-center justify-center">
                      {step.order}
                    </div>
                    {index < selectedTemplate.steps.length - 1 && (
                      <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  {/* Step details */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="text-base font-medium text-gray-900">{step.name}</h5>
                      <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Approvers */}
                        <div>
                          <h6 className="text-xs font-medium text-gray-700 mb-2">{t('approvers')}</h6>
                          <div className="space-y-1">
                            {step.approvers.map((approver, idx) => (
                              <div key={idx} className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-[rgb(236,107,44)] flex-shrink-0"></div>
                                <span className="ml-2 text-sm">{approver}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Required documents */}
                        <div>
                          <h6 className="text-xs font-medium text-gray-700 mb-2">{t('requiredDocuments')}</h6>
                          {step.requiredDocuments.length > 0 ? (
                            <ul className="space-y-1">
                              {step.requiredDocuments.map((doc, idx) => (
                                <li key={idx} className="text-sm flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">{t('noRequiredDocuments')}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {t('estimatedDuration')}: {step.estimatedDuration} {t('days')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setSelectedTemplate(null)}
            >
              {t('cancel')}
            </button>
            <button
              className="px-4 py-2 bg-[rgb(24,62,105)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[rgb(19,49,84)]"
            >
              {t('startWorkflow')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
