'use client';

import { 
  Project, 
  ProjectSummary, 
  ProjectType, 
  ProjectStatus, 
  ProjectHealth,
  ProjectTemplate
} from '../types/project';

/**
 * Project Management Service
 * 
 * Provides methods to interact with project data through the API.
 * Follows BuildTrack Pro's mobile-first approach with offline capabilities
 * for construction professionals in the field with potentially limited connectivity.
 */

// Mock data for development - will be replaced with actual API calls to Supabase
const MOCK_PROJECT_SUMMARIES: ProjectSummary[] = [
  {
    id: 'p1',
    name: 'Downtown Office Tower',
    type: ProjectType.COMMERCIAL,
    status: ProjectStatus.ACTIVE,
    health: ProjectHealth.ON_TRACK,
    startDate: new Date('2025-01-15'),
    targetEndDate: new Date('2025-12-15'),
    completion: 35,
    location: {
      city: 'Chicago',
      state: 'IL'
    },
    teamSize: 28,
    budget: {
      totalBudget: 5200000,
      spentBudget: 1820000,
      currency: 'USD'
    },
    client: {
      id: 'c1',
      name: 'Urban Development Corp'
    },
    tasks: {
      total: 145,
      completed: 51,
      overdue: 3
    }
  },
  {
    id: 'p2',
    name: 'Riverside Residential Complex',
    type: ProjectType.RESIDENTIAL,
    status: ProjectStatus.ACTIVE,
    health: ProjectHealth.AT_RISK,
    startDate: new Date('2024-11-10'),
    targetEndDate: new Date('2025-09-20'),
    completion: 62,
    location: {
      city: 'Portland',
      state: 'OR'
    },
    teamSize: 43,
    budget: {
      totalBudget: 8750000,
      spentBudget: 5687500,
      currency: 'USD'
    },
    client: {
      id: 'c2',
      name: 'Pacific Northwest Properties'
    },
    tasks: {
      total: 213,
      completed: 132,
      overdue: 7
    }
  },
  {
    id: 'p3',
    name: 'Highway 95 Bridge Repair',
    type: ProjectType.INFRASTRUCTURE,
    status: ProjectStatus.DELAYED,
    health: ProjectHealth.DELAYED,
    startDate: new Date('2024-08-05'),
    targetEndDate: new Date('2025-03-30'),
    completion: 48,
    location: {
      city: 'Denver',
      state: 'CO'
    },
    teamSize: 18,
    budget: {
      totalBudget: 3400000,
      spentBudget: 2176000,
      currency: 'USD'
    },
    client: {
      id: 'c3',
      name: 'State DOT'
    },
    tasks: {
      total: 87,
      completed: 42,
      overdue: 12
    }
  },
  {
    id: 'p4',
    name: 'Sunset Heights Renovation',
    type: ProjectType.RENOVATION,
    status: ProjectStatus.PLANNING,
    health: ProjectHealth.ON_TRACK,
    startDate: new Date('2025-05-01'),
    targetEndDate: new Date('2025-08-15'),
    completion: 5,
    location: {
      city: 'San Diego',
      state: 'CA'
    },
    teamSize: 12,
    budget: {
      totalBudget: 1200000,
      spentBudget: 60000,
      currency: 'USD'
    },
    client: {
      id: 'c4',
      name: 'Coastal Living LLC'
    },
    tasks: {
      total: 56,
      completed: 3,
      overdue: 0
    }
  }
];

