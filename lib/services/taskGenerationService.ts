/**
 * Task Generation Service
 * 
 * Provides functionality to auto-generate tasks based on project type, milestones, and timeline.
 * Following BuildTrack Pro design principles and technical standards.
 */

import { Milestone, ProjectType, TeamRole } from '../types/project';

// Interface for Task data
export interface Task {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  assigneeRole?: TeamRole;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  milestoneId: string;
  dateCreated: Date;
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Template tasks for different project types and milestone categories
interface TaskTemplate {
  name: string;
  description: string;
  estimatedHours: number;
  assigneeRole: TeamRole;
  priority: TaskPriority;
  relativeDaysFromStart: number; // Used to calculate due date based on milestone start
}

// Task templates by project type and milestone category
const taskTemplates: Record<ProjectType, Record<string, TaskTemplate[]>> = {
  [ProjectType.RESIDENTIAL]: {
    'Planning & Design': [
      {
        name: 'Create architectural drawings',
        description: 'Develop and finalize architectural drawings for the residential project',
        estimatedHours: 40,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      },
      {
        name: 'Obtain building permits',
        description: 'Apply for and secure all necessary building permits from local authorities',
        estimatedHours: 16,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 14
      },
      {
        name: 'Finalize budget',
        description: 'Complete detailed budget breakdown for client approval',
        estimatedHours: 24,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      }
    ],
    'Foundation': [
      {
        name: 'Site excavation',
        description: 'Complete excavation for foundation and utilities',
        estimatedHours: 32,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Pour foundation',
        description: 'Form and pour concrete foundation',
        estimatedHours: 40,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      }
    ],
    'Framing': [
      {
        name: 'Wall framing',
        description: 'Construct exterior and interior wall frames',
        estimatedHours: 80,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Roof framing',
        description: 'Install roof trusses and framing',
        estimatedHours: 64,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 12
      }
    ],
    'Mechanical, Electrical, Plumbing': [
      {
        name: 'Rough electrical',
        description: 'Install electrical boxes, wiring and panels',
        estimatedHours: 48,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Rough plumbing',
        description: 'Install water supply lines, drains, and vents',
        estimatedHours: 40,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 4
      },
      {
        name: 'HVAC installation',
        description: 'Install heating, ventilation, and air conditioning systems',
        estimatedHours: 40,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      }
    ],
    'Interior Finishing': [
      {
        name: 'Drywall installation',
        description: 'Install and finish drywall throughout the house',
        estimatedHours: 60,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.MEDIUM,
        relativeDaysFromStart: 3
      },
      {
        name: 'Painting',
        description: 'Prime and paint all interior surfaces',
        estimatedHours: 48,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.MEDIUM,
        relativeDaysFromStart: 10
      },
      {
        name: 'Flooring installation',
        description: 'Install all floor coverings (hardwood, tile, carpet)',
        estimatedHours: 56,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.MEDIUM,
        relativeDaysFromStart: 15
      }
    ],
    'Final Inspection & Handover': [
      {
        name: 'Final cleaning',
        description: 'Complete detailed cleaning of the entire property',
        estimatedHours: 24,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.MEDIUM,
        relativeDaysFromStart: 3
      },
      {
        name: 'Final inspection',
        description: 'Conduct final inspection with local building authority',
        estimatedHours: 8,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Client walkthrough',
        description: 'Walk through the completed property with the client',
        estimatedHours: 4,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      }
    ]
  },
  [ProjectType.COMMERCIAL]: {
    'Planning & Approval': [
      {
        name: 'Develop project brief',
        description: 'Create comprehensive project requirements document',
        estimatedHours: 24,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Commercial zoning review',
        description: 'Review local zoning regulations and secure necessary approvals',
        estimatedHours: 16,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ],
    'Design & Engineering': [
      {
        name: 'Structural engineering plans',
        description: 'Develop detailed structural engineering documentation',
        estimatedHours: 80,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      },
      {
        name: 'MEP systems design',
        description: 'Design mechanical, electrical, and plumbing systems',
        estimatedHours: 64,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 14
      }
    ],
    'Site Work & Foundation': [
      {
        name: 'Site preparation',
        description: 'Clear site and prepare for construction',
        estimatedHours: 40,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Foundation work',
        description: 'Construct foundation according to engineering specifications',
        estimatedHours: 120,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ],
    'Building Structure': [
      {
        name: 'Steel framework',
        description: 'Erect steel framework for commercial building',
        estimatedHours: 160,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      },
      {
        name: 'Exterior wall construction',
        description: 'Construct exterior walls and facade',
        estimatedHours: 120,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 21
      }
    ],
    'Interior & Systems': [
      {
        name: 'Fire protection systems',
        description: 'Install fire sprinklers and alarm systems',
        estimatedHours: 80,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Commercial HVAC installation',
        description: 'Install commercial-grade HVAC systems',
        estimatedHours: 120,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ],
    'Finishing & Inspection': [
      {
        name: 'Commercial code compliance check',
        description: 'Verify all work meets commercial building codes',
        estimatedHours: 24,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Occupancy certificate',
        description: 'Obtain certificate of occupancy from local authorities',
        estimatedHours: 8,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ]
  },
  [ProjectType.INDUSTRIAL]: {
    'Planning & Engineering': [
      {
        name: 'Industrial site assessment',
        description: 'Evaluate site for industrial requirements and compliance',
        estimatedHours: 40,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Environmental impact study',
        description: 'Conduct assessment of environmental impact',
        estimatedHours: 80,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 15
      }
    ],
    'Foundation & Structure': [
      {
        name: 'Industrial foundation construction',
        description: 'Construct heavy-duty foundation for industrial use',
        estimatedHours: 160,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      },
      {
        name: 'Steel structure assembly',
        description: 'Assemble industrial steel framework',
        estimatedHours: 200,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 21
      }
    ],
    'Industrial Systems': [
      {
        name: 'Industrial electrical systems',
        description: 'Install high-capacity electrical systems',
        estimatedHours: 160,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      },
      {
        name: 'Industrial plumbing',
        description: 'Install industrial plumbing and drainage systems',
        estimatedHours: 120,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 15
      }
    ],
    'Safety & Compliance': [
      {
        name: 'Safety systems installation',
        description: 'Install safety systems and equipment',
        estimatedHours: 80,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Regulatory compliance audit',
        description: 'Verify compliance with industrial regulations',
        estimatedHours: 40,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ]
  },
  [ProjectType.INFRASTRUCTURE]: {
    'Planning & Permitting': [
      {
        name: 'Infrastructure feasibility study',
        description: 'Conduct feasibility analysis for infrastructure project',
        estimatedHours: 80,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      },
      {
        name: 'Public works permits',
        description: 'Secure permits for infrastructure construction',
        estimatedHours: 40,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 14
      }
    ],
    'Site Preparation': [
      {
        name: 'Site survey',
        description: 'Complete detailed survey of project area',
        estimatedHours: 24,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Utility identification',
        description: 'Identify and mark existing utilities',
        estimatedHours: 40,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      }
    ],
    'Construction': [
      {
        name: 'Earthwork operations',
        description: 'Conduct major earthmoving and grading',
        estimatedHours: 160,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Infrastructure installation',
        description: 'Install core infrastructure components',
        estimatedHours: 240,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 14
      }
    ],
    'Testing & Handover': [
      {
        name: 'System testing',
        description: 'Test all infrastructure systems',
        estimatedHours: 60,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Public agency inspection',
        description: 'Coordinate inspection with public agencies',
        estimatedHours: 24,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ]
  },
  [ProjectType.RENOVATION]: {
    'Assessment & Planning': [
      {
        name: 'Existing conditions assessment',
        description: 'Evaluate current structure and systems',
        estimatedHours: 24,
        assigneeRole: TeamRole.CONSULTANT,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Renovation scope definition',
        description: 'Define detailed scope of renovation work',
        estimatedHours: 16,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      }
    ],
    'Demolition': [
      {
        name: 'Selective demolition',
        description: 'Remove targeted elements for renovation',
        estimatedHours: 40,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Debris removal',
        description: 'Remove and dispose of demolition debris',
        estimatedHours: 24,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.MEDIUM,
        relativeDaysFromStart: 6
      }
    ],
    'Renovation Work': [
      {
        name: 'Structural modifications',
        description: 'Make necessary structural changes',
        estimatedHours: 60,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 5
      },
      {
        name: 'Update building systems',
        description: 'Update electrical, plumbing, and HVAC systems',
        estimatedHours: 80,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ],
    'Finishing & Inspection': [
      {
        name: 'Interior finishing',
        description: 'Complete interior finishes and details',
        estimatedHours: 64,
        assigneeRole: TeamRole.TEAM_MEMBER,
        priority: TaskPriority.MEDIUM,
        relativeDaysFromStart: 5
      },
      {
        name: 'Final renovation inspection',
        description: 'Conduct final inspection of renovated space',
        estimatedHours: 8,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 10
      }
    ]
  },
  [ProjectType.OTHER]: {
    'Planning': [
      {
        name: 'Project scope definition',
        description: 'Define project scope and objectives',
        estimatedHours: 16,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Requirements gathering',
        description: 'Gather and document project requirements',
        estimatedHours: 24,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      }
    ],
    'Execution': [
      {
        name: 'Task allocation',
        description: 'Allocate tasks to team members',
        estimatedHours: 8,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Progress monitoring',
        description: 'Track and report on project progress',
        estimatedHours: 40,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.MEDIUM,
        relativeDaysFromStart: 10
      }
    ],
    'Completion': [
      {
        name: 'Quality assurance',
        description: 'Verify project quality meets standards',
        estimatedHours: 16,
        assigneeRole: TeamRole.SUPERVISOR,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 3
      },
      {
        name: 'Project closure',
        description: 'Complete project documentation and handover',
        estimatedHours: 8,
        assigneeRole: TeamRole.PROJECT_MANAGER,
        priority: TaskPriority.HIGH,
        relativeDaysFromStart: 7
      }
    ]
  }
};

/**
 * Find matching task templates for a milestone
 * 
 * @param milestone The milestone to match templates for
 * @param projectType Type of the project
 * @returns Array of matching task templates
 */
const findMatchingTaskTemplates = (
  milestone: Milestone, 
  projectType: ProjectType
): TaskTemplate[] => {
  // Default to OTHER if project type not found in templates
  const projectTemplates = taskTemplates[projectType] || taskTemplates[ProjectType.OTHER];
  
  // Try to find matching category based on milestone name
  let matchingCategory = '';
  const milestoneName = milestone.name.toLowerCase();
  
  // Check each category for a match
  for (const category of Object.keys(projectTemplates)) {
    if (milestoneName.includes(category.toLowerCase())) {
      matchingCategory = category;
      break;
    }
  }

  // If no direct match, try to find a similar category
  if (!matchingCategory) {
    // Common mapping for various milestone names to task categories
    const categoryKeywords: Record<string, string[]> = {
      'Planning & Design': ['plan', 'design', 'concept', 'approval', 'permit'],
      'Foundation': ['foundation', 'site prep', 'excavation', 'groundwork'],
      'Framing': ['frame', 'structure', 'walls', 'roof'],
      'Mechanical, Electrical, Plumbing': ['mep', 'electrical', 'plumbing', 'hvac', 'mechanical'],
      'Interior Finishing': ['interior', 'finish', 'drywall', 'paint', 'flooring'],
      'Final Inspection & Handover': ['final', 'inspection', 'complete', 'handover', 'delivery']
    };

    // Find most suitable category based on milestone name
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => milestoneName.includes(keyword))) {
        if (projectTemplates[category]) {
          matchingCategory = category;
          break;
        }
      }
    }
  }

  // Get tasks from the matching category or use a default category if no match found
  return matchingCategory && projectTemplates[matchingCategory] 
    ? projectTemplates[matchingCategory]
    : projectTemplates[Object.keys(projectTemplates)[0]]; // Use first category as default
};

/**
 * Generate tasks for a single milestone
 * 
 * @param milestone Milestone to generate tasks for
 * @param projectType Type of the project
 * @returns Array of generated tasks
 */
export const generateTasksForMilestone = (
  milestone: Milestone,
  projectType: ProjectType
): Task[] => {
  // Get matching task templates for this milestone
  const matchingTemplates = findMatchingTaskTemplates(milestone, projectType);
  
  // Convert templates to tasks with proper dates and IDs
  return matchingTemplates.map(template => {
    // Calculate due date based on milestone target date and relative days
    const milestoneDate = new Date(milestone.targetDate);
    const dueDate = new Date(milestoneDate.getTime());
    dueDate.setDate(dueDate.getDate() + template.relativeDaysFromStart);
    
    // Create a new task
    return {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: template.name,
      description: template.description,
      estimatedHours: template.estimatedHours,
      assigneeRole: template.assigneeRole,
      status: TaskStatus.NOT_STARTED,
      priority: template.priority,
      dueDate,
      milestoneId: milestone.id,
      dateCreated: new Date()
    };
  });
};

/**
 * Generate tasks for all milestones
 * 
 * @param milestones Array of project milestones
 * @param projectType Type of the project
 * @returns Object mapping milestone IDs to arrays of tasks
 */
export const generateTasks = (
  milestones: Milestone[],
  projectType: ProjectType
): Record<string, Task[]> => {
  const tasksByMilestone: Record<string, Task[]> = {};
  
  milestones.forEach(milestone => {
    tasksByMilestone[milestone.id] = generateTasksForMilestone(milestone, projectType);
  });
  
  return tasksByMilestone;
};

/**
 * Calculate estimated total hours for tasks
 * 
 * @param tasks Array of tasks
 * @returns Total estimated hours
 */
export const calculateTotalEstimatedHours = (tasks: Task[]): number => {
  return tasks.reduce((total, task) => total + task.estimatedHours, 0);
};

/**
 * Calculate overall completion percentage for tasks
 * 
 * @param tasks Array of tasks
 * @returns Completion percentage (0-100)
 */
export const calculateTasksCompletion = (tasks: Task[]): number => {
  if (!tasks.length) return 0;
  
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
  return Math.round((completedTasks.length / tasks.length) * 100);
};
