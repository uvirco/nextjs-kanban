# Epic Portfolio - Implementation Guide

## Overview

A comprehensive epic planning system with RACI Matrix and Stakeholder management, providing high-level portfolio visibility with priority-based grouping.

## Database Schema

### SQL Migration File

Location: `supabase-add-raci-stakeholder.sql`

**IMPORTANT**: This migration has NOT been applied yet. You must:

1. Go to Supabase Dashboard → SQL Editor
2. Paste the contents of `supabase-add-raci-stakeholder.sql`
3. Execute the migration

### New Tables

#### RACIMatrix

Maps users to tasks with RACI roles (Responsible, Accountable, Consulted, Informed)

```sql
CREATE TABLE "RACIMatrix" (
  id TEXT PRIMARY KEY,
  taskId TEXT REFERENCES "Task"(id) ON DELETE CASCADE,
  userId TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  role "RACIRole" NOT NULL,
  assignedAt TIMESTAMP DEFAULT NOW()
);
```

#### Stakeholder

Tracks interested parties with notification preferences

```sql
CREATE TABLE "Stakeholder" (
  id TEXT PRIMARY KEY,
  taskId TEXT REFERENCES "Task"(id) ON DELETE CASCADE,
  userId TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  stakeholderType "StakeholderType" NOT NULL,
  notificationPreference "NotificationPreference" DEFAULT 'MAJOR',
  notes TEXT
);
```

### New Enums

- **TaskType**: EPIC, STORY, TASK, SUBTASK, BUG
- **RACIRole**: RESPONSIBLE, ACCOUNTABLE, CONSULTED, INFORMED
- **StakeholderType**: SPONSOR, APPROVER, INFORMED, CONSULTED, EXECUTIVE
- **NotificationPreference**: ALL, MAJOR, CRITICAL, NONE

### Task Table Updates

- Added `taskType` field (enum: TaskType)
- Added `parentTaskId` for task hierarchy
- Added `businessValue`, `riskLevel`, `effort` fields for epic planning

## File Structure

```
app/(default-layout)/epics/
├── page.tsx                           # Server component - fetches epics with metrics
├── [id]/
│   └── page.tsx                       # Epic detail page with RACI, stakeholders, subtasks
└── components/
    ├── EpicPortfolioClient.tsx        # Client component with view switching
    ├── EpicPriorityView.tsx           # Priority-grouped epic display
    └── EpicCard.tsx                   # Individual epic card component
```

## Features Implemented

### 1. Epic Portfolio Page (`/epics`)

- **Server Component**: Fetches all epics from Supabase
- **Metrics Calculation**:
  - Total subtasks count
  - Completed tasks count
  - Blocked tasks count
  - Progress percentage
- **Enrichment**:
  - Fetches RACI assignments for each epic
  - Fetches stakeholders for each epic
  - Fetches epic owner details

### 2. View Modes

- **Priority View** (default): Groups epics by CRITICAL → HIGH → MEDIUM → LOW
- **Timeline View**: (Placeholder for Gantt chart implementation)
- **Matrix View**: (Placeholder for 2x2 value/effort grid)

### 3. Filters

- All Epics
- Active Only
- Backlog

### 4. Epic Detail Page (`/epics/[id]`)

Displays:

- Epic header with title, description, business value, risk level
- Progress metrics (progress %, total tasks, completed, blocked)
- Owner and due date
- **RACI Matrix**: Shows all assignments grouped by role
- **Subtasks**: List of child tasks with status and assignee
- **Stakeholders**: List with type and notification preferences

### 5. Epic Card Component

Shows compact epic info:

- Title and description (truncated)
- Business value badge
- Progress percentage
- Owner name
- Due date
- Task counts (total, completed, blocked)
- Risk level indicator
- Progress bar visualization

## Usage Flow

### Creating an Epic (Agile Approach)

```typescript
// Start with minimal information - only title required
const { data, error } = await supabase.from("Task").insert({
  title: "Implement User Authentication", // Only required field
  description: "Complete overhaul of auth system", // Optional
  taskType: "EPIC",
  userId: currentUserId,
  // All other fields can be added later:
  // priority, businessValue, riskLevel, effort, dueDate, boardId, columnId
});

// Add details progressively as planning progresses
await supabase
  .from("Task")
  .update({
    priority: "HIGH",
    businessValue: "HIGH",
    riskLevel: "MEDIUM",
    effort: "HIGH",
    dueDate: "2025-12-31",
    boardId: boardId, // Assign to board when ready
    columnId: columnId,
  })
  .eq("id", epicId);
```

### Adding RACI Assignments

```typescript
await supabase.from("RACIMatrix").insert({
  id: generateId(),
  taskId: epicId,
  userId: userId,
  role: "RESPONSIBLE", // or ACCOUNTABLE, CONSULTED, INFORMED
});
```

### Adding Stakeholders

```typescript
await supabase.from("Stakeholder").insert({
  id: generateId(),
  taskId: epicId,
  userId: userId,
  stakeholderType: "SPONSOR", // or APPROVER, INFORMED, etc.
  notificationPreference: "MAJOR",
  notes: "Key decision maker for this epic",
});
```

### Creating Subtasks

