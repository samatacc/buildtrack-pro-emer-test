'use client';

import { useState, useEffect } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';

/**
 * DrawingSet Component
 * 
 * Manages construction drawings with localized annotations.
 * Follows BuildTrack Pro's design principles with Primary Blue (rgb(24,62,105))
 * and Primary Orange (rgb(236,107,44)).
 * 
 * Features:
 * - Drawing organization by discipline and type
 * - Localized annotations and measurements
 * - Version tracking and comparison
 * - Multi-language support for all annotations
 */
interface Drawing {
  id: string;
  name: string;
  number: string;
  scale: string;
  revision: string;
  discipline: 'architectural' | 'structural' | 'mep' | 'civil' | 'landscape';
  type: 'plan' | 'elevation' | 'section' | 'detail';
  dateCreated: string;
  lastUpdated: string;
  createdBy: string;
  projectId: string;
  status: 'draft' | 'for-review' | 'for-approval' | 'approved' | 'for-construction';
  annotations: Annotation[];
  thumbnail: string;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: {
    [key: string]: string; // Localized text for different languages
  };
  createdBy: string;
  dateCreated: string;
  resolved: boolean;
}

interface DrawingSetProps {
  projectId?: string;
  className?: string;
  currentLanguage?: string;
}

export default function DrawingSet({
  projectId,
  className = '',
  currentLanguage = 'en'
}: DrawingSetProps) {
  const { t, metrics } = useNamespacedTranslations('documents');
  const [isLoading, setIsLoading] = useState(true);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [filteredDrawings, setFilteredDrawings] = useState<Drawing[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [annotationMode, setAnnotationMode] = useState(false);
  
  // Load drawings data
  useEffect(() => {
    // Mock drawing set data
    const mockDrawings: Drawing[] = [
      {
        id: 'drw1',
        name: 'Ground Floor Plan',
        number: 'A-101',
        scale: '1:50',
        revision: 'B',
        discipline: 'architectural',
        type: 'plan',
        dateCreated: '2025-03-10T09:00:00',
        lastUpdated: '2025-04-18T14:30:00',
        createdBy: 'Sarah Williams',
        projectId: '1',
        status: 'for-construction',
        annotations: [
          {
            id: 'ann1',
            x: 320,
            y: 215,
            text: {
              'en': 'Verify kitchen dimensions',
              'es': 'Verificar dimensiones de la cocina',
              'fr': 'Vérifier les dimensions de la cuisine',
              'pt-BR': 'Verificar dimensões da cozinha'
            },
            createdBy: 'John Smith',
            dateCreated: '2025-04-15T10:30:00',
            resolved: false
          },
          {
            id: 'ann2',
            x: 450,
            y: 180,
            text: {
              'en': 'Update door swing direction',
              'es': 'Actualizar la dirección de apertura de la puerta',
              'fr': 'Mettre à jour la direction d\'ouverture de la porte',
              'pt-BR': 'Atualizar direção de abertura da porta'
            },
            createdBy: 'Emily Johnson',
            dateCreated: '2025-04-17T11:45:00',
            resolved: true
          }
        ],
        thumbnail: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Ground+Floor+Plan'
      },
      {
        id: 'drw2',
        name: 'Foundation Plan',
        number: 'S-101',
        scale: '1:100',
        revision: 'A',
        discipline: 'structural',
        type: 'plan',
        dateCreated: '2025-03-12T11:20:00',
        lastUpdated: '2025-04-05T09:45:00',
        createdBy: 'Michael Chen',
        projectId: '1',
        status: 'approved',
        annotations: [
          {
            id: 'ann3',
            x: 280,
            y: 320,
            text: {
              'en': 'Check reinforcement spacing',
              'es': 'Verificar espaciado del refuerzo',
              'fr': 'Vérifier l\'espacement des armatures',
              'pt-BR': 'Verificar espaçamento da armadura'
            },
            createdBy: 'Carlos Mendez',
            dateCreated: '2025-04-02T14:15:00',
            resolved: true
          }
        ],
        thumbnail: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Foundation+Plan'
      },
      {
        id: 'drw3',
        name: 'Electrical Plan',
        number: 'E-101',
        scale: '1:50',
        revision: 'C',
        discipline: 'mep',
        type: 'plan',
        dateCreated: '2025-03-15T15:30:00',
        lastUpdated: '2025-04-22T16:20:00',
        createdBy: 'Jessica Lee',
        projectId: '1',
        status: 'for-review',
        annotations: [
          {
            id: 'ann4',
            x: 350,
            y: 180,
            text: {
              'en': 'Add additional outlet here',
              'es': 'Agregar toma de corriente adicional aquí',
              'fr': 'Ajouter une prise supplémentaire ici',
              'pt-BR': 'Adicionar tomada adicional aqui'
            },
            createdBy: 'Michael Chen',
            dateCreated: '2025-04-20T10:30:00',
            resolved: false
          },
          {
            id: 'ann5',
            x: 420,
            y: 250,
            text: {
              'en': 'Verify lighting fixture type',
              'es': 'Verificar tipo de luminaria',
              'fr': 'Vérifier le type de luminaire',
              'pt-BR': 'Verificar tipo de luminária'
            },
            createdBy: 'Sarah Williams',
            dateCreated: '2025-04-21T09:15:00',
            resolved: false
          }
        ],
        thumbnail: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Electrical+Plan'
      },
      {
        id: 'drw4',
        name: 'South Elevation',
        number: 'A-201',
        scale: '1:100',
        revision: 'A',
        discipline: 'architectural',
        type: 'elevation',
        dateCreated: '2025-03-18T08:45:00',
        lastUpdated: '2025-04-10T13:50:00',
        createdBy: 'Sarah Williams',
        projectId: '1',
        status: 'approved',
        annotations: [],
        thumbnail: 'https://placehold.co/300x200/e2e8f0/1e293b?text=South+Elevation'
      },
      {
        id: 'drw5',
        name: 'Site Plan',
        number: 'C-101',
        scale: '1:200',
        revision: 'B',
        discipline: 'civil',
        type: 'plan',
        dateCreated: '2025-03-08T10:15:00',
        lastUpdated: '2025-04-16T11:30:00',
        createdBy: 'David Wilson',
        projectId: '1',
        status: 'for-construction',
        annotations: [
          {
            id: 'ann6',
            x: 200,
            y: 150,
            text: {
              'en': 'Update property line dimensions',
              'es': 'Actualizar dimensiones de la línea de propiedad',
              'fr': 'Mettre à jour les dimensions de la ligne de propriété',
              'pt-BR': 'Atualizar dimensões da linha de propriedade'
            },
            createdBy: 'Carlos Mendez',
            dateCreated: '2025-04-14T15:45:00',
            resolved: true
          }
        ],
        thumbnail: 'https://placehold.co/300x200/e2e8f0/1e293b?text=Site+Plan'
      }
    ];
    
    // Filter by project if projectId is provided
    const filteredByProject = projectId 
      ? mockDrawings.filter(drawing => drawing.projectId === projectId)
      : mockDrawings;
    
    // Simulate API delay
    setTimeout(() => {
      setDrawings(filteredByProject);
      setFilteredDrawings(filteredByProject);
      setIsLoading(false);
    }, 800);
  }, [projectId]);
  
  // Filter drawings when discipline selection changes
  useEffect(() => {
    const filtered = selectedDiscipline === 'all'
      ? drawings
      : drawings.filter(drawing => drawing.discipline === selectedDiscipline);
    
    setFilteredDrawings(filtered);
  }, [selectedDiscipline, drawings]);
  
  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge style
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'for-review':
        return 'bg-blue-100 text-blue-800';
      case 'for-approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'for-construction':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get discipline icon
  const getDisciplineIcon = (discipline: string): string => {
    switch (discipline) {
      case 'architectural':
        return '🏛️';
      case 'structural':
        return '🏗️';
      case 'mep':
        return '⚡';
      case 'civil':
        return '🏢';
      case 'landscape':
        return '🌳';
      default:
        return '📄';
    }
  };
  
  // Handle drawing selection
  const handleDrawingClick = (drawing: Drawing) => {
    setSelectedDrawing(drawing);
  };
  
  // Handle closing the drawing viewer
  const handleCloseViewer = () => {
    setSelectedDrawing(null);
    setAnnotationMode(false);
  };
  
  // Toggle annotation mode
  const toggleAnnotationMode = () => {
    setAnnotationMode(!annotationMode);
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
          {t('drawingSet')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {filteredDrawings.length} {t('drawingsFound')}
          {metrics && <span className="text-xs ml-2">({t('loadedIn')} {metrics.loadTime}ms)</span>}
        </p>
      </div>
      
      {/* Discipline tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              selectedDiscipline === 'all'
                ? 'border-[rgb(236,107,44)] text-[rgb(236,107,44)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedDiscipline('all')}
          >
            {t('allDisciplines')}
          </button>
          {['architectural', 'structural', 'mep', 'civil', 'landscape'].map(discipline => (
            <button
              key={discipline}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                selectedDiscipline === discipline
                  ? 'border-[rgb(236,107,44)] text-[rgb(236,107,44)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedDiscipline(discipline)}
            >
              {getDisciplineIcon(discipline)} {t(`disciplines.${discipline}`)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Drawings grid */}
      {!selectedDrawing ? (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrawings.length > 0 ? (
              filteredDrawings.map(drawing => (
                <div
                  key={drawing.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleDrawingClick(drawing)}
                >
                  <div className="h-40 bg-gray-100 relative">
                    {drawing.thumbnail && (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${drawing.thumbnail})` }}></div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(drawing.status)}`}>
                        {t(`status.${drawing.status}`)}
                      </span>
                    </div>
                    {drawing.annotations.length > 0 && (
                      <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                        {drawing.annotations.length} {t('annotations')}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{drawing.name}</h3>
                        <p className="text-xs text-gray-500">{drawing.number} • {drawing.revision}</p>
                      </div>
                      <span className="text-lg" aria-hidden="true">
                        {getDisciplineIcon(drawing.discipline)}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{t(`drawingTypes.${drawing.type}`)}</span>
                      <span>{drawing.scale}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {t('lastUpdated')}: {formatDate(drawing.lastUpdated)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 text-center text-gray-500">
                {t('noDrawingsFound')}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Drawing viewer */
        <div className="relative">
          {/* Toolbar */}
          <div className="flex justify-between items-center bg-gray-100 p-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-900">{selectedDrawing.name}</h3>
              <p className="text-xs text-gray-500">
                {selectedDrawing.number} • Rev. {selectedDrawing.revision} • {selectedDrawing.scale}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  annotationMode 
                    ? 'bg-[rgb(236,107,44)] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={toggleAnnotationMode}
              >
                {annotationMode ? t('exitAnnotationMode') : t('addAnnotation')}
              </button>
              <button
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={handleCloseViewer}
              >
                {t('close')}
              </button>
            </div>
          </div>
          
          {/* Drawing canvas */}
          <div className="relative bg-gray-100 h-[500px] overflow-auto">
            {/* Placeholder for drawing image */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative h-full w-full bg-white" style={{ backgroundImage: `url(${selectedDrawing.thumbnail})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                {/* Annotations */}
                {selectedDrawing.annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    className={`absolute w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                      annotation.resolved ? 'bg-green-400' : 'bg-[rgb(236,107,44)]'
                    }`}
                    style={{ left: `${annotation.x}px`, top: `${annotation.y}px` }}
                    title={annotation.text[currentLanguage] || annotation.text['en']}
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                ))}
                
                {/* Annotation mode helper text */}
                {annotationMode && (
                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md">
                    <p className="text-sm">{t('clickToAddAnnotation')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Annotations list */}
          <div className="border-t border-gray-200 max-h-60 overflow-y-auto">
            <h4 className="px-4 py-2 bg-gray-50 font-medium text-sm">{t('annotations')}</h4>
            {selectedDrawing.annotations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {selectedDrawing.annotations.map(annotation => (
                  <div key={annotation.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className={`w-3 h-3 mt-1 rounded-full flex-shrink-0 ${
                        annotation.resolved ? 'bg-green-400' : 'bg-[rgb(236,107,44)]'
                      }`}></div>
                      <div className="ml-3">
                        <p className="text-sm">{annotation.text[currentLanguage] || annotation.text['en']}</p>
                        <div className="mt-1 flex text-xs text-gray-500">
                          <span>{annotation.createdBy}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(annotation.dateCreated)}</span>
                          <span className="mx-2">•</span>
                          <span>{annotation.resolved ? t('resolved') : t('unresolved')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-sm text-gray-500">{t('noAnnotations')}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      {!selectedDrawing && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            className="px-4 py-2 bg-[rgb(24,62,105)] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[rgb(19,49,84)]"
          >
            {t('uploadDrawing')}
          </button>
        </div>
      )}
    </div>
  );
}
