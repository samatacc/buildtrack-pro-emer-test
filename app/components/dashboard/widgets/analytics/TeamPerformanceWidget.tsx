import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { WidgetProps } from '@/lib/types/widget';

// Import required Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock service for team performance data
const fetchTeamPerformanceData = async (metric: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 550));
  
  // Team members
  const teamMembers = [
    'Alex Johnson',
    'Sarah Chen',
    'Carlos Rodriguez',
    'Diana Mitchell',
    'Michael Lee'
  ];
  
  // Generate data based on selected metric
  let metricData: number[] = [];
  let previousPeriodData: number[] = [];
  let metricLabels = [];
  
  if (metric === 'completion') {
    // Task completion rate (%)
    metricData = [85, 92, 78, 88, 81];
    previousPeriodData = [80, 88, 75, 85, 78];
    metricLabels = [`${t('team.completionRate')} (%)`];
  } else if (metric === 'quality') {
    // Quality score (0-100)
    metricData = [92, 95, 84, 91, 88];
    previousPeriodData = [90, 92, 80, 90, 86];
    metricLabels = [`${t('team.qualityScore')} (0-100)`];
  } else if (metric === 'response') {
    // Average response time (hours)
    metricData = [4.2, 2.1, 5.8, 3.0, 3.5];
    previousPeriodData = [5.5, 2.8, 6.2, 3.5, 4.0];
    metricLabels = [`${t('team.responseTime')} (${t('team.hours')})`];
  } else { // utilization
    // Skill utilization (%)
    metricData = [75, 88, 65, 82, 70];
    previousPeriodData = [70, 85, 60, 80, 68];
    metricLabels = [`${t('team.skillUtilization')} (%)`];
  }
  
  // Top performer calculation
  const topPerformerIndex = getTopPerformerIndex(metric, metricData);
  
  // Trend calculation (positive percentage change)
  const trends = metricData.map((value, index) => {
    const previous = previousPeriodData[index];
    const change = ((value - previous) / previous) * 100;
    return {
      change: parseFloat(change.toFixed(1)),
      positive: metric === 'response' ? change < 0 : change > 0 // For response time, negative change is positive
    };
  });
  
  return {
    teamMembers,
    metricData,
    previousPeriodData,
    topPerformer: teamMembers[topPerformerIndex],
    topPerformerValue: metricData[topPerformerIndex],
    metricLabels,
    trends
  };
};

// Helper function to determine top performer based on metric
function getTopPerformerIndex(metric: string, data: number[]): number {
  if (metric === 'response') {
    // For response time, lower is better
    return data.indexOf(Math.min(...data));
  } else {
    // For other metrics, higher is better
    return data.indexOf(Math.max(...data));
  }
}

// Metric options
const metricOptions = [
  { value: 'completion', label: 'Completion Rate' },
  { value: 'quality', label: 'Quality Score' },
  { value: 'response', label: 'Response Time' },
  { value: 'utilization', label: 'Skill Utilization' }
];

// Helper function to format the value based on metric type
const formatMetricValue = (value: number, metric: string) => {
  if (metric === 'response') {
    return `${value.toFixed(1)} hrs`;
  } else {
    return `${value}%`;
  }
};

// Custom component for t function in static context
const t = (key: string): string => {
  // This is just a placeholder for the static context
  // The actual t function will be used in the component
  const translations: Record<string, string> = {
    'team.completionRate': 'Completion Rate',
    'team.qualityScore': 'Quality Score',
    'team.responseTime': 'Response Time',
    'team.hours': 'hours',
    'team.skillUtilization': 'Skill Utilization'
  };
  return translations[key] || key;
};

const TeamPerformanceWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t } = useTranslations('dashboard');
  const [performanceData, setPerformanceData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMetric, setSelectedMetric] = useState(settings?.defaultMetric || 'completion');
  
  // Load team performance data
  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTeamPerformanceData(selectedMetric);
        setPerformanceData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading team performance data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load team performance data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPerformanceData();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadPerformanceData, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [selectedMetric, settings]);
  
  // Handle metric change
  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMetric(e.target.value);
  };
  
  // Bar chart options
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.x;
            
            if (selectedMetric === 'response') {
              return `${label}: ${value.toFixed(1)} ${t('team.hours')}`;
            } else {
              return `${label}: ${value}%`;
            }
          }
        }
      }
    },
    barPercentage: 0.8
  };
  
  // Prepare chart data
  const getChartData = () => {
    if (!performanceData) return null;
    
    return {
      labels: performanceData.teamMembers,
      datasets: [
        {
          label: t(`team.metric.${selectedMetric}`),
          data: performanceData.metricData,
          backgroundColor: performanceData.teamMembers.map((_: any, index: number) => {
            // Highlight the top performer
            if (performanceData.teamMembers[index] === performanceData.topPerformer) {
              return '#10B981'; // emerald-500
            }
            return '#3B82F6'; // blue-500
          }),
          borderWidth: 0,
          borderRadius: 4
        }
      ]
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
  
  if (!performanceData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('team.noPerformanceData')}</p>
      </div>
    );
  }
  
  const chartData = getChartData();
  
  return (
    <div className="h-full flex flex-col">
      {/* Widget Controls */}
      <div className="flex items-center justify-between mb-3">
        <select
          className="text-xs border-gray-300 rounded-md py-1 pr-6 dark:bg-gray-800 dark:border-gray-700"
          value={selectedMetric}
          onChange={handleMetricChange}
          aria-label={t('team.selectMetric')}
        >
          {metricOptions.map(option => (
            <option key={option.value} value={option.value}>
              {t(`team.metric.${option.value}`)}
            </option>
          ))}
        </select>
        
        {/* Top Performer Badge */}
        {performanceData.topPerformer && (
          <div className="flex items-center bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-md text-xs">
            <span className="font-medium mr-1">{t('team.topPerformer')}:</span>
            <span>
              {performanceData.topPerformer} ({formatMetricValue(performanceData.topPerformerValue, selectedMetric)})
            </span>
          </div>
        )}
      </div>
      
      {/* Performance Chart */}
      <div className="flex-1 overflow-hidden">
        {chartData && (
          <Bar data={chartData} options={barOptions} />
        )}
      </div>
      
      {/* Trend Indicators */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          {t('team.periodComparison')}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {performanceData.trends.map((trend: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {performanceData.teamMembers[index].split(' ')[0]}
              </div>
              <div className={`text-sm font-medium ${
                trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {trend.change > 0 ? '+' : ''}{trend.change}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceWidget;
