import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database, Project } from '@/lib/types/simplified-project';
import { ProjectStatus, ProjectHealth } from '@/lib/types/project';

/**
 * Projects API Module
 * 
 * Provides data access methods for projects in BuildTrack Pro
 * Implements caching for improved performance and offline support
 */

// Initialize Supabase client
const getSupabase = () => createClientComponentClient<Database>();

/**
 * Fetch active projects for the current user
 * Includes filtering options, caching, and offline support
 */
export const getActiveProjects = async (options?: {
  limit?: number;
  includeCompleted?: boolean;
  sortBy?: 'name' | 'dueDate' | 'progress' | 'health';
  filterByHealth?: ProjectHealth;
}): Promise<Project[]> => {
  const { 
    limit = 10, 
    includeCompleted = false,
    sortBy = 'dueDate',
    filterByHealth
  } = options || {};
  
  try {
    // Try to get from cache first for instant loading
    const cachedData = getCachedProjects();
    if (cachedData) {
      // Apply filters to cached data
      return filterProjects(cachedData, { 
        limit, includeCompleted, sortBy, filterByHealth 
      });
    }
    
    // If no cache, fetch from API
    const supabase = getSupabase();
    let query = supabase
      .from('projects')
      .select(`
        id,
        name,
        status,
        health,
        progress,
        days_ahead,
        due_date,
        thumbnail_url,
        created_at,
        updated_at
      `)
      .order(mapSortField(sortBy), { ascending: sortBy === 'name' });
      
    // Apply filters
    if (!includeCompleted) {
      query = query.neq('status', ProjectStatus.COMPLETED);
    }
    
    if (filterByHealth) {
      query = query.eq('health', filterByHealth);
    }
      
    // Execute query with limit
    const { data, error } = await query.limit(limit);
    
    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
    
    // Transform data to our Project model
    const projects = data.map(transformProjectFromDatabase);
    
    // Cache the result
    cacheProjects(projects);
    
    return projects;
  } catch (err) {
    // For now, return mock data if API fails
    // In production, would implement proper error handling and offline strategy
    console.warn('Falling back to mock data:', err);
    return getMockProjects();
  }
};

/**
 * Helper to transform database project to our model
 */
const transformProjectFromDatabase = (dbProject: any): Project => {
  return {
    id: dbProject.id,
    name: dbProject.name,
    status: dbProject.status,
    health: dbProject.health,
    progress: dbProject.progress,
    daysAhead: dbProject.days_ahead,
    dueDate: new Date(dbProject.due_date),
    thumbnail: dbProject.thumbnail_url,
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at)
  };
};

/**
 * Cache projects in localStorage
 */
const cacheProjects = (projects: Project[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('buildtrack-projects-cache', JSON.stringify({
      timestamp: Date.now(),
      data: projects
    }));
  } catch (err) {
    console.warn('Failed to cache projects:', err);
  }
};

/**
 * Get cached projects from localStorage
 */
const getCachedProjects = (): Project[] | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cache = localStorage.getItem('buildtrack-projects-cache');
    if (!cache) return null;
    
    const { timestamp, data } = JSON.parse(cache);
    
    // Cache is valid for 5 minutes
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return null;
    }
    
    return data.map((project: any) => ({
      ...project,
      dueDate: new Date(project.dueDate),
      createdAt: project.createdAt ? new Date(project.createdAt) : undefined,
      updatedAt: project.updatedAt ? new Date(project.updatedAt) : undefined
    }));
  } catch (err) {
    console.warn('Failed to read cached projects:', err);
    return null;
  }
};

/**
 * Apply filters to projects
 */
const filterProjects = (
  projects: Project[], 
  options: {
    limit: number;
    includeCompleted: boolean;
    sortBy: 'name' | 'dueDate' | 'progress' | 'health';
    filterByHealth?: ProjectHealth;
  }
): Project[] => {
  const { 
    limit, 
    includeCompleted,
    sortBy,
    filterByHealth
  } = options;
  
  let filtered = [...projects];
  
  // Apply status filter
  if (!includeCompleted) {
    filtered = filtered.filter(p => p.status !== ProjectStatus.COMPLETED);
  }
  
  // Apply health filter
  if (filterByHealth) {
    filtered = filtered.filter(p => p.health === filterByHealth);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'dueDate':
        return a.dueDate.getTime() - b.dueDate.getTime();
      case 'progress':
        return b.progress - a.progress;
      case 'health':
        return getHealthSortValue(a.health) - getHealthSortValue(b.health);
      default:
        return 0;
    }
  });
  
  // Apply limit
  return filtered.slice(0, limit);
};

/**
 * Helper for health-based sorting
 */
const getHealthSortValue = (health: ProjectHealth): number => {
  switch (health) {
    case ProjectHealth.AT_RISK: return 0;
    case ProjectHealth.DELAYED: return 1;
    case ProjectHealth.ON_TRACK: return 2;
    default: return 3;
  }
};

/**
 * Map sort field to database column
 */
const mapSortField = (field: string): string => {
  switch (field) {
    case 'name': return 'name';
    case 'dueDate': return 'due_date';
    case 'progress': return 'progress';
    case 'health': return 'health';
    default: return 'due_date';
  }
};

/**
 * Fallback mock data for testing and development
 */
const getMockProjects = (): Project[] => [
  {
    id: 'proj-001',
    name: 'Downtown Office Renovation',
    status: ProjectStatus.IN_PROGRESS,
    health: ProjectHealth.ON_TRACK,
    progress: 45,
    daysAhead: 2,
    dueDate: new Date(2025, 7, 15),
    thumbnail: '/images/projects/downtown-office.jpg'
  },
  {
    id: 'proj-002',
    name: 'Highland Park Residence',
    status: ProjectStatus.IN_PROGRESS,
    health: ProjectHealth.AT_RISK,
    progress: 32,
    daysAhead: -5,
    dueDate: new Date(2025, 5, 30),
    thumbnail: '/images/projects/highland-residence.jpg'
  },
  {
    id: 'proj-003',
    name: 'Riverside Mall Expansion',
    status: ProjectStatus.IN_PROGRESS,
    health: ProjectHealth.DELAYED,
    progress: 68,
    daysAhead: -3,
    dueDate: new Date(2025, 9, 10),
    thumbnail: '/images/projects/riverside-mall.jpg'
  },
  {
    id: 'proj-004',
    name: 'Metro Transit Terminal',
    status: ProjectStatus.IN_PROGRESS,
    health: ProjectHealth.ON_TRACK,
    progress: 15,
    daysAhead: 0,
    dueDate: new Date(2026, 1, 28),
    thumbnail: '/images/projects/metro-terminal.jpg'
  }
];
