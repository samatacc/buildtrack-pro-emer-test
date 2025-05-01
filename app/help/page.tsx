'use client';

import React from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import HelpCenter from '@/app/components/help/HelpCenter';
import MainLayout from '@/app/components/layouts/MainLayout';

export default function HelpPage() {
  const { t } = useTranslations('common');

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <HelpCenter />
      </div>
    </MainLayout>
  );
}
