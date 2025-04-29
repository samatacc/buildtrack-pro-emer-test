'use client';

import dynamic from 'next/dynamic';
import { createLazyComponent } from './utils/lazyLoad';

/**
 * Route Loader Module
 * 
 * This module implements code splitting and lazy loading for BuildTrack Pro's routes.
 * It improves performance by:
 * - Reducing initial bundle size
 * - Only loading page components when needed
 * - Providing appropriate loading/error states
 * - Tracking component load performance
 * 
 * The pattern follows BuildTrack Pro's performance standards for mobile and low-bandwidth usage.
 */

// Dashboard Routes with code splitting
/* These page imports are commented out as they haven't been implemented yet.
   In a production environment, these would point to actual page components. */

/*
export const DashboardPage = createLazyComponent(
  () => import('./[locale]/dashboard/page'),
  'dashboard',
  'DashboardPage'
);

// Project Routes with code splitting
export const ProjectsPage = createLazyComponent(
  () => import('./[locale]/projects/page'),
  'projects',
  'ProjectsPage'
);

export const ProjectDetailPage = createLazyComponent(
  () => import('./[locale]/projects/[id]/page'),
  'projects',
  'ProjectDetailPage'
);

// Tasks Routes with code splitting
export const TasksPage = createLazyComponent(
  () => import('./[locale]/tasks/page'),
  'tasks',
  'TasksPage'
);

// Materials Routes with code splitting
export const MaterialsPage = createLazyComponent(
  () => import('./[locale]/materials/page'),
  'materials',
  'MaterialsPage'
);

// Documents Routes with code splitting
export const DocumentsPage = createLazyComponent(
  () => import('./[locale]/documents/page'),
  'documents',
  'DocumentsPage'
);

// Admin Routes with code splitting
export const AdminPage = createLazyComponent(
  () => import('./[locale]/admin/page'),
  'admin',
  'AdminPage'
);
*/

// Mobile-optimized components with code splitting
export const MobileNavigator = createLazyComponent(
  () => import('./components/mobile/MobileNavigator'),
  'mobile',
  'MobileNavigator'
);

export const MobileDocumentViewer = createLazyComponent(
  () => import('./components/mobile/MobileDocumentViewer'),
  'mobile',
  'MobileDocumentViewer'
);

export const FieldModeProvider = createLazyComponent(
  () => import('./components/mobile/FieldModeProvider'),
  'mobile',
  'FieldModeProvider'
);

// Reports and analytics components with code splitting
export const MobileChartComponent = createLazyComponent(
  () => import('./components/reports/MobileChartComponent'),
  'reports',
  'MobileChartComponent'
);

export const DataExportComponent = createLazyComponent(
  () => import('./components/reports/DataExportComponent'),
  'reports',
  'DataExportComponent'
);

export const PrintableReport = createLazyComponent(
  () => import('./components/reports/PrintableReport'),
  'reports',
  'PrintableReport'
);

export const ReportsPage = createLazyComponent(
  () => import('./[locale]/reports/page'),
  'reports',
  'ReportsPage'
);

// Document management components with code splitting
export const FileList = createLazyComponent(
  () => import('./components/documents/FileList'),
  'documents',
  'FileList'
);

export const DrawingSet = createLazyComponent(
  () => import('./components/documents/DrawingSet'),
  'documents',
  'DrawingSet'
);

export const DocumentWorkflow = createLazyComponent(
  () => import('./components/documents/DocumentWorkflow'),
  'documents',
  'DocumentWorkflow'
);

// Admin components with code splitting
export const DashboardControl = createLazyComponent(
  () => import('./components/admin/DashboardControl'),
  'admin',
  'DashboardControl'
);

export const SubscriberManagement = createLazyComponent(
  () => import('./components/admin/SubscriberManagement'),
  'admin',
  'SubscriberManagement'
);

export const FeatureToggles = createLazyComponent(
  () => import('./components/admin/FeatureToggles'),
  'admin',
  'FeatureToggles'
);
