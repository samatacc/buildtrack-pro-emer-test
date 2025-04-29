import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-intl';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { WidgetProps } from '@/lib/types/widget';

// Need to import required Chart.js components
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock service for financial data
const fetchFinancialData = async (timeframe: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 650));
  
  // Common data for all timeframes
  const expenseCategories = [
    'Materials',
    'Labor',
    'Equipment',
    'Subcontractors',
    'Permits',
    'Other'
  ];
  
  // Generate different data based on timeframe
  let budgetData: number[] = [];
  let actualData: number[] = [];
  let burnRatePerWeek: number;
  
  if (timeframe === 'month') {
    budgetData = [45000, 65000, 30000, 80000, 15000, 25000];
    actualData = [42000, 70000, 28000, 78000, 15000, 22000];
    burnRatePerWeek = 58000;
  } else if (timeframe === 'quarter') {
    budgetData = [120000, 180000, 90000, 230000, 40000, 70000];
    actualData = [110000, 190000, 85000, 225000, 40000, 65000];
    burnRatePerWeek = 55000;
  } else { // year
    budgetData = [450000, 650000, 320000, 780000, 120000, 250000];
    actualData = [420000, 680000, 300000, 750000, 120000, 230000];
    burnRatePerWeek = 52000;
  }
  
  // Calculate totals
  const totalBudget = budgetData.reduce((sum, value) => sum + value, 0);
  const totalActual = actualData.reduce((sum, value) => sum + value, 0);
  const variance = totalBudget - totalActual;
  const variancePercentage = (variance / totalBudget) * 100;
  
  // Calculate invoice status
  const invoiceStatus = {
    approved: 15,
    pending: 8,
    rejected: 2,
    total: 25
  };
  
  // Generate cost code distribution
  const costCodes = ['100 - General', '200 - Site', '300 - Concrete', '400 - Masonry', '500 - Metals'];
  const costCodeData = [18, 22, 25, 15, 20]; // Percentages
  
  return {
    expenseCategories,
    budgetData,
    actualData,
    totalBudget,
    totalActual,
    variance,
    variancePercentage,
    burnRatePerWeek,
    invoiceStatus,
    costCodes,
    costCodeData
  };
};

// Helper function to format currency
const formatCurrency = (amount: number, locale: string, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
};

// Timeframe options
const timeframeOptions = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' }
];

