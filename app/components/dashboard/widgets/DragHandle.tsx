import React from 'react';
import { useDrag } from 'react-dnd';
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/app/hooks/useTranslations';

interface DragHandleProps {
  widgetId: string;
  isEditMode: boolean;
}

/**
 * DragHandle Component
 * 
 * A handle for dragging widgets in the dashboard.
 * Only active when the dashboard is in edit mode.
 */
const DragHandle: React.FC<DragHandleProps> = ({ widgetId, isEditMode }) => {
  const { t } = useTranslations('dashboard');
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WIDGET_HANDLE',
    item: { id: widgetId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isEditMode, // Only allow dragging in edit mode
  }), [widgetId, isEditMode]);
  
  if (!isEditMode) return null;
  
  const dragHandleRef = React.useRef(null);
  drag(dragHandleRef);
  
  return (
    <div 
      ref={dragHandleRef}
      className={`
        cursor-grab active:cursor-grabbing p-1 rounded-md
        ${isDragging ? 'opacity-50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
        transition-colors duration-150
      `}
      title={t('widgets.actions.drag')}
    >
      <ArrowsUpDownIcon className="h-5 w-5 text-gray-500" />
    </div>
  );
};

export default DragHandle;
