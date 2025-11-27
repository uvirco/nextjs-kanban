import {
  Board,
  Column,
  Task,
  Activity,
  User,
  Label,
  Checklist,
  ChecklistItem,
  BoardMember,
  TaskAssignment,
  Priority,
  RiskLevel,
  Attachment,
  TaskWatcher,
  TaskDependency,
} from "@prisma/client";

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
  // Advanced project fields
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
};

export type TaskEditData = {
  id: Task["id"];
  title: Task["title"];
  description?: Task["description"];
  boardId: Board["id"];
  // Advanced project fields
  priority?: Priority;
  businessValue?: string;
  estimatedEffort?: number;
  budgetEstimate?: number;
  riskLevel?: RiskLevel;
  strategicAlignment?: string;
  roiEstimate?: number;
  stageGate?: string;
  timeSpent?: number;
  storyPoints?: number;
};

export type TaskDeletionData = {
  id: Task["id"];
  boardId: Board["id"];
  columnId: Column["id"];
};
