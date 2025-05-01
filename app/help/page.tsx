'use client';

import React from 'react';
import { useTranslations } from '@/app/hooks/useTranslations';
import HelpCenter from '@/app/components/help/HelpCenter';

export default function HelpPage() {
  const { t } = useTranslations('common');

  return (
    <div className="container mx-auto px-4 py-8">
      <HelpCenter />
    </div>
  );
}
