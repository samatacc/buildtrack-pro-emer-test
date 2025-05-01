import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  ZoomInIcon, 
  ZoomOutIcon, 
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useTranslations } from '@/app/hooks/useTranslations';
import { formatDate } from '@/app/utils/dateUtils';

// Timeline project type
interface TimelineProject {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed';
  milestones: {
    id: string;
    name: string;
    date: Date;
    completed: boolean;
  }[];
}

// Widget props
interface ProjectTimelineWidgetProps {
  isEditMode?: boolean;
}

// Helper function to get color based on status
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'on_hold':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

// Dummy data for demonstration purposes
const mockProjects: TimelineProject[] = [
  {
    id: 'p1',
    name: 'Riverfront Residences',
    startDate: new Date(2025, 1, 15), // Feb 15, 2025
    endDate: new Date(2025, 7, 30),   // Aug 30, 2025
    progress: 35,
    status: 'in_progress',
    milestones: [
      { id: 'm1', name: 'Foundation Complete', date: new Date(2025, 2, 20), completed: true },
      { id: 'm2', name: 'Framing Complete', date: new Date(2025, 4, 15), completed: false },
      { id: 'm3', name: 'Interior Work Begins', date: new Date(2025, 5, 1), completed: false },
      { id: 'm4', name: 'Final Inspection', date: new Date(2025, 7, 15), completed: false }
    ]
  },
  {
    id: 'p2',
    name: 'Silver Creek Office Complex',
    startDate: new Date(2025, 0, 5),  // Jan 5, 2025
    endDate: new Date(2025, 9, 20),   // Oct 20, 2025
    progress: 18,
    status: 'planning',
    milestones: [
      { id: 'm1', name: 'Site Preparation', date: new Date(2025, 0, 25), completed: true },
      { id: 'm2', name: 'Foundation Work', date: new Date(2025, 2, 10), completed: false },
      { id: 'm3', name: 'Structure Complete', date: new Date(2025, 5, 15), completed: false },
      { id: 'm4', name: 'Interior Work', date: new Date(2025, 7, 1), completed: false },
      { id: 'm5', name: 'Final Completion', date: new Date(2025, 9, 10), completed: false }
    ]
  },
  {
    id: 'p3',
    name: 'Oakridge Mall Renovation',
    startDate: new Date(2024, 11, 10), // Dec 10, 2024
    endDate: new Date(2025, 5, 30),    // Jun 30, 2025
    progress: 50,
    status: 'on_hold',
    milestones: [
      { id: 'm1', name: 'Demo Complete', date: new Date(2025, 0, 15), completed: true },
      { id: 'm2', name: 'Structure Modifications', date: new Date(2025, 2, 1), completed: true },
      { id: 'm3', name: 'Utility Work', date: new Date(2025, 3, 15), completed: false },
      { id: 'm4', name: 'Interior Finishes', date: new Date(2025, 5, 1), completed: false }
    ]
  },
  {
    id: 'p4',
    name: 'Hillside Residential Tower',
    startDate: new Date(2024, 9, 1),   // Oct 1, 2024
    endDate: new Date(2025, 3, 30),    // Apr 30, 2025
    progress: 90,
    status: 'completed',
    milestones: [
      { id: 'm1', name: 'Foundation Complete', date: new Date(2024, 10, 15), completed: true },
      { id: 'm2', name: 'Structure Complete', date: new Date(2025, 0, 30), completed: true },
      { id: 'm3', name: 'Interior Work', date: new Date(2025, 2, 15), completed: true },
      { id: 'm4', name: 'Final Inspection', date: new Date(2025, 3, 15), completed: true }
    ]
  }
];

