import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { ProjectStatus } from '@/lib/types/project';
import { WidgetProps } from '@/lib/types/widget';

// Mock service for project timeline data
const fetchProjectTimeline = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const today = new Date();
  
  return {
    startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    endDate: new Date(today.getFullYear(), today.getMonth() + 5, 0),
    today: today,
    projects: [
      {
        id: 'proj-001',
        name: 'Downtown Office Renovation',
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
        endDate: new Date(today.getFullYear(), today.getMonth() + 2, 20),
        status: ProjectStatus.IN_PROGRESS,
        color: '#4F46E5', // indigo-600
        milestones: [
          {
            id: 'ms-001-1',
            name: 'Design Approval',
            date: new Date(today.getFullYear(), today.getMonth() - 0, 5),
            completed: true
          },
          {
            id: 'ms-001-2',
            name: 'Demolition Complete',
            date: new Date(today.getFullYear(), today.getMonth() + 0, 25),
            completed: false
          },
          {
            id: 'ms-001-3',
            name: 'Framing Inspection',
            date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
            completed: false
          }
        ]
      },
      {
        id: 'proj-002',
        name: 'Highland Park Residence',
        startDate: new Date(today.getFullYear(), today.getMonth() - 0, 10),
        endDate: new Date(today.getFullYear(), today.getMonth() + 3, 25),
        status: ProjectStatus.IN_PROGRESS,
        color: '#059669', // emerald-600
        milestones: [
          {
            id: 'ms-002-1',
            name: 'Foundation Complete',
            date: new Date(today.getFullYear(), today.getMonth() + 0, 30),
            completed: false
          },
          {
            id: 'ms-002-2',
            name: 'Framing Complete',
            date: new Date(today.getFullYear(), today.getMonth() + 1, 25),
            completed: false
          }
        ]
      },
      {
        id: 'proj-003',
        name: 'Riverside Mall Expansion',
        startDate: new Date(today.getFullYear(), today.getMonth() - 2, 5),
        endDate: new Date(today.getFullYear(), today.getMonth() + 4, 15),
        status: ProjectStatus.IN_PROGRESS,
        color: '#D97706', // amber-600
        milestones: [
          {
            id: 'ms-003-1',
            name: 'Permits Approved',
            date: new Date(today.getFullYear(), today.getMonth() - 1, 20),
            completed: true
          },
          {
            id: 'ms-003-2',
            name: 'Phase 1 Complete',
            date: new Date(today.getFullYear(), today.getMonth() + 0, 10),
            completed: true
          },
          {
            id: 'ms-003-3',
            name: 'Phase 2 Complete',
            date: new Date(today.getFullYear(), today.getMonth() + 2, 5),
            completed: false
          }
        ]
      },
      {
        id: 'proj-004',
        name: 'Metro Transit Terminal',
        startDate: new Date(today.getFullYear(), today.getMonth() + 0, 20),
        endDate: new Date(today.getFullYear(), today.getMonth() + 5, 10),
        status: ProjectStatus.IN_PROGRESS,
        color: '#DC2626', // red-600
        milestones: [
          {
            id: 'ms-004-1',
            name: 'Site Preparation',
            date: new Date(today.getFullYear(), today.getMonth() + 1, 5),
            completed: false
          }
        ]
      }
    ]
  };
};

// Helper function to format date
const formatDate = (date: Date, locale: string, format: 'short' | 'medium' | 'long' = 'medium') => {
  const options: Intl.DateTimeFormatOptions = {
    month: format === 'short' ? 'short' : format === 'medium' ? 'short' : 'long',
    day: 'numeric',
    year: format === 'short' ? undefined : 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, options).format(date);
};

const ProjectTimelineWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t, locale } = useTranslation('dashboard');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [timelineData, setTimelineData] = useState<any | null>(null);
  const [visibleRange, setVisibleRange] = useState<{start: Date, end: Date} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Number of days to display in the visible range
  const daysToShow = settings?.daysToShow || 90;
  
  // Load timeline data
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProjectTimeline();
        setTimelineData(data);
        
        // Set default visible range centered around today
        const today = new Date();
        const rangeStartDate = new Date(today);
        rangeStartDate.setDate(today.getDate() - Math.floor(daysToShow / 3));
        
        const rangeEndDate = new Date(rangeStartDate);
        rangeEndDate.setDate(rangeStartDate.getDate() + daysToShow);
        
        setVisibleRange({
          start: rangeStartDate,
          end: rangeEndDate
        });
        
        setError(null);
      } catch (err) {
        console.error('Error loading timeline:', err);
        setError(err instanceof Error ? err : new Error('Failed to load timeline'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTimeline();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadTimeline, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [daysToShow, settings]);
  
  // Scroll to today when timeline is loaded
  useEffect(() => {
    if (timelineData && scrollContainerRef.current) {
      // Find today's position and scroll to it
      const todayElement = scrollContainerRef.current.querySelector('[data-date="today"]');
      if (todayElement) {
        // Scroll to today minus some offset to center it
        const offset = scrollContainerRef.current.clientWidth / 3;
        scrollContainerRef.current.scrollLeft = (todayElement as HTMLElement).offsetLeft - offset;
      }
    }
  }, [timelineData]);
  
  // Handle scrolling the timeline left/right
  const handleScroll = (direction: 'left' | 'right') => {
    if (!visibleRange) return;
    
    const rangeInDays = daysToShow;
    const scrollDays = Math.floor(rangeInDays / 2);
    
    const newStart = new Date(visibleRange.start);
    const newEnd = new Date(visibleRange.end);
    
    if (direction === 'left') {
      newStart.setDate(newStart.getDate() - scrollDays);
      newEnd.setDate(newEnd.getDate() - scrollDays);
    } else {
      newStart.setDate(newStart.getDate() + scrollDays);
      newEnd.setDate(newEnd.getDate() + scrollDays);
    }
    
    setVisibleRange({
      start: newStart,
      end: newEnd
    });
  };
  
  // Get the range of dates to display
  const getDateRange = () => {
    if (!visibleRange) return [];
    
    const dates: Date[] = [];
    const currentDate = new Date(visibleRange.start);
    
    while (currentDate <= visibleRange.end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is the first of the month
  const isFirstOfMonth = (date: Date) => {
    return date.getDate() === 1;
  };
  
  // Generate milestone markers
  const renderMilestone = (milestone: any, projectColor: string) => {
    return (
      <div 
        key={milestone.id}
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 ${
          milestone.completed ? 'opacity-70' : 'opacity-100'
        }`}
        style={{ 
          left: `${getDayPosition(milestone.date)}%`,
          top: '50%'
        }}
        title={`${milestone.name} - ${formatDate(milestone.date, locale, 'long')}`}
      >
        <div 
          className={`w-4 h-4 rounded-full border-2 ${
            milestone.completed ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
          }`}
          style={{ borderColor: projectColor }}
        ></div>
        <div 
          className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap px-1 py-0.5 rounded"
          style={{ backgroundColor: projectColor, color: 'white' }}
        >
          {milestone.name}
        </div>
      </div>
    );
  };
  
  // Calculate the position of a date within the visible range as a percentage
  const getDayPosition = (date: Date) => {
    if (!visibleRange) return 0;
    
    const totalDays = (visibleRange.end.getTime() - visibleRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const daysFromStart = (date.getTime() - visibleRange.start.getTime()) / (1000 * 60 * 60 * 24);
    
    return (daysFromStart / totalDays) * 100;
  };
  
  // Calculate project bar position and width
  const getProjectBarStyle = (project: any) => {
    if (!visibleRange) return { left: '0%', width: '0%' };
    
    const projectStart = Math.max(project.startDate.getTime(), visibleRange.start.getTime());
    const projectEnd = Math.min(project.endDate.getTime(), visibleRange.end.getTime());
    
    const startPosition = getDayPosition(new Date(projectStart));
    const endPosition = getDayPosition(new Date(projectEnd));
    
    return {
      left: `${startPosition}%`,
      width: `${endPosition - startPosition}%`,
      backgroundColor: project.color
    };
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p>{t('widget.errorLoading')}</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }
  
  if (!timelineData || !visibleRange) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('project.noTimelineData')}</p>
      </div>
    );
  }
  
  const dateRange = getDateRange();
  
  return (
    <div className="h-full flex flex-col">
      {/* Timeline Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleScroll('left')}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            aria-label={t('timeline.scrollLeft')}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleScroll('right')}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            aria-label={t('timeline.scrollRight')}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">
            {formatDate(visibleRange.start, locale, 'medium')} - {formatDate(visibleRange.end, locale, 'medium')}
          </span>
        </div>
        
        <button
          onClick={() => {
            if (timelineData) {
              // Reset to today
              const today = new Date();
              const rangeStartDate = new Date(today);
              rangeStartDate.setDate(today.getDate() - Math.floor(daysToShow / 3));
              
              const rangeEndDate = new Date(rangeStartDate);
              rangeEndDate.setDate(rangeStartDate.getDate() + daysToShow);
              
              setVisibleRange({
                start: rangeStartDate,
                end: rangeEndDate
              });
            }
          }}
          className="flex items-center p-1 px-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          aria-label={t('timeline.todayButton')}
        >
          <CalendarIcon className="w-3 h-3 mr-1" />
          {t('timeline.today')}
        </button>
      </div>
      
      {/* Timeline Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative"
        role="region"
        aria-label={t('timeline.timelineTitle')}
      >
        {/* Timeline Header - Days */}
        <div className="relative h-8 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap min-w-full">
          {dateRange.map((date, index) => (
            <div
              key={date.toISOString()}
              className={`absolute top-0 inline-block text-xs ${
                isToday(date) ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              } ${isFirstOfMonth(date) ? 'border-l border-gray-300 dark:border-gray-600' : ''}`}
              style={{ left: `${(index / dateRange.length) * 100}%`, width: `${100 / dateRange.length}%` }}
              data-date={isToday(date) ? 'today' : ''}
            >
              <div className="px-1">
                {isFirstOfMonth(date) ? (
                  <>
                    <span className="text-xs font-medium">
                      {new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)}
                    </span>
                    <br />
                  </>
                ) : null}
                <span>{date.getDate()}</span>
              </div>
              
              {isToday(date) && (
                <div className="absolute h-full top-0 left-1/2 border-l-2 border-blue-600 dark:border-blue-500 z-10"></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Timeline Body - Projects */}
        <div className="relative">
          {timelineData.projects.map((project: any, index: number) => (
            <div 
              key={project.id}
              className="relative h-16 border-b border-gray-200 dark:border-gray-700"
            >
              {/* Project Label */}
              <div className="absolute left-0 top-0 h-full flex items-center z-20 bg-white dark:bg-gray-800 pr-2">
                <span 
                  className="text-xs font-medium truncate max-w-[100px]"
                  title={project.name}
                >
                  {project.name}
                </span>
              </div>
              
              {/* Project Bar */}
              <div
                className="absolute h-6 top-1/2 transform -translate-y-1/2 rounded-md"
                style={getProjectBarStyle(project)}
                role="img"
                aria-label={`${project.name}: ${formatDate(project.startDate, locale)} to ${formatDate(project.endDate, locale)}`}
              >
                <div className="h-full rounded-md px-2 flex items-center overflow-hidden text-white text-xs">
                  {project.name}
                </div>
              </div>
              
              {/* Project Milestones */}
              {project.milestones.map((milestone: any) => renderMilestone(milestone, project.color))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimelineWidget;
