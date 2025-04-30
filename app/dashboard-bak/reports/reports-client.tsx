'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import PrintableReport from '@/app/components/reports/PrintableReport';
import DataExportComponent from '@/app/components/reports/DataExportComponent';
import MobileChartComponent from '@/app/components/reports/MobileChartComponent';

export default function ReportsClient() {
  // Use next-intl's useTranslations hook for proper internationalization
  const t = useTranslations('reports');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('dashboardTitle')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('projectPerformance')}</h2>
          <MobileChartComponent 
            title={t('projectPerformance')}
            chartId="project-performance"
            dataEndpoint="/api/reports/project-performance"
            options={{ type: 'bar', showLegend: true }}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('taskCompletion')}</h2>
          <MobileChartComponent 
            title={t('taskCompletion')}
            chartId="task-completion"
            dataEndpoint="/api/reports/task-completion"
            options={{ type: 'pie', showLegend: true }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('exportData')}</h2>
          <DataExportComponent 
            projectId="demo-project"
            initialFormat="csv"
            availableTypes={['project', 'tasks', 'materials']}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('printableReports')}</h2>
          <PrintableReport 
            projectId="demo-project"
            reportType="project_summary"
            paperSize="a4"
            orientation="portrait"
          />
        </div>
      </div>
    </div>
  );
}
