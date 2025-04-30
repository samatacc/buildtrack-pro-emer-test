/**
 * Project Management Types
 * 
 * Defines the core type definitions for the Project Management Module.
 * Following BuildTrack Pro design principles and technical standards.
 */

/**
 * Represents the different states a project can be in
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  DELAYED = 'delayed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in-progress'
}

/**
 * Represents project health indicators
 */
export enum ProjectHealth {
  ON_TRACK = 'on-track',
  AT_RISK = 'at-risk',
  DELAYED = 'delayed'
}

/**
 * Represents project types commonly used in construction
 */
export enum ProjectType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  RENOVATION = 'RENOVATION',
  OTHER = 'OTHER'
}

/**
 * Represents project priority levels
 */
export enum ProjectPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

/**
 * Represents project team member roles
 */
export enum TeamRole {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  TEAM_MEMBER = 'TEAM_MEMBER',
  CONSULTANT = 'CONSULTANT',
  CLIENT = 'CLIENT',
  GUEST = 'GUEST'
}

/**
 * Represents milestone status
 */
export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED'
}

/**
 * Project location information
 */
export interface ProjectLocation {
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  siteDetails?: {
    siteArea: number;
    areaUnit: string;
    zoningInformation: string;
    siteConditions: string;
    existingStructures: boolean;
  };
}

/**
 * Budget item information
 */
export interface BudgetItem {
  id: string;
  name: string;
  description?: string;
  unitCost: number;
  quantity: number;
  plannedAmount: number;
  spentAmount: number;
  dateCreated: Date;
}

/**
 * Budget category information
 */
export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  plannedAmount: number;
  spentAmount: number;
  items: BudgetItem[];
}

/**
 * Project budget information
 */
export interface Budget {
  totalBudget: number;
  spentBudget: number;
  currency: string;
  contingencyPercentage: number;
  categories: BudgetCategory[];
}

/**
 * Deliverable information
 */
export interface Deliverable {
  id: string;
  name: string;
  completed: boolean;
}

/**
 * Milestone information
 */
export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  status: MilestoneStatus;
  deliverables: Deliverable[];
  dateCreated: Date;
}

/**
 * Team member information
 */
export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  dateAdded: Date;
  avatarUrl?: string;
  permissions: {
    canEdit: boolean;
    canInvite: boolean;
    canApprove: boolean;
    canViewBudget: boolean;
    canManageTasks: boolean;
  };
}

/**
 * Legacy interfaces for backwards compatibility
 */
export interface ProjectBudget extends Budget {}
export interface ProjectTeamMember extends TeamMember {}
export interface ProjectMilestone extends Milestone {}

/**
 * Complete project data model
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  priority: ProjectPriority;
  status: ProjectStatus;
  health: ProjectHealth;
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  location: ProjectLocation;
  budget: Budget;
  team: TeamMember[];
  milestones: Milestone[];
  completion: number; // Percentage of completion (0-100)
  dateCreated: Date;
  lastUpdated: Date;
  settings: {
    isPublic: boolean;
    allowGuestComments: boolean;
    notificationPreferences: {
      dailyDigest: boolean;
      milestoneAlerts: boolean;
      taskAssignments: boolean;
      budgetAlerts: boolean;
    };
  };
  client?: {
    id: string;
    name: string;
  };
}

/**
 * Project summary for use in lists and cards
 */
export interface ProjectSummary {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  health: ProjectHealth;
  completion: number;
  startDate: Date;
  targetEndDate: Date;
  client?: {
    id: string;
    name: string;
  };
  location: {
    city: string;
    state: string;
  };
  budget: {
    totalBudget: number;
    spentBudget: number;
    currency: string;
  };
  teamSize: number;
  tasks: {
    total: number;
    completed: number;
    overdue: number;
  };
}

/**
 * Project template for re-using project structures
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  presetMilestones: Omit<ProjectMilestone, 'id' | 'actualDate' | 'targetDate'>[];
  presetTeamRoles: TeamRole[];
  defaultTasks: {
    name: string;
    description?: string;
    estimatedDuration: number; // In days
    role: TeamRole; // Suggested assignee role
    category: string;
  }[];
  usageCount: number;
}
