// Project status options
export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';

// Project member with role
export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'manager' | 'team_member' | 'client' | 'vendor';
  permissions: string[];
  joinedAt: string;
}

// Task priority levels
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

// Task status options
export type TaskStatus = 'Not Started' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';

// Project task
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  parentTaskId: string | null; // For subtasks
  tags: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Material status
export type MaterialStatus = 'Pending' | 'Ordered' | 'Delivered' | 'Installed' | 'Returned';

// Project material
export interface Material {
  id: string;
  projectId: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  status: MaterialStatus;
  supplier: string;
  orderDate: string | null;
  deliveryDate: string | null;
  location: string;
  notes: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Document categories
export type DocumentCategory = 
  | 'Contract' 
  | 'Drawing' 
  | 'Permit' 
  | 'Invoice' 
  | 'Receipt' 
  | 'Report' 
  | 'Specification' 
  | 'Correspondence' 
  | 'Photo' 
  | 'Other';

// Project document/attachment
export interface Attachment {
  id: string;
  projectId: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: DocumentCategory;
  description: string;
  url: string;
  thumbnailUrl: string | null;
  uploadedById: string;
  uploadedAt: string;
  tags: string[];
  metadata: Record<string, any>;
}

// Financial transaction type
export type TransactionType = 'Income' | 'Expense' | 'Invoice' | 'Payment' | 'Adjustment';

// Project financial transaction
export interface Transaction {
  id: string;
  projectId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  category: string;
  paymentMethod: string;
  reference: string;
  contactId: string | null; // Client, vendor, or contractor
  attachments: Attachment[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// Project budget item
export interface BudgetItem {
  id: string;
  projectId: string;
  category: string;
  description: string;
  estimatedAmount: number;
  actualAmount: number;
  variance: number;
  notes: string;
}

// Project milestone
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate: string | null;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Missed';
  tasks: string[]; // Task IDs associated with this milestone
}

// Weather data for project location
export interface WeatherData {
  date: string;
  conditions: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

// Project location coordinates
export interface ProjectLocation {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

// The main Project schema
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate: string | null;
  clientId: string | null;
  location: ProjectLocation;
  budget: {
    total: number;
    spent: number;
    remaining: number;
    items: BudgetItem[];
  };
  progress: number; // 0-100 percentage
  team: ProjectMember[];
  tasks: Task[];
  materials: Material[];
  documents: Attachment[];
  transactions: Transaction[];
  milestones: Milestone[];
  weather: WeatherData[];
  tags: string[];
  notes: string;
  createdById: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Project creation input
export interface ProjectCreateInput {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  estimatedEndDate: string;
  clientId?: string;
  location: ProjectLocation;
  budget: {
    total: number;
  };
  tags?: string[];
  notes?: string;
}

// Project update input
export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  estimatedEndDate?: string;
  actualEndDate?: string | null;
  clientId?: string | null;
  location?: Partial<ProjectLocation>;
  budget?: {
    total?: number;
  };
  progress?: number;
  tags?: string[];
  notes?: string;
}
