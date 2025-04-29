import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-intl';
import { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { WidgetProps } from '@/lib/types/widget';

// Need to import required Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock service for progress report data
const fetchProgressReportData = async (timeframe: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Generate dates for the x-axis based on timeframe
  const today = new Date();
  let dates: string[] = [];
  let plannedData: number[] = [];
  let actualData: number[] = [];
  let predictedData: number[] = [];
  
  // Different data based on timeframe
  if (timeframe === 'week') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Sample data
      plannedData.push(20 + i * 10); // Linear progress plan
      
      // Actual progress with some variance
      const variance = Math.random() * 6 - 3; // Random variance between -3 and 3
      actualData.push(Math.max(0, Math.min(100, 15 + i * 10 + variance)));
      
      // Only add prediction points for future days
      if (i < 3) {
        predictedData.push(null);
      } else {
        predictedData.push(null);
      }
    }
    
    // Add prediction for future days
    const lastActual = actualData[actualData.length - 1];
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      plannedData.push(20 + (i + 6) * 10);
      actualData.push(null);
      
      // Simple linear prediction
      const predictedValue = Math.min(100, lastActual + i * 10);
      predictedData.push(predictedValue);
    }
  } else if (timeframe === 'month') {
    // Last 4 weeks (showing weekly data points)
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - (i * 7));
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Sample data with weekly progression
      plannedData.push(Math.min(100, 10 + (4 - i) * 20)); // Linear plan for 5 weeks
      
      // Actual progress with some variance
      const variance = Math.random() * 10 - 5; // Random variance between -5 and 5
      actualData.push(Math.max(0, Math.min(100, 5 + (4 - i) * 18 + variance)));
      
      if (i < 1) {
        predictedData.push(null);
      } else {
        predictedData.push(null);
      }
    }
    
    // Add prediction for future weeks
    const lastActual = actualData[actualData.length - 1];
    for (let i = 1; i <= 2; i++) {
      const date = new Date();
      date.setDate(today.getDate() + (i * 7));
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      plannedData.push(Math.min(100, 10 + (4 + i) * 20));
      actualData.push(null);
      
      // Predicted value
      const predictedValue = Math.min(100, lastActual + i * 18);
      predictedData.push(predictedValue);
    }
  } else { // quarter
    // Last 3 months (showing monthly data points)
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      
      // Sample data with monthly progression
      plannedData.push(Math.min(100, 5 + (3 - i) * 25)); // Linear plan for 4 months
      
      // Actual progress with some variance
      const variance = Math.random() * 15 - 7.5; // Random variance between -7.5 and 7.5
      actualData.push(Math.max(0, Math.min(100, (3 - i) * 22 + variance)));
      
      if (i < 1) {
        predictedData.push(null);
      } else {
        predictedData.push(null);
      }
    }
    
    // Add prediction for future months
    const lastActual = actualData[actualData.length - 1];
    for (let i = 1; i <= 2; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() + i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      
      plannedData.push(Math.min(100, 5 + (3 + i) * 25));
      actualData.push(null);
      
      // Predicted value
      const predictedValue = Math.min(100, lastActual + i * 22);
      predictedData.push(predictedValue);
    }
  }
  
  return {
    dates,
    datasets: {
      planned: plannedData,
      actual: actualData,
      predicted: predictedData
    },
    currentProgress: actualData[actualData.length - 1] || 0,
    plannedProgress: plannedData[actualData.length - 1] || 0,
    projectedCompletion: new Date(today.getTime() + (1000 * 60 * 60 * 24 * 30)), // 30 days from now
    trend: actualData[actualData.length - 1] > actualData[actualData.length - 2] ? 'up' : 'down'
  };
};

// Mock PDF export function
const exportToPDF = () => {
  console.log('Exporting to PDF...');
  // In a real implementation, this would generate and download a PDF report
};

// Mock CSV export function
const exportToCSV = () => {
  console.log('Exporting to CSV...');
  // In a real implementation, this would generate and download a CSV file
};

// Date range options
const dateRangeOptions = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 90 Days' }
];

const ProgressReportsWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t, locale } = useTranslation('dashboard');
  const [progressData, setProgressData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeframe, setTimeframe] = useState(settings?.defaultTimeframe || 'week');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const chartRef = useRef<any>(null);
  
  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#9CA3AF'
        }
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          callback: (value) => `${value}%`,
          font: {
            size: 10
          },
          color: '#9CA3AF'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 10
          },
          color: '#4B5563'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        padding: 10,
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4
      },
      line: {
        tension: 0.3
      }
    }
  };
  
  // Load progress data
  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProgressReportData(timeframe);
        setProgressData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading progress data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load progress data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgressData();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadProgressData, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [timeframe, settings]);
  
  // Handle timeframe change
  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value);
  };
  
  // Toggle export options
  const handleToggleExportOptions = () => {
    setShowExportOptions(!showExportOptions);
  };
  
  // Export reports
  const handleExport = (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      exportToPDF();
    } else {
      exportToCSV();
    }
    setShowExportOptions(false);
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
  
  if (!progressData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('analytics.noProgressData')}</p>
      </div>
    );
  }
  
  // Prepare chart data
  const chartData = {
    labels: progressData.dates,
    datasets: [
      {
        label: t('analytics.planned'),
        data: progressData.datasets.planned,
        borderColor: '#3B82F6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: '#3B82F6'
      },
      {
        label: t('analytics.actual'),
        data: progressData.datasets.actual,
        borderColor: '#10B981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: '#10B981'
      },
      {
        label: t('analytics.predicted'),
        data: progressData.datasets.predicted,
        borderColor: '#9061F9', // purple-500
        backgroundColor: 'rgba(144, 97, 249, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointBackgroundColor: '#9061F9'
      }
    ]
  };
  
  // Calculate progress difference
  const progressDifference = progressData.currentProgress - progressData.plannedProgress;
  const isAhead = progressDifference >= 0;
  
  return (
    <div className="h-full flex flex-col">
      {/* Widget Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <select
            className="text-xs border-gray-300 rounded-md py-1 pr-6 dark:bg-gray-800 dark:border-gray-700"
            value={timeframe}
            onChange={handleTimeframeChange}
            aria-label={t('analytics.selectTimeframe')}
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {t(`analytics.timeframe.${option.value}`)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <button
            onClick={handleToggleExportOptions}
            className="flex items-center text-xs text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t('analytics.export')}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
            {t('analytics.export')}
          </button>
          
          {showExportOptions && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-3 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {t('analytics.exportPDF')}
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-3 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {t('analytics.exportCSV')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('analytics.currentProgress')}
          </div>
          <div className="text-xl font-semibold mt-1">
            {progressData.currentProgress}%
          </div>
        </div>
        
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('analytics.variance')}
          </div>
          <div className={`text-xl font-semibold mt-1 flex items-center ${
            isAhead ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isAhead ? '+' : ''}{progressDifference.toFixed(1)}%
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isAhead 
                  ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                  : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
              />
            </svg>
          </div>
        </div>
        
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('analytics.projectedCompletion')}
          </div>
          <div className="text-xl font-semibold mt-1">
            {new Intl.DateTimeFormat(locale, { 
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }).format(progressData.projectedCompletion)}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="flex-1 min-h-0">
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ProgressReportsWidget;
