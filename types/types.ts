// Database Types (replacing Prisma-generated types)

// Enums
export enum Role {
  member = "member",
  owner = "owner",
}

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum ActivityType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_MOVED = "TASK_MOVED",
  TASK_DELETED = "TASK_DELETED",
  COMMENT_ADDED = "COMMENT_ADDED",
  BOARD_UPDATED = "BOARD_UPDATED",
  START_DATE_ADDED = "START_DATE_ADDED",
  START_DATE_UPDATED = "START_DATE_UPDATED",
  START_DATE_REMOVED = "START_DATE_REMOVED",
  DUE_DATE_ADDED = "DUE_DATE_ADDED",
  DUE_DATE_UPDATED = "DUE_DATE_UPDATED",
  DUE_DATE_REMOVED = "DUE_DATE_REMOVED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_UNASSIGNED = "TASK_UNASSIGNED",
  EPIC_CREATED = "EPIC_CREATED",
  EPIC_UPDATED = "EPIC_UPDATED",
  MEETING_NOTE_ADDED = "MEETING_NOTE_ADDED",
  QUICK_NOTE_ADDED = "QUICK_NOTE_ADDED",
}

// Base Models
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  backgroundUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  startDate: Date | null;
  coverImage: string | null;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string;
  priority: Priority | null;
  businessValue: string | null;
  estimatedEffort: number | null;
  budgetEstimate: number | null;
  riskLevel: RiskLevel | null;
  strategicAlignment: string | null;
  roiEstimate: number | null;
  stageGate: string | null;
  timeSpent: number | null;
  storyPoints: number | null;
  departmentId: string | null;
  parentTaskId: string | null;
  acceptanceCriteria: string | null;
  readinessScore: number;
  epicId: string | null;
  assignedUserId: string | null;
}

export interface Activity {
  id: string;
  type: ActivityType;
  content: string | null;
  createdAt: Date;
  startDate: Date | null;
  dueDate: Date | null;
  userId: string;
  taskId: string | null;
  boardId: string | null;
  oldColumnId: string | null;
  newColumnId: string | null;
  originalColumnId: string | null;
  targetUserId: string | null;
}

export interface Label {
  id: string;
  title: string | null;
  color: string;
  isDefault: boolean;
  userId: string;
  boardId: string;
}

export interface Checklist {
  id: string;
  title: string | null;
  taskId: string;
}

export interface ChecklistItem {
  id: string;
  content: string;
  isChecked: boolean;
  checklistId: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  taskId: string;
  title: string;
  description: string | null;
  achieved: boolean;
  achievedAt: Date | null;
  achievedByUserId: string | null;
  order: number;
  createdAt: Date;
}

export interface BoardMember {
  userId: string;
  boardId: string;
  role: Role;
  createdAt: Date;
}

export interface TaskAssignment {
  userId: string;
  taskId: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  storage_path?: string | null;
  parent_type?: string | null;
  parent_id?: string | null;
  size: number | null;
  mimeType: string | null;
  taskId: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface TaskWatcher {
  userId: string;
  taskId: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
}

export interface Invitation {
  id: string;
  boardId: string;
  email: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  inviterId: string;
}

// Department type
export interface Department {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  manager?: User | null;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

// Epic type for epic portfolio functionality
export interface Epic {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  businessValue: string | null;
  riskLevel: string | null;
  dueDate: string | null;
  startDate: string | null;
  readinessScore?: number;
  estimatedEffort?: number | null;
  budgetEstimate?: number | null;
  department?: {
    id: string;
    name: string;
  } | null;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    progress: number;
  };
  owner: any;
  raciAssignments: any[];
  stakeholders: any[];
}

// FunctionalRole type for epic member roles
export interface FunctionalRole {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// NEW TYPES
// Extend TaskAssignment to include the nested user object
export interface TaskAssignmentWithUser extends TaskAssignment {
  user: User;
}

// Extend Checklist to include the nested items array
export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}

// Extend Activity to include the nested user, task, board, and column objects
export interface ActivityWithRelations extends Activity {
  user: User;
  task: Task | null;
  board: Board | null;
  oldColumn: Column | null;
  newColumn: Column | null;
  originalColumn: Column | null;
}

// All Task Details, this is used for detailed task view.
export interface DetailedTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  startDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  columnId: string;
  createdByUserId: string;
  parentTaskId: string | null;
  taskType?: string | null;
  parentEpic?: {
    id: string;
    title: string;
  } | null;
  // Advanced project fields
  projectName?: string | null;
  departmentId?: string | null;
  department?: Department | null;
  priority?: Priority | null;
  status?: string | null;
  businessValue?: string | null;
  estimatedEffort?: number | null;
  budgetEstimate?: number | null;
  riskLevel?: RiskLevel | null;
  strategicAlignment?: string | null;
  roiEstimate?: number | null;
  stageGate?: string | null;
  timeSpent?: number | null;
  storyPoints?: number | null;
  notes?: string | null;
  acceptanceCriteria?: string | null;
  readinessScore?: number;
  column: {
    title: string;
    boardId: string;
    board: {
      backgroundUrl: string | null;
    };
  };
  labels: Label[];
  checklists: ChecklistWithItems[];
  activities: ActivityWithRelations[];
  assignedUsers: TaskAssignmentWithUser[];
  attachments: Attachment[];
  watchers: TaskWatcher[];
  dependencies: TaskDependency[];
  subtasks: Task[];
}