const ProjectTimelineWidget: React.FC<ProjectTimelineWidgetProps> = ({ isEditMode = false }) => {
  const { t } = useTranslations('dashboard.widgets');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [projects, setProjects] = useState<TimelineProject[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  // Calculate timeline date range
  const allDates = projects.flatMap(p => [p.startDate, p.endDate, ...p.milestones.map(m => m.date)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  // Calculate total days in timeline
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate baseline width for a day in pixels
  const baseDayWidth = 20; // pixels per day
  const dayWidth = baseDayWidth * zoomLevel;
  
  // Calculate timeline total width
  const timelineWidth = totalDays * dayWidth;
  
  // Get visible date range
  const getVisibleDateRange = () => {
    if (!timelineRef.current) return { startDate: minDate, endDate: maxDate };
    
    const containerWidth = timelineRef.current.clientWidth;
    const visibleDays = containerWidth / dayWidth;
    
    const offsetDays = offset / dayWidth;
    const startDay = offsetDays;
    const endDay = offsetDays + visibleDays;
    
    const startDate = new Date(minDate);
    startDate.setDate(minDate.getDate() + startDay);
    
    const endDate = new Date(minDate);
    endDate.setDate(minDate.getDate() + endDay);
    
    return { startDate, endDate };
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Handle timeline scroll
  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = timelineRef.current ? timelineRef.current.clientWidth / 2 : 0;
    
    if (direction === 'left') {
      setOffset(prev => Math.max(prev - scrollAmount, 0));
    } else {
      setOffset(prev => Math.min(prev + scrollAmount, timelineWidth - (timelineRef.current?.clientWidth || 0)));
    }
  };
  
  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(prev => prev === projectId ? null : projectId);
  };
  
  // Calculate the position of a date on the timeline
  const getDatePosition = (date: Date): number => {
    const daysDiff = Math.ceil((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff * dayWidth;
  };
  
  // Calculate months to display
  const getMonthLabels = () => {
    const months: { label: string; position: number }[] = [];
    const startDate = new Date(minDate);
    startDate.setDate(1); // Start from the first day of the month
    
    while (startDate <= maxDate) {
      months.push({
        label: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        position: getDatePosition(startDate)
      });
      
      startDate.setMonth(startDate.getMonth() + 1);
    }
    
    return months;
  };
  
  // Generate today marker if today is within the timeline
  const getTodayMarker = () => {
    const today = new Date();
    
    if (today >= minDate && today <= maxDate) {
      return {
        position: getDatePosition(today),
        label: t('projectTimeline.today')
      };
    }
    
    return null;
  };
  
  // Format display date
  const displayDate = (date: Date): string => {
    return formatDate(date, 'MMM d, yyyy');
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-[rgb(24,62,105)]">
          {t('projectTimeline.title')}
        </h3>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleZoomOut}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={t('projectTimeline.zoomOut')}
          >
            <ZoomOutIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button 
            onClick={handleZoomIn}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={t('projectTimeline.zoomIn')}
          >
            <ZoomInIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button 
            onClick={() => handleScroll('left')}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={t('projectTimeline.scrollLeft')}
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button 
            onClick={() => handleScroll('right')}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={t('projectTimeline.scrollRight')}
          >
            <ArrowRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div 
          ref={timelineRef}
          className="relative h-full overflow-x-auto"
        >
          {/* Date scale */}
          <div 
            className="h-8 border-b border-gray-200 dark:border-gray-700 relative"
            style={{ width: `${timelineWidth}px`, transform: `translateX(-${offset}px)` }}
          >
            {getMonthLabels().map((month, index) => (
              <div 
                key={index}
                className="absolute top-0 text-xs font-medium text-gray-500 dark:text-gray-400"
                style={{ left: `${month.position}px` }}
              >
                <div className="h-5 border-l border-gray-300 dark:border-gray-600"></div>
                <div className="px-1">{month.label}</div>
              </div>
            ))}
          </div>
          
          {/* Timeline content */}
          <div 
            className="relative"
            style={{ width: `${timelineWidth}px`, transform: `translateX(-${offset}px)` }}
          >
            {/* Today marker */}
            {getTodayMarker() && (
              <div 
                className="absolute top-0 bottom-0 border-l-2 border-[rgb(236,107,44)] z-10"
                style={{ left: `${getTodayMarker()?.position}px` }}
              >
                <div className="absolute -top-8 -left-11 bg-[rgb(236,107,44)] text-white text-xs py-1 px-2 rounded">
                  {getTodayMarker()?.label}
                </div>
              </div>
            )}
            
            {/* Project timelines */}
            {projects.map((project, index) => {
              const isSelected = selectedProject === project.id;
              const startPos = getDatePosition(project.startDate);
              const endPos = getDatePosition(project.endDate);
              const width = endPos - startPos;
              
              return (
                <div 
                  key={project.id} 
                  className={`mb-6 ${isSelected ? 'z-20' : 'z-0'}`}
                >
                  {/* Project label */}
                  <div 
                    className="flex items-center h-8 cursor-pointer"
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <div className="w-40 pr-4 flex-shrink-0 truncate font-medium text-sm">
                      {project.name}
                    </div>
                    
                    <div className="relative flex-1 h-full">
                      {/* Project bar */}
                      <div 
                        className={`absolute h-6 rounded-md border ${
                          isSelected ? 'border-[rgb(24,62,105)]' : 'border-gray-300 dark:border-gray-600'
                        } ${getStatusColor(project.status)}`}
                        style={{ 
                          left: `${startPos}px`, 
                          width: `${width}px`,
                          opacity: isSelected ? 1 : 0.8
                        }}
                      >
                        {/* Progress bar */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-[rgb(236,107,44)] bg-opacity-70 rounded-l-md"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                        
                        {/* Only show label if there's enough space */}
                        {width > 80 && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium truncate px-2">
                            {project.progress}% Complete
                          </div>
                        )}
                      </div>
                      
                      {/* Milestones */}
                      {project.milestones.map((milestone) => {
                        const milestonePos = getDatePosition(milestone.date);
                        
                        return (
                          <div 
                            key={milestone.id}
                            className={`absolute ${
                              milestone.completed 
                                ? 'bg-green-500' 
                                : 'bg-gray-400 dark:bg-gray-500'
                            } rounded-full w-3 h-3 -ml-1.5 border-2 border-white dark:border-gray-800`}
                            style={{ 
                              left: `${milestonePos}px`, 
                              top: '12px' 
                            }}
                            title={`${milestone.name} (${displayDate(milestone.date)})`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Expanded project details */}
                  {isSelected && (
                    <div className="ml-40 pl-4 pb-2 text-sm text-gray-600 dark:text-gray-300 grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">{t('projectTimeline.duration')}: </span>
                        {displayDate(project.startDate)} - {displayDate(project.endDate)}
                      </div>
                      <div>
                        <span className="font-medium">{t('projectTimeline.status')}: </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">{t('projectTimeline.milestones')}: </span>
                        <ul className="mt-1 space-y-1">
                          {project.milestones.map((milestone) => (
                            <li key={milestone.id} className="flex items-center">
                              <span className={`w-3 h-3 rounded-full mr-2 ${
                                milestone.completed 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-400 dark:bg-gray-500'
                              }`}></span>
                              <span>{milestone.name}</span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                ({displayDate(milestone.date)})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimelineWidget;