// Mock project templates
const MOCK_TEMPLATES: ProjectTemplate[] = [
  {
    id: 't1',
    name: 'Standard Commercial Building',
    description: 'Template for typical commercial building projects including standard milestones and task structures',
    projectType: ProjectType.COMMERCIAL,
    createdBy: 'u1',
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-12-10'),
    isPublic: true,
    presetMilestones: [
      {
        name: 'Design Approval',
        description: 'Final approval of all design documents',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      },
      {
        name: 'Foundation Complete',
        description: 'Completion of all foundation work',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      },
      {
        name: 'Structure Complete',
        description: 'Completion of structural framework',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      },
      {
        name: 'Enclosure Complete',
        description: 'Building fully enclosed with exterior completed',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      },
      {
        name: 'Interior Finishes Complete',
        description: 'All interior work completed',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      }
    ],
    presetTeamRoles: [
      ProjectRole.OWNER,
      ProjectRole.MANAGER,
      ProjectRole.SUPERVISOR,
      ProjectRole.ARCHITECT,
      ProjectRole.ENGINEER,
      ProjectRole.CONTRACTOR
    ],
    defaultTasks: [
      {
        name: 'Site preparation',
        description: 'Clear site and prepare for foundation work',
        estimatedDuration: 14,
        role: ProjectRole.CONTRACTOR,
        category: 'Construction'
      },
      {
        name: 'Foundation excavation',
        description: 'Excavate for building foundation',
        estimatedDuration: 7,
        role: ProjectRole.CONTRACTOR,
        category: 'Construction'
      },
      {
        name: 'Procure structural materials',
        description: 'Order and coordinate delivery of structural materials',
        estimatedDuration: 30,
        role: ProjectRole.MANAGER,
        category: 'Procurement'
      }
    ],
    usageCount: 28
  },
  {
    id: 't2',
    name: 'Residential Development',
    description: 'Complete template for multi-unit residential development projects',
    projectType: ProjectType.RESIDENTIAL,
    createdBy: 'u2',
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date('2024-11-05'),
    isPublic: true,
    presetMilestones: [
      {
        name: 'Planning Approval',
        description: 'Obtain all necessary planning permissions',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      },
      {
        name: 'Foundation Complete',
        description: 'All foundation work completed for all units',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      },
      {
        name: 'Framing Complete',
        description: 'Structural framing completed for all units',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      },
      {
        name: 'Model Unit Complete',
        description: 'First model unit fully completed for showcase',
        status: 'pending',
        completion: 0,
        notifyOnCompletion: true
      }
    ],
    presetTeamRoles: [
      ProjectRole.OWNER,
      ProjectRole.MANAGER,
      ProjectRole.ARCHITECT,
      ProjectRole.ENGINEER,
      ProjectRole.CONTRACTOR,
      ProjectRole.INSPECTOR
    ],
    defaultTasks: [
      {
        name: 'Obtain construction permits',
        description: 'Submit application and obtain all required permits',
        estimatedDuration: 45,
        role: ProjectRole.MANAGER,
        category: 'Administration'
      },
      {
        name: 'Site clearing and grading',
        description: 'Clear vegetation and grade site for construction',
        estimatedDuration: 14,
        role: ProjectRole.CONTRACTOR,
        category: 'Construction'
      },
      {
        name: 'Utility connections',
        description: 'Establish connections to municipal utilities',
        estimatedDuration: 21,
        role: ProjectRole.CONTRACTOR,
        category: 'Construction'
      }
    ],
    usageCount: 35
  }
];

/**
 * Class for handling project-related operations
 */
class ProjectService {
  /**
   * Get a list of project summaries
   */
  async getProjectSummaries(filter?: {
    status?: ProjectStatus[],
    health?: ProjectHealth[],
    search?: string
  }): Promise<ProjectSummary[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Apply filters if provided
    if (filter) {
      let filtered = MOCK_PROJECT_SUMMARIES;
      
      if (filter.status && filter.status.length > 0) {
        filtered = filtered.filter(p => filter.status!.includes(p.status));
      }
      
      if (filter.health && filter.health.length > 0) {
        filtered = filtered.filter(p => filter.health!.includes(p.health));
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.client?.name.toLowerCase().includes(searchLower) ||
          `${p.location.city} ${p.location.state}`.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    }
    
    return MOCK_PROJECT_SUMMARIES;
  }
  
  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In real implementation, this would fetch from the API
    // For now, return null to indicate project not found
    return null;
  }
  
  /**
   * Create a new project
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate a mock project with ID and timestamps
    const newProject: Project = {
      ...project,
      id: `p${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real implementation, this would save to the database
    
    return newProject;
  }
  
  /**
   * Update an existing project
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For now, just return a mock result
    return {
      ...(await this.getProject(id) || {}),
      ...updates,
      id,
      updatedAt: new Date()
    } as Project;
  }
  
  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return success
    return true;
  }
  
  /**
   * Get project templates
   */
  async getProjectTemplates(filter?: {
    projectType?: ProjectType,
    search?: string
  }): Promise<ProjectTemplate[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Apply filters if provided
    if (filter) {
      let filtered = MOCK_TEMPLATES;
      
      if (filter.projectType) {
        filtered = filtered.filter(t => t.projectType === filter.projectType);
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    }
    
    return MOCK_TEMPLATES;
  }
  
  /**
   * Get a project template by ID
   */
  async getProjectTemplate(id: string): Promise<ProjectTemplate | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const template = MOCK_TEMPLATES.find(t => t.id === id);
    return template || null;
  }
}

// Create a singleton instance
const projectService = new ProjectService();
export default projectService;