// Extend BoardMember to include the nested user object
export interface BoardMemberWithUser extends BoardMember {
  user: User;
}

// Extend CardMember to include the nested user object
export interface CardMemberWithUser {
  user: User;
}

// Simplified Task for Board View
export interface BoardTask extends Task {
  labels: Label[];
  assignedUsers: TaskAssignmentWithUser[];
  taskType?: string | null;
}

// Extend Column to include the nested tasks
export interface ColumnWithTasks extends Column {
  tasks: BoardTask[];
}

// Extend Board to include the nested columns
export interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[];
}

export interface BoardMemberWithUser extends BoardMember {
  user: User;
}

// OLD TYPES

export type ChecklistItemSummary = Pick<
  ChecklistItem,
  "id" | "content" | "isChecked" | "createdAt"
>;

export type ChecklistSummary = Pick<Checklist, "id"> & {
  title: string | null;
  items: ChecklistItemSummary[];
};

export type LabelSummary = Pick<Label, "id" | "title" | "color">;

export type ActivityWithUser = Pick<
  Activity,
  "id" | "type" | "content" | "createdAt" | "startDate" | "dueDate"
> & {
  user: Pick<User, "id" | "name" | "image">;
  oldColumn: Pick<Column, "title"> | null;
  newColumn: Pick<Column, "title"> | null;
  originalColumn: Pick<Column, "title"> | null;
  task: Pick<Task, "title"> | null;
  targetUser: Pick<User, "id" | "name"> | null;
};

// Form validation

export type TaskCreationData = {
  taskTitle: Task["title"];
  description?: Task["description"];
  boardId: Board["id"];
  columnId: Column["id"];
  parentTaskId?: Task["parentTaskId"];
  assignedUserId?: string;
  // Advanced project fields
  priority?: Priority;
  dueDate?: string;
  startDate?: string;
  riskLevel?: RiskLevel;
  estimatedEffort?: number;
  storyPoints?: number;
  departmentId?: string;
  acceptanceCriteria?: string;
};

export type TaskEditData = {
  id: Task["id"];
  title?: Task["title"];
  description?: Task["description"];
  boardId?: Board["id"];
  order?: Task["order"];
  columnId?: Column["id"];
  // Advanced project fields
  projectName?: string;
  departmentId?: string;
  priority?: Priority;
  status?: string;
  businessValue?: string;
  estimatedEffort?: number;
  budgetEstimate?: number;
  riskLevel?: RiskLevel;
  strategicAlignment?: string;
  roiEstimate?: number;
  stageGate?: string;
  timeSpent?: number;
  storyPoints?: number;
  notes?: string;
  acceptanceCriteria?: string;
};

export type TaskDeletionData = {
  id: Task["id"];
  boardId: Board["id"];
  columnId: Column["id"];
};

export interface Risk {
  id: string;
  epicId: string;
  title: string;
  description: string | null;
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  mitigationPlan: string | null;
  status: "Open" | "Mitigated" | "Closed";
  createdAt: Date;
  updatedAt: Date;
  epic?: {
    title: string;
  };
}

export interface BudgetEntry {
  id: string;
  epic_id: string | null;
  department_id: string | null;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  entry_type: "Expense" | "Budget";
  frequency: "One-time" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  fiscal_year: string;
  purchase_date?: string | null; // Format: YYYY-MM-DD (date type)
  date: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
  epic?: {
    title: string;
  };
  department?: {
    name: string;
  };
}