const FinancialDashboardWidget: React.FC<WidgetProps> = ({ id, title, settings }) => {
  const { t, locale } = useTranslation('dashboard');
  const [financialData, setFinancialData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeframe, setTimeframe] = useState(settings?.defaultTimeframe || 'month');
  const [chartType, setChartType] = useState<'category' | 'codes'>('category');
  
  // Currency code from settings or default to USD
  const currencyCode = settings?.currencyCode || 'USD';
  
  // Load financial data
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchFinancialData(timeframe);
        setFinancialData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading financial data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load financial data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFinancialData();
    
    // Set up refresh interval if specified in settings
    const refreshRate = settings?.refreshRate ? parseInt(settings.refreshRate) : null;
    if (refreshRate && refreshRate !== 'auto') {
      const interval = setInterval(loadFinancialData, refreshRate * 1000);
      return () => clearInterval(interval);
    }
  }, [timeframe, settings]);
  
  // Handle timeframe change
  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value);
  };
  
  // Doughnut chart options
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => (a as number) + (b as number), 0);
            const percentage = Math.round(value / total * 100);
            return `${label}: ${formatCurrency(value, locale, currencyCode)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };
  
  // Bar chart options
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 9
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value as number, locale, currencyCode).replace(/[0-9]/g, '').replace(/\,/g, ''),
          font: {
            size: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value, locale, currencyCode)}`;
          }
        }
      }
    },
    barPercentage: 0.7
  };
  
  // Prepare doughnut chart data
  const getDoughnutData = () => {
    if (!financialData) return null;
    
    if (chartType === 'category') {
      return {
        labels: financialData.expenseCategories,
        datasets: [{
          data: financialData.actualData,
          backgroundColor: [
            '#3B82F6', // blue-500
            '#10B981', // emerald-500
            '#F59E0B', // amber-500
            '#EF4444', // red-500
            '#8B5CF6', // purple-500
            '#6B7280'  // gray-500
          ],
          borderWidth: 1
        }]
      };
    } else {
      return {
        labels: financialData.costCodes,
        datasets: [{
          data: financialData.costCodeData,
          backgroundColor: [
            '#3B82F6', // blue-500
            '#10B981', // emerald-500
            '#F59E0B', // amber-500
            '#EF4444', // red-500
            '#8B5CF6'  // purple-500
          ],
          borderWidth: 1
        }]
      };
    }
  };
  
  // Prepare bar chart data
  const getBarData = () => {
    if (!financialData) return null;
    
    return {
      labels: financialData.expenseCategories,
      datasets: [
        {
          label: t('financial.budget'),
          data: financialData.budgetData,
          backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue-500 with opacity
          borderColor: '#3B82F6',
          borderWidth: 1
        },
        {
          label: t('financial.actual'),
          data: financialData.actualData,
          backgroundColor: 'rgba(16, 185, 129, 0.5)', // emerald-500 with opacity
          borderColor: '#10B981',
          borderWidth: 1
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
  
  if (!financialData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>{t('financial.noFinancialData')}</p>
      </div>
    );
  }
  
  const doughnutData = getDoughnutData();
  const barData = getBarData();
  
  // Determine variance color
  const varianceColor = financialData.variance >= 0 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
  
  return (
    <div className="h-full flex flex-col">
      {/* Widget Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <select
            className="text-xs border-gray-300 rounded-md py-1 pr-6 dark:bg-gray-800 dark:border-gray-700"
            value={timeframe}
            onChange={handleTimeframeChange}
            aria-label={t('financial.selectTimeframe')}
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {t(`financial.timeframe.${option.value}`)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setChartType('category')}
            className={`px-2 py-1 text-xs rounded ${
              chartType === 'category'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('financial.categories')}
          </button>
          <button
            onClick={() => setChartType('codes')}
            className={`px-2 py-1 text-xs rounded ${
              chartType === 'codes'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('financial.costCodes')}
          </button>
        </div>
      </div>
      
      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-md p-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('financial.totalBudget')}
          </div>
          <div className="text-sm font-semibold mt-1">
            {formatCurrency(financialData.totalBudget, locale, currencyCode)}
          </div>
        </div>
        
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-md p-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('financial.totalSpent')}
          </div>
          <div className="text-sm font-semibold mt-1">
            {formatCurrency(financialData.totalActual, locale, currencyCode)}
          </div>
        </div>
        
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded-md p-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('financial.variance')}
          </div>
          <div className={`text-sm font-semibold mt-1 ${varianceColor}`}>
            {formatCurrency(financialData.variance, locale, currencyCode)} 
            {' '}
            ({financialData.variancePercentage >= 0 ? '+' : ''}
            {financialData.variancePercentage.toFixed(1)}%)
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Expense Breakdown Chart */}
        <div className="col-span-1 h-full flex flex-col">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {chartType === 'category' 
              ? t('financial.expenseBreakdown')
              : t('financial.costCodeDistribution')
            }
          </h3>
          <div className="flex-1 relative">
            {doughnutData && (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('financial.total')}
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(financialData.totalActual, locale, currencyCode)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Budget vs Actual Chart */}
        <div className="col-span-1 h-full flex flex-col">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('financial.budgetVsActual')}
          </h3>
          <div className="flex-1">
            {barData && (
              <Bar data={barData} options={barOptions} />
            )}
          </div>
        </div>
      </div>
      
      {/* Invoice Status and Burn Rate */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="col-span-1">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('financial.invoiceStatus')}
          </h3>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span>{t('financial.approved')}: {financialData.invoiceStatus.approved}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
              <span>{t('financial.pending')}: {financialData.invoiceStatus.pending}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
              <span>{t('financial.rejected')}: {financialData.invoiceStatus.rejected}</span>
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {t('financial.burnRate')}
          </h3>
          <div className="text-xs">
            <span className="font-semibold">
              {formatCurrency(financialData.burnRatePerWeek, locale, currencyCode)}
            </span>
            {' '}
            <span className="text-gray-500 dark:text-gray-400">
              {t('financial.perWeek')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboardWidget;
