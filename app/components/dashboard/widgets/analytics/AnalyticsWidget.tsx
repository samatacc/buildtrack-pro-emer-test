import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { WidgetProps } from '@/lib/types/widget';
import { AnalyticsWidgetSettings } from '@/lib/types/widgetSettings';
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Simulate fetching analytics data
const fetchAnalyticsData = async (timeRange: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate different data based on the time range
  const generateData = (points: number, variance = 20, baseline = 70) => {
    return Array(points).fill(0).map((_, i) => {
      return baseline + Math.floor(Math.random() * variance) - variance / 2;
    });
  };
  
  const labels = {
    'week': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    'month': Array(30).fill(0).map((_, i) => (i + 1).toString()),
    'quarter': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, Math.min(3, new Date().getMonth() + 1)),
    'year': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };
  
  const points = {
    'week': 7,
    'month': 30,
    'quarter': 3,
    'year': 12
  };
  
  const range = timeRange as keyof typeof labels || 'month';
  
  return {
    labels: labels[range],
    datasets: [
      {
        label: 'Task Completion Rate',
        data: generateData(points[range], 20, 70),
        color: '#4F46E5' // indigo-600
      },
      {
        label: 'Budget Utilization',
        data: generateData(points[range], 15, 65),
        color: '#059669' // emerald-600
      },
      {
        label: 'Project Velocity',
        data: generateData(points[range], 25, 60),
        color: '#DC2626' // red-600
      }
    ],
    breakdowns: {
      tasksByStatus: [
        { label: 'Completed', value: 68, color: '#4F46E5' },
        { label: 'In Progress', value: 24, color: '#059669' },
        { label: 'Blocked', value: 8, color: '#DC2626' }
      ],
      projectsByHealth: [
        { label: 'On Track', value: 72, color: '#059669' },
        { label: 'At Risk', value: 18, color: '#F59E0B' },
        { label: 'Delayed', value: 10, color: '#DC2626' }
      ],
      resourceUtilization: [
        { label: 'Optimal', value: 62, color: '#4F46E5' },
        { label: 'Over-allocated', value: 28, color: '#F59E0B' },
        { label: 'Under-allocated', value: 10, color: '#BFDBFE' }
      ]
    }
  };
};

