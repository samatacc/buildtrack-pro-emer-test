/**
 * Project types for BuildTrack Pro
 * 
 * This file defines all the core project-related types used throughout the application.
 */

// Project types
export enum ProjectType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  INFRASTRUCTURE = 'infrastructure',
  RENOVATION = 'renovation',
  OTHER = 'other'
}

// Project status
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Project health indicators
export enum ProjectHealth {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  DELAYED = 'delayed',
  AHEAD = 'ahead'
}

// Task priority levels
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Milestone status
export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

// Budget item interface
export interface BudgetItem {
  id: string;
  name: string;
  description: string;
  unitCost: number;
  quantity: number;
  plannedAmount: number;
  spentAmount: number;
  dateCreated: Date;
}

// Budget category interface
export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  plannedAmount: number;
  spentAmount: number;
  items: BudgetItem[];
}

// Budget interface
export interface Budget {
  totalBudget: number;
  spentBudget: number;
  currency: string;
  contingencyPercentage: number;
  categories: BudgetCategory[];
}

// Task interface
export interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  estimatedHours: number;
  actualHours: number;
  dependencies: string[];
  attachments: string[];
  dateCreated: Date;
  dateUpdated?: Date;
  dateCompleted?: Date;
}

// Milestone interface
export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  status: MilestoneStatus;
  deliverables: string[];
  dateCreated: Date;
  dateCompleted?: Date;
}

// Extended milestone interface with tasks
export interface MilestoneWithTasks extends Milestone {
  tasks?: Task[];
  showTasks?: boolean;
}

// Project interface
export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  health: ProjectHealth;
  location: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  client: {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  team: {
    id: string;
    name: string;
    role: string;
  }[];
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  milestones: MilestoneWithTasks[];
  budget: Budget;
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    dateUploaded: Date;
    uploadedBy: string;
  }[];
  progress: number;
  risks: {
    id: string;
    description: string;
    severity: string;
    mitigation: string;
    status: string;
  }[];
  notes: string;
  createdBy: string;
  dateCreated: Date;
  dateUpdated: Date;
}

// Project creation form data
export interface ProjectFormData {
  name: string;
  description: string;
  projectType: ProjectType;
  client: {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
  };
  location: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  startDate: Date;
  estimatedEndDate: Date;
  siteArea?: number;
  areaUnit?: 'sqft' | 'sqm';
  projectDuration?: number;
  isExpedited?: boolean;
  complexityFactor?: number;
  contingencyPercentage?: number;
  milestones: MilestoneWithTasks[];
  budget?: Budget;
  team?: {
    id: string;
    name: string;
    role: string;
  }[];
}
