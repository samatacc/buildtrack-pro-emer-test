import React from 'react';
import { getTranslations } from 'next-intl/server';

// Interface for the reports layout props
interface ReportsLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function ReportsLayout({ children, params }: ReportsLayoutProps) {
  const t = await getTranslations('reports');
  
  return (
    <section className="reports-layout">
      <div className="reports-container">
        {children}
      </div>
    </section>
  );
}
