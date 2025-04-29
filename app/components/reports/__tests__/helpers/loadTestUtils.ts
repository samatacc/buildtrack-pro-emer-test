/**
 * Load Testing Utilities for BuildTrack Pro Reports
 * 
 * Provides tools for generating large test datasets to verify
 * performance and rendering capabilities of reporting components.
 */

import { ProjectData, ReportType } from '../reportTypes';

/**
 * Generates a large test project with configurable size parameters
 * 
 * @param taskCount Number of tasks to generate
 * @param materialCount Number of materials to generate
 * @param documentCount Number of documents to generate 
 * @returns A large project dataset for testing
 */
export function generateLargeProject(
  taskCount = 1000,
  materialCount = 500,
  documentCount = 200
): ProjectData {
  // Basic project data
  const project: ProjectData = {
    id: `large-project-${taskCount}-${materialCount}`,
    name: `Large Test Project (${taskCount} tasks)`,
    description: 'A large project generated for load testing purposes.',
    status: 'in_progress',
    progress: Math.floor(Math.random() * 100),
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days in future
    client: 'LoadTest Client Corp.',
    location: '100 Performance Drive, LoadTest City',
    budget: {
      total: 10000000,
      spent: 3500000,
      remaining: 6500000,
      percentUsed: 35
    },
    team: {
      members: Math.floor(taskCount / 20), // 1 team member per 20 tasks
      contractors: Math.floor(taskCount / 50), // 1 contractor per 50 tasks
      suppliers: Math.floor(materialCount / 25) // 1 supplier per 25 materials
    },
    stats: {
      tasksTotal: taskCount,
      tasksCompleted: Math.floor(taskCount * 0.4), // 40% complete
      tasksInProgress: Math.floor(taskCount * 0.3), // 30% in progress
      tasksBlocked: Math.floor(taskCount * 0.1), // 10% blocked
      materialsOrdered: materialCount,
      materialsDelivered: Math.floor(materialCount * 0.6), // 60% delivered
      documentsTotal: documentCount,
      permitsPending: Math.floor(documentCount * 0.05), // 5% are permits
      inspectionsCompleted: Math.floor(documentCount * 0.1), // 10% are completed inspections
      inspectionsPending: Math.floor(documentCount * 0.05), // 5% are pending inspections
      incidents: Math.floor(taskCount / 200), // 1 incident per 200 tasks
      safetyRating: 95 - Math.floor(Math.random() * 10) // Safety rating between 85-95
    }
  };
  
  return project;
}

/**
 * Generates a large chart dataset with many data points
 * 
 * @param dataPointCount Number of data points (x-axis values)
 * @param seriesCount Number of data series (lines/bars)
 * @returns Chart data with multiple series and many data points
 */
export function generateLargeChartData(dataPointCount = 100, seriesCount = 5) {
  // Generate labels (e.g., dates)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dataPointCount);
  
  const labels = Array(dataPointCount).fill(0).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  
  // Generate datasets
  const datasets = Array(seriesCount).fill(0).map((_, i) => {
    // Use different patterns for different series to simulate real data
    const data = Array(dataPointCount).fill(0).map((_, j) => {
      // Create some patterns in the data
      const base = 100 + i * 50; // Base value increases with series index
      const trend = j * (i % 2 === 0 ? 1 : -1) * 0.5; // Upward or downward trend
      const seasonal = Math.sin(j / 10) * 20; // Seasonal pattern
      const noise = Math.random() * 30 - 15; // Random noise
      
      return Math.max(0, Math.round(base + trend + seasonal + noise));
    });
    
    return {
      label: `Series ${i + 1}`,
      data,
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
    };
  });
  
  return { labels, datasets };
}

/**
 * Measures rendering performance of a component
 * 
 * @param renderFn Function that performs the actual rendering
 * @param iterations Number of times to render for average calculation
 * @returns Performance metrics including average render time
 */
export async function measureRenderPerformance(
  renderFn: () => Promise<void> | void,
  iterations = 5
): Promise<{
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
  memoryUsage?: number;
}> {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await renderFn();
    const end = performance.now();
    times.push(end - start);
  }
  
  return {
    averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    totalTime: times.reduce((sum, time) => sum + time, 0),
    // Memory usage measurement is browser-specific and might not be available in all environments
    memoryUsage: (performance as any).memory?.usedJSHeapSize,
  };
}

/**
 * Checks if performance meets the specified thresholds
 * 
 * @param metrics Performance metrics to evaluate
 * @param thresholds Performance thresholds to meet
 * @returns Whether the performance meets the specified thresholds
 */
export function meetsPerformanceThresholds(
  metrics: { averageTime: number; maxTime: number },
  thresholds: { averageTime: number; maxTime: number }
): { passed: boolean; details: string } {
  const passedAverage = metrics.averageTime <= thresholds.averageTime;
  const passedMax = metrics.maxTime <= thresholds.maxTime;
  const passed = passedAverage && passedMax;
  
  let details = '';
  if (!passedAverage) {
    details += `Average time (${metrics.averageTime.toFixed(2)} ms) exceeds threshold (${thresholds.averageTime} ms). `;
  }
  if (!passedMax) {
    details += `Max time (${metrics.maxTime.toFixed(2)} ms) exceeds threshold (${thresholds.maxTime} ms).`;
  }
  
  if (passed) {
    details = `Performance meets all thresholds. Average: ${metrics.averageTime.toFixed(2)} ms, Max: ${metrics.maxTime.toFixed(2)} ms`;
  }
  
  return { passed, details };
}
