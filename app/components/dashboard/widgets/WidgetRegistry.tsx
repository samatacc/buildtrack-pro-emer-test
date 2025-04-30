import React from 'react';
import { useWidgets } from '../../../../lib/contexts/WidgetContext';
import { WidgetType } from '@/lib/types/widget';
import WidgetContainer from './WidgetContainer';

// Import widget components
import ActiveProjectsWidget from './project/ActiveProjectsWidget';
import ProjectTimelineWidget from './project/ProjectTimelineWidget';
import ProjectHealthWidget from './project/ProjectHealthWidget';
import AnalyticsWidget from './analytics/AnalyticsWidget';
import MyTasksWidget from './task/MyTasksWidget';
import TeamTasksWidget from './task/TeamTasksWidget';
import CriticalPathWidget from './task/CriticalPathWidget';
import ProgressReportsWidget from './analytics/ProgressReportsWidget';
import FinancialDashboardWidget from './analytics/FinancialDashboardWidget';
import TeamPerformanceWidget from './analytics/TeamPerformanceWidget';
import NotificationCenterWidget from './notification/NotificationCenterWidget';
import PlaceholderWidget from './PlaceholderWidget';

// Fallback widget for when a type isn't implemented
import UnknownWidget from './UnknownWidget';

interface WidgetRegistryProps {
  widgetId: string;
  screenSize?: string;
}

const WidgetRegistry: React.FC<WidgetRegistryProps> = ({ widgetId, screenSize = 'lg' }) => {
  const { dashboardConfig } = useWidgets();
  
  if (!dashboardConfig) {
    return null;
  }
  
  const widget = dashboardConfig.widgets.find(w => w.id === widgetId);
  
  if (!widget) {
    return null;
  }
  
  // Render the appropriate widget component based on the widget type
  const renderWidget = () => {
    switch (widget.type) {
      case WidgetType.ACTIVE_PROJECTS:
        return <ActiveProjectsWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.PROJECT_TIMELINE:
        return <ProjectTimelineWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.PROJECT_HEALTH:
        return <ProjectHealthWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
      
      case WidgetType.ANALYTICS:
        return <AnalyticsWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.MY_TASKS:
        return <MyTasksWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.TEAM_TASKS:
        return <TeamTasksWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.CRITICAL_PATH:
        return <CriticalPathWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.PROGRESS_REPORTS:
        return <ProgressReportsWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.FINANCIAL_DASHBOARD:
        return <FinancialDashboardWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.TEAM_PERFORMANCE:
        return <TeamPerformanceWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.NOTIFICATION_CENTER:
        return <NotificationCenterWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} />;
        
      case WidgetType.CUSTOM:
        return <PlaceholderWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize, widgetName: 'Custom Widget'}} />;
        
      default:
        return <UnknownWidget id={widget.id} title={widget.title} settings={{...widget.settings, screenSize}} widgetType={widget.type} />;
    }
  };
  
  return (
    <WidgetContainer widget={widget}>
      {renderWidget()}
    </WidgetContainer>
  );
};

export default WidgetRegistry;