```typescript
await supabase.from("Task").insert({
  title: "Design auth flow",
  taskType: "TASK",
  parentTaskId: epicId, // Link to parent epic
  userId: assigneeId,
  boardId: boardId,
  columnId: columnId,
});
```

## Design System

### Colors

- **Background**: `bg-zinc-950` (dark base)
- **Cards**: `bg-zinc-900` with `border-zinc-800`
- **Text**: `text-white` (primary), `text-zinc-400` (secondary)
- **Priority Colors**:
  - Critical: `bg-red-500`
  - High: `bg-orange-500`
  - Medium: `bg-yellow-500`
  - Low: `bg-zinc-500`
- **Risk Colors**:
  - High: `bg-red-900/30 text-red-400`
  - Medium: `bg-yellow-900/30 text-yellow-400`
  - Low: `bg-green-900/30 text-green-400`

### Icons (Tabler Icons)

- Users: Team/owner indicators
- Clock: Due dates
- AlertTriangle: Blocked tasks
- ArrowLeft: Navigation

## Next Steps

### 1. Apply Database Migration

**CRITICAL**: Run `supabase-add-raci-stakeholder.sql` in Supabase Dashboard

### 2. Test Epic Creation

Create a test epic and verify:

- Epic appears in portfolio
- Priority grouping works
- Metrics calculate correctly

### 3. Implement Remaining Views

- **Timeline View**: Gantt chart showing epic timeline
- **Matrix View**: 2x2 grid (business value vs effort)

### 4. Add Epic Creation Form ✅ COMPLETED

Created `/epics/new` route with streamlined form:

- **Minimal Requirements**: Only title is required
- **Progressive Enhancement**: All other fields are optional and can be added later
- **Agile Approach**: Start with basic info, refine details as planning progresses
- **Board Assignment**: Optional - epics can exist without board assignment initially
- **Smart Validation**: Column only required if board is selected

### 5. Add Interactivity

- Drag-and-drop priority reordering
- Inline RACI editing
- Quick subtask creation from detail page
- Epic status transitions

### 6. Add Navigation Link

Update `ui/Sidebar/Sidebar.tsx` to include:

```tsx
<Link href="/epics" className="...">
  <IconTarget size={20} />
  Epic Portfolio
</Link>
```

## Data Model Diagram

```
Task (Epic)
├── taskType: 'EPIC'
├── businessValue: string
├── riskLevel: string
├── effort: string
├── Has Many → Task (Subtasks via parentTaskId)
├── Has Many → RACIMatrix (role assignments)
└── Has Many → Stakeholder (interested parties)

RACIMatrix
├── taskId → Task
├── userId → User
└── role: RESPONSIBLE | ACCOUNTABLE | CONSULTED | INFORMED

Stakeholder
├── taskId → Task
├── userId → User
├── stakeholderType: SPONSOR | APPROVER | INFORMED | etc.
└── notificationPreference: ALL | MAJOR | CRITICAL | NONE
```

## Query Patterns

### Fetch Epics with Metrics

```typescript
// 1. Fetch all epics
const { data: epics } = await supabase
  .from("Task")
  .select("*")
  .eq("taskType", "EPIC");

// 2. For each epic, fetch subtasks
const { data: subtasks } = await supabase
  .from("Task")
  .select("*")
  .eq("parentTaskId", epicId);

// 3. Calculate metrics
const progress = (completedCount / totalCount) * 100;
```

### Fetch RACI Assignments

```typescript
const { data: raciAssignments } = await supabase
  .from("RACIMatrix")
  .select("*, user:User(id, name, email)")
  .eq("taskId", epicId);

// Group by role
const responsible = raciAssignments.filter((r) => r.role === "RESPONSIBLE");
```

## Troubleshooting

### Epic Not Appearing in Portfolio

- Verify `taskType` field is set to `'EPIC'`
- Check migration was applied successfully
- Ensure user has access to the board (if assigned to one)

### Board Assignment Behavior

- **Optional**: Epics can be created without board assignment
- **Later Assignment**: Epics show "📋 Not assigned to a board yet" indicator
- **Validation**: If board is selected, column becomes required
- **Metrics**: Work correctly even without board assignment

### RACI/Stakeholder Data Missing

- Verify foreign key relationships in migration
- Check Supabase table permissions (RLS policies)
- Ensure `ON DELETE CASCADE` is working

### Metrics Not Calculating

- Check `parentTaskId` is set correctly on subtasks
- Verify subtask status values match expected ('DONE', etc.)
- Check `isBlocked` field exists on Task table

## Performance Considerations

- Epic list queries fetch all epics upfront (consider pagination for 100+ epics)
- Metrics calculated server-side to avoid N+1 queries
- Subtask counts use separate queries (not nested joins) for Supabase compatibility
- Consider caching epic metrics for frequently accessed epics

## Security Notes

- All epic operations use `createSupabaseServerActionClient()` with service role
- Row Level Security (RLS) policies should restrict epic access by board membership
- RACI/Stakeholder assignments should validate user exists and has board access
- Consider adding audit trail for RACI changes

---

**Status**: ✅ Epic Creation Complete, ⏳ Migration pending, 🚀 Ready for testing after migration
