import React from 'react';
import { useTranslation } from 'next-intl';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { WidgetProps } from '@/lib/types/widget';

interface UnknownWidgetProps extends WidgetProps {
  widgetType: string;
}

const UnknownWidget: React.FC<UnknownWidgetProps> = ({ id, title, widgetType }) => {
  const { t } = useTranslation('dashboard');
  
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
      <QuestionMarkCircleIcon className="w-12 h-12 mb-2" />
      <h4 className="text-lg font-medium">{t('widget.unknownType')}</h4>
      <p className="text-sm mt-2">{t('widget.typeNotImplemented', { type: widgetType })}</p>
      <p className="text-xs mt-4">{t('widget.widgetId')}: {id}</p>
    </div>
  );
};

export default UnknownWidget;
