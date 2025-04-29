'use client';

import { useState, useEffect, useRef } from 'react';
import { useNamespacedTranslations } from '@/app/hooks/useNamespacedTranslations';
import { useFieldMode } from './FieldModeProvider';
import { getOfflineData, cacheForOffline } from '@/app/utils/offlineSyncManager';

/**
 * MobileDocumentViewer Component
 * 
 * A specialized document viewer optimized for field use in construction environments.
 * Supports drawing annotations, measurements, and offline document access.
 * 
 * Features:
 * - Touch-friendly controls for field usage
 * - Pinch-to-zoom and swipe navigation
 * - Annotation tools for site markups
 * - Offline mode with document caching
 * - Low bandwidth mode for limited connectivity
 * - High contrast mode for outdoor visibility
 */

interface Annotation {
  id: string;
  type: 'text' | 'arrow' | 'rectangle' | 'circle' | 'freehand';
  points: { x: number; y: number }[];
  color: string;
  text?: string;
  author: string;
  timestamp: number;
}

interface DocumentViewerProps {
  documentId: string;
  projectId: string;
  initialPage?: number;
  className?: string;
  readOnly?: boolean;
}

export default function MobileDocumentViewer({
  documentId,
  projectId,
  initialPage = 1,
  className = '',
  readOnly = false
}: DocumentViewerProps) {
  const { t } = useNamespacedTranslations('mobile');
  const { isFieldModeEnabled, isOnline, isLowDataMode } = useFieldMode();
  
  // Document state
  const [document, setDocument] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<Annotation['type']>('text');
  const [annotationColor, setAnnotationColor] = useState('#FF5722');
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load document data (either from API or offline cache)
  useEffect(() => {
    const loadDocument = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        let documentData;
        
        // First try to get from offline cache if in field mode
        if (isFieldModeEnabled) {
          documentData = await getOfflineData('documents', documentId);
        }
        
        // If not in cache or not in field mode, fetch from API
        if (!documentData && isOnline) {
          const response = await fetch(`/api/documents/${documentId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to load document: ${response.statusText}`);
          }
          
          documentData = await response.json();
          
          // Cache for offline use if in field mode
          if (isFieldModeEnabled) {
            await cacheForOffline('documents', documentData);
          }
        }
        
        if (!documentData) {
          throw new Error(t('noOfflineData'));
        }
        
        setDocument(documentData);
        setTotalPages(documentData.pageCount || 1);
        
        // Load annotations
        const annotationsData = isFieldModeEnabled 
          ? await getOfflineData('annotations', `${documentId}-annotations`) 
          : null;
          
        if (annotationsData) {
          setAnnotations(annotationsData as Annotation[]);
        } else if (isOnline) {
          const annotationsResponse = await fetch(`/api/documents/${documentId}/annotations`);
          if (annotationsResponse.ok) {
            const fetchedAnnotations = await annotationsResponse.json();
            setAnnotations(fetchedAnnotations);
            
            // Cache annotations for offline use
            if (isFieldModeEnabled) {
              await cacheForOffline('annotations', fetchedAnnotations);
            }
          }
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setLoadError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocument();
  }, [documentId, isFieldModeEnabled, isOnline, t]);
  
  // Handle page navigation
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Reset zoom and position when changing pages
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };
  
  // Handle touch events for pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Calculate distance between two touch points
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      setInitialTouchDistance(distance);
      setInitialScale(scale);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (initialTouchDistance && e.touches.length === 2) {
      // Calculate new distance
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Calculate new scale (with limits)
      const newScale = Math.min(
        Math.max(initialScale * (currentDistance / initialTouchDistance), 0.5),
        5
      );
      
      setScale(newScale);
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan when zoomed in
      const touch = e.touches[0];
      
      // Calculate movement
      const deltaX = touch.clientX - (e.currentTarget as HTMLElement).offsetLeft;
      const deltaY = touch.clientY - (e.currentTarget as HTMLElement).offsetTop;
      
      setPosition({
        x: deltaX / scale,
        y: deltaY / scale
      });
    }
  };
  
  const handleTouchEnd = () => {
    setInitialTouchDistance(null);
  };
  
  // Annotation drawing
  const startAnnotation = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly || !isAnnotating) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Get canvas position
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    
    // Start new annotation
    setCurrentAnnotation({
      type: annotationTool,
      points: [{ x, y }],
      color: annotationColor
    });
  };
  
  const continueAnnotation = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly || !isAnnotating || !currentAnnotation) return;
    
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Get canvas position
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    
    // Add point to current annotation
    setCurrentAnnotation(prev => {
      if (!prev) return null;
      
      if (prev.type === 'freehand') {
        // For freehand, add all points
        return {
          ...prev,
          points: [...prev.points, { x, y }]
        };
      } else {
        // For other shapes, just update the end point
        const points = [...prev.points];
        if (points.length > 1) {
          points[1] = { x, y };
        } else {
          points.push({ x, y });
        }
        return {
          ...prev,
          points
        };
      }
    });
  };
  
  const finishAnnotation = () => {
    if (readOnly || !isAnnotating || !currentAnnotation) return;
    
    // Only save if we have at least 2 points (or 1 for text)
    if (currentAnnotation.points.length < 1 || 
        (currentAnnotation.type !== 'text' && currentAnnotation.points.length < 2)) {
      setCurrentAnnotation(null);
      return;
    }
    
    // Create complete annotation
    const newAnnotation: Annotation = {
      id: `anno-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: currentAnnotation.type as Annotation['type'],
      points: currentAnnotation.points,
      color: currentAnnotation.color || '#FF5722',
      author: 'Mobile User', // Should come from auth context
      timestamp: Date.now(),
      text: currentAnnotation.type === 'text' ? 'New note' : undefined
    };
    
    setAnnotations(prev => [...prev, newAnnotation]);
    setCurrentAnnotation(null);
    
    // Cache annotations for offline use
    if (isFieldModeEnabled) {
      cacheForOffline('annotations', [...annotations, newAnnotation]);
    }
  };
  
  // Render annotations on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions to match container
    if (contentRef.current) {
      canvas.width = contentRef.current.clientWidth;
      canvas.height = contentRef.current.clientHeight;
    }
    
    // Apply scaling
    ctx.scale(scale, scale);
    
    // Draw all saved annotations
    [...annotations, currentAnnotation].filter(Boolean).forEach(annotation => {
      if (!annotation) return;
      
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      
      switch (annotation.type) {
        case 'arrow':
          if (annotation.points.length >= 2) {
            const [start, end] = annotation.points;
            
            // Draw line
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            
            // Draw arrowhead
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const headLength = 15 / scale;
            
            ctx.lineTo(
              end.x - headLength * Math.cos(angle - Math.PI / 6),
              end.y - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(
              end.x - headLength * Math.cos(angle + Math.PI / 6),
              end.y - headLength * Math.sin(angle + Math.PI / 6)
            );
          }
          break;
          
        case 'rectangle':
          if (annotation.points.length >= 2) {
            const [start, end] = annotation.points;
            const width = end.x - start.x;
            const height = end.y - start.y;
            
            ctx.rect(start.x, start.y, width, height);
          }
          break;
          
        case 'circle':
          if (annotation.points.length >= 2) {
            const [start, end] = annotation.points;
            const radius = Math.hypot(end.x - start.x, end.y - start.y);
            
            ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
          }
          break;
          
        case 'freehand':
          if (annotation.points.length >= 1) {
            const [first, ...rest] = annotation.points;
            
            ctx.moveTo(first.x, first.y);
            rest.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
          }
          break;
          
        case 'text':
          if (annotation.points.length >= 1 && annotation.text) {
            const [position] = annotation.points;
            
            ctx.font = `${14 / scale}px Arial`;
            ctx.fillText(annotation.text, position.x, position.y);
          }
          break;
      }
      
      ctx.stroke();
    });
    
    // Reset scale transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
  }, [annotations, currentAnnotation, scale, position]);
  
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(24,62,105)]"></div>
        <p className="mt-4 text-gray-600">{t('loadingOfflineData')}</p>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg ${className}`}>
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="mt-4 text-red-800">{loadError}</p>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        <p className="text-gray-600">{t('noOfflineData')}</p>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Document viewer */}
      <div 
        className="flex-1 relative overflow-hidden bg-gray-100 border border-gray-300 rounded-lg"
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={startAnnotation}
        onMouseMove={continueAnnotation}
        onMouseUp={finishAnnotation}
        onTouchEnd={finishAnnotation}
      >
        {/* Document image/content */}
        <div 
          className="absolute transform origin-top-left"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
          }}
        >
          {/* Document content (e.g. PDF page or image) */}
          <img 
            src={isLowDataMode 
              ? document.pages?.[currentPage - 1]?.lowResUrl
              : document.pages?.[currentPage - 1]?.url
            } 
            alt={`Page ${currentPage}`}
            className="max-w-full h-auto"
          />
        </div>
        
        {/* Canvas for annotations */}
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {/* Hover tooltips on annotations could be added here */}
      </div>
      
      {/* Controls */}
      <div className="flex justify-between items-center p-2 bg-white border-t border-gray-200">
        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full bg-gray-100 disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            aria-label={t('previous')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>
          
          <button
            className="p-2 rounded-full bg-gray-100 disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
            aria-label={t('next')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
        
        {/* Zoom controls */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full bg-gray-100 disabled:opacity-50"
            disabled={scale <= 0.5}
            onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))}
            aria-label="Zoom out"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
            </svg>
          </button>
          
          <span className="text-sm">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            className="p-2 rounded-full bg-gray-100 disabled:opacity-50"
            disabled={scale >= 5}
            onClick={() => setScale(prev => Math.min(prev + 0.25, 5))}
            aria-label="Zoom in"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
        
        {/* Annotation toggle */}
        {!readOnly && (
          <button
            className={`p-2 rounded-full ${isAnnotating ? 'bg-[rgb(236,107,44)] text-white' : 'bg-gray-100'}`}
            onClick={() => setIsAnnotating(prev => !prev)}
            aria-label={isAnnotating ? t('stopDrawing') : t('startDrawing')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </button>
        )}
      </div>
      
      {/* Annotation tools - only shown when annotating */}
      {isAnnotating && !readOnly && (
        <div className="p-2 bg-white border-t border-gray-200 flex flex-wrap justify-between gap-2">
          {/* Tool selection */}
          <div className="flex space-x-1">
            {[
              { id: 'text', icon: 'T', label: 'Text' },
              { id: 'arrow', icon: '→', label: 'Arrow' },
              { id: 'rectangle', icon: '□', label: 'Rectangle' },
              { id: 'circle', icon: '○', label: 'Circle' },
              { id: 'freehand', icon: '✎', label: 'Freehand' }
            ].map(tool => (
              <button
                key={tool.id}
                className={`w-10 h-10 flex items-center justify-center rounded-md text-lg
                  ${annotationTool === tool.id 
                    ? 'bg-[rgb(24,62,105)] text-white' 
                    : 'bg-gray-100 text-gray-700'
                  }`}
                onClick={() => setAnnotationTool(tool.id as Annotation['type'])}
                aria-label={tool.label}
              >
                {tool.icon}
              </button>
            ))}
          </div>
          
          {/* Color selection */}
          <div className="flex space-x-1">
            {[
              '#FF5722', // Orange
              '#2196F3', // Blue
              '#4CAF50', // Green
              '#F44336', // Red
              '#9C27B0'  // Purple
            ].map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full ${annotationColor === color ? 'ring-2 ring-gray-600' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setAnnotationColor(color)}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          
          {/* Clear button */}
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
            onClick={() => setAnnotations([])}
          >
            {t('clearDrawing')}
          </button>
        </div>
      )}
      
      {/* Cache for offline button - only shown when online and in field mode but not cached yet */}
      {isOnline && isFieldModeEnabled && (
        <div className="p-2 bg-white border-t border-gray-200">
          <button
            className="w-full py-2 bg-[rgb(24,62,105)] text-white rounded-md text-sm"
            onClick={() => cacheForOffline('documents', document)}
          >
            {t('cacheForOffline')}
          </button>
        </div>
      )}
    </div>
  );
}