// Simple line chart component
const LineChart: React.FC<{
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
  height?: number;
}> = ({ data, height = 200 }) => {
  // Find the max value to scale the chart
  const maxValue = Math.max(...data.datasets.flatMap(dataset => dataset.data)) * 1.1;
  
  return (
    <div className="relative" style={{ height: `${height}px` }}>
      {/* Y-axis and horizontal grid lines */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
        {[0, 25, 50, 75, 100].map(value => (
          <div key={value} className="relative">
            <span>{value}%</span>
            <div 
              className="absolute left-8 right-0 h-px bg-gray-200 dark:bg-gray-700" 
              style={{ 
                bottom: `${(value / 100) * height}px`,
                width: 'calc(100vw - 2rem)'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Chart area */}
      <div className="ml-10 h-full flex items-end">
        {data.labels.map((label, i) => (
          <div 
            key={label + i} 
            className="flex-1 h-full flex flex-col justify-end items-center relative"
          >
            {/* Data points for each dataset */}
            {data.datasets.map((dataset, datasetIndex) => {
              const value = dataset.data[i];
              const heightPercentage = (value / maxValue) * 100;
              
              return (
                <div 
                  key={dataset.label}
                  className="absolute bottom-6 w-2 rounded-t"
                  style={{ 
                    backgroundColor: dataset.color,
                    height: `${heightPercentage}%`,
                    left: `calc(50% + ${datasetIndex * 4 - 4}px)`
                  }}
                  title={`${dataset.label}: ${value}%`}
                />
              );
            })}
            
            {/* X-axis labels */}
            <div className="h-6 text-xs text-gray-500 mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple pie chart component
const PieChart: React.FC<{
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  size?: number;
}> = ({ data, size = 150 }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate stroke dasharray and dashoffset for each segment
  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = cumulativePercentage;
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle: cumulativePercentage
    };
  });

  // Calculate circle properties
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="flex justify-center items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, i) => {
          const strokeDasharray = (segment.percentage / 100) * circumference;
          const strokeDashoffset = ((100 - segment.startAngle) / 100) * circumference;
          
          return (
            <circle
              key={segment.label}
              r={radius - 10}
              cx={radius}
              cy={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="20"
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="ml-4 text-sm">
        {segments.map(segment => (
          <div key={segment.label} className="flex items-center mb-1">
            <div 
              className="w-3 h-3 mr-2 rounded-sm" 
              style={{ backgroundColor: segment.color }} 
            />
            <span className="text-gray-700 dark:text-gray-300">{segment.label}:</span>
            <span className="ml-1 font-medium">{segment.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslations('dashboard');
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeChart, setActiveChart] = useState<'line' | 'pie'>('line');
  const [activeMetric, setActiveMetric] = useState<string>('tasksByStatus');
  
  // Get settings with defaults
  const widgetSettings = settings as AnalyticsWidgetSettings || {};
  const timeRange = widgetSettings.timeRange || 'month';
  const chartType = widgetSettings.chartType || 'line';
  const screenSize = widgetSettings.screenSize || 'md';
  
  // Adjust chart dimensions based on screen size
  const getChartHeight = () => {
    if (screenSize === 'xxs') return 120;
    if (screenSize === 'xs') return 150;
    if (screenSize === 'sm') return 180;
    return 200;
  };
  
  const getPieSize = () => {
    if (screenSize === 'xxs') return 100;
    if (screenSize === 'xs') return 120;
    if (screenSize === 'sm') return 130;
    return 150;
  };
  
  // Fetch analytics data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAnalyticsData(timeRange);
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load analytics data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up refresh interval if specified in settings
    const refreshRate = widgetSettings.refreshRate;
    if (refreshRate && refreshRate > 0) {
      const interval = setInterval(loadData, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [timeRange, widgetSettings.refreshRate]);
  
  // Handle timeframe selector
  const handleTimeRangeChange = (newRange: string) => {
    if (settings.onSettingsChange) {
      settings.onSettingsChange({
        ...widgetSettings,
        timeRange: newRange
      });
    }
  };
  
  // Handle chart type change
  const handleChartTypeChange = (type: 'line' | 'pie') => {
    setActiveChart(type);
    
    if (settings.onSettingsChange) {
      settings.onSettingsChange({
        ...widgetSettings,
        chartType: type
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`animate-spin rounded-full ${screenSize === 'xxs' || screenSize === 'xs' ? 'h-4 w-4' : 'h-6 w-6'} border-t-2 border-b-2 border-blue-600`}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500">
        <p className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'}`}>{t('widget.errorLoading')}</p>
        <p className={`${screenSize === 'xxs' ? 'text-xs' : 'text-sm'} mt-1`}>{error.message}</p>
      </div>
    );
  }
  
  if (!analyticsData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p className={`${screenSize === 'xxs' || screenSize === 'xs' ? 'text-xs' : 'text-sm'}`}>{t('analytics.noData')}</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        {/* Chart Type Selection */}
        <div className="flex space-x-2">
          <button 
            className={`p-1.5 rounded-md ${activeChart === 'line' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => handleChartTypeChange('line')}
            title={t('analytics.lineChart')}
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
          </button>
          <button 
            className={`p-1.5 rounded-md ${activeChart === 'pie' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            onClick={() => handleChartTypeChange('pie')}
            title={t('analytics.pieChart')}
          >
            <ChartPieIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Time Range Selection */}
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-1 hidden sm:inline">
            <CalendarIcon className="w-4 h-4 inline-block align-text-bottom mr-1" />
            {t('analytics.timeRange')}:
          </span>
          <select
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300"
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            <option value="week">{t('analytics.timeRanges.week')}</option>
            <option value="month">{t('analytics.timeRanges.month')}</option>
            <option value="quarter">{t('analytics.timeRanges.quarter')}</option>
            <option value="year">{t('analytics.timeRanges.year')}</option>
          </select>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="flex-1 overflow-hidden">
        {activeChart === 'line' ? (
          <LineChart data={analyticsData} height={getChartHeight()} />
        ) : (
          <div className="h-full flex flex-col">
            {/* Chart Type Selector for Pie Chart */}
            <div className="flex space-x-2 mb-2 overflow-x-auto pb-1">
              {Object.keys(analyticsData.breakdowns).map(metric => (
                <button
                  key={metric}
                  className={`flex flex-col items-center justify-center ${screenSize === 'xxs' ? 'p-1' : screenSize === 'xs' ? 'p-1.5' : 'p-2'} rounded-md ${activeMetric === metric ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setActiveMetric(metric)}
                >
                  {t(`analytics.metrics.${metric}`)}
                </button>
              ))}
            </div>
            
            {/* Selected Pie Chart */}
            <div className="flex-1 flex items-center justify-center">
              <PieChart data={analyticsData.breakdowns[activeMetric]} size={180} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsWidget;
