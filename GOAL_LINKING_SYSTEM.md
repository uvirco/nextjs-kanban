# Project Goals Linking System

## Current Architecture

### Goal Hierarchy Structure

Goals in the system support **parent-child relationships** through the `parent_goal_id` field:

```
Strategic Goal (Parent)
├── Goal Level 1 (Sub-goal)
│   ├── Goal Level 2 (Sub-sub-goal)
│   └── Goal Level 2 (Sub-sub-goal)
└── Goal Level 1 (Sub-goal)
```

### StrategicGoal Model

```typescript
interface StrategicGoal {
  id: string;
  title: string;
  description: string | null;
  fiscal_year: string | null;
  target_date: string | null;
  status: "active" | "achieved" | "on_hold" | "abandoned";
  progress: number; // 0-100
  created_by: string | null;
  created_at: string;
  updated_at: string;
  parent_goal_id: string | null; // Links to parent goal
  user?: { id: string; name: string; email: string };
  linkedTasksCount?: number; // Count of Project Tasks linked
  children?: StrategicGoal[];
}
```

## Current Linking Features

### 1. **Parent-Child Goal Relationships**

- When creating/editing a goal, you can select a parent goal
- Prevents circular references (self-referencing blocked)
- Supports unlimited nesting levels
- Visual hierarchy shown in list views with indentation

**Location**: [app/strategy-archive/page.tsx:870-890](app/strategy-archive/page.tsx#L870-L890)

### 2. **Linked Project Tasks**

- Strategic goals can be linked to Project Tasks
- `linkedTasksCount` shows how many tasks are linked
- Displayed as "📊 X project(s)" in UI
- Fetched from Task table where `goal_id = goal.id`

**Location**: [app/strategy-archive/page.tsx:98-108](app/strategy-archive/page.tsx#L98-L108)

### 3. **Visualization Components**

Three different view modes to see goal relationships:

- **Mermaid Diagram** (`GoalMermaidDiagram.tsx`)

  - Tree layout showing hierarchy
  - Interactive drill-down
  - Shows project counts per goal

- **Hierarchy Diagram** (`GoalHierarchyDiagram.tsx`)

  - Force-directed graph layout
  - Visual connections between goals
  - Node sizes represent linked projects

- **Timeline View**
  - Goals ordered by target_date
  - Shows fiscal year grouping
  - Status-based coloring

## Enhancement Opportunities

### 1. **Cross-Project Goal Linking**

**Not Currently Supported**

- Cannot link goals to other goals horizontally (peer-to-peer)
- Would allow goals from different hierarchies to reference each other
- Use case: "Security Goal" (IT) supports "Financial Goal" (accounting)

**Implementation**: Add `linked_goal_ids` junction table

### 2. **Goal Dependencies**

**Not Currently Supported**

- No concept of "Goal A must complete before Goal B starts"
- Could add `depends_on_goal_id` field with dependency type
- Types: "blocks", "enhances", "supports", "conflicts_with"

**Implementation**: Create `GoalDependency` table

### 3. **Goal-to-Epic Linking**

**Not Currently Implemented** (but feasible)

- Link strategic goals to project Epics
- Track how epics contribute to strategic goals
- Aggregate epic progress toward goal targets

**Implementation**: Add `epic_id` field to StrategicGoal

### 4. **Goal-to-Deal Linking**

**Not Currently Implemented** (but feasible)

- Link strategic goals to CRM deals
- Track revenue/business impact toward goals
- Show deal pipeline contribution to strategic targets

**Implementation**: Add `deal_id` field or create junction table

### 5. **Dynamic Progress Calculation**

**Currently Manual**

- Progress is manually updated on goal
- Could auto-calculate from child goals
- Could auto-calculate from linked tasks

**Enhancement**: Add `progress_calculation_method` field ("manual" | "from_children" | "from_tasks" | "weighted")

### 6. **Goal Alignment Scoring**

**Not Implemented**

- Calculate how well aligned child goals are with parent
- Show alignment percentage
- Highlight misaligned sub-goals

**Implementation**: Add alignment scoring algorithm

### 7. **Goal Conflict Detection**

**Not Implemented**

- Detect if two goals have conflicting targets
- Warn on contradictory progress paths
- Suggest dependency links

**Implementation**: Add conflict detection on save

## Database Schema Recommendations

### Current

```sql
CREATE TABLE "StrategicGoal" (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  fiscal_year VARCHAR(4),
  target_date DATE,
  status VARCHAR(20),
  progress INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  parent_goal_id UUID REFERENCES "StrategicGoal"(id),
  FOREIGN KEY (created_by) REFERENCES "User"(id)
);

CREATE TABLE "Task" (
  id UUID PRIMARY KEY,
  goal_id UUID REFERENCES "StrategicGoal"(id),
  ...
);
```

### Enhanced Options

#### Option A: Cross-Goal Links

```sql
CREATE TABLE goal_links (
  id UUID PRIMARY KEY,
  source_goal_id UUID NOT NULL REFERENCES "StrategicGoal"(id),
  target_goal_id UUID NOT NULL REFERENCES "StrategicGoal"(id),
  link_type VARCHAR(50), -- 'supports', 'enhances', 'depends_on', 'conflicts_with'
  created_at TIMESTAMP
);
```

#### Option B: Goal Dependencies

```sql
CREATE TABLE goal_dependencies (
  id UUID PRIMARY KEY,
  parent_goal_id UUID NOT NULL REFERENCES "StrategicGoal"(id),
  dependent_goal_id UUID NOT NULL REFERENCES "StrategicGoal"(id),
  dependency_type VARCHAR(50), -- 'blocks', 'enhances', 'supports'
  critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

#### Option C: Epic & Deal Links

```sql
ALTER TABLE "StrategicGoal" ADD COLUMN epic_id UUID REFERENCES "Task"(id);
CREATE TABLE goal_deals (
  id UUID PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES "StrategicGoal"(id),
  deal_id UUID NOT NULL REFERENCES "Deal"(id),
  created_at TIMESTAMP
);
```

## Current Pages Using Goal Linking

1. **[/strategy-archive](app/strategy-archive/page.tsx)** - Full CRUD with parent selection
2. **[/strategy](app/strategy/page.tsx)** - Tree visualization
3. **[/strategy2](app/strategy2/page.tsx)** - Alternate hierarchy view
4. **[/goals-tree](app/goals-tree/page.tsx)** - Collapsible tree with drill-down

## Summary

**Current State**: Parent-child hierarchy + Task linking ✅
**Gap**: No horizontal (peer) goal linking, no dependencies, limited cross-domain linking

**What would you like to enhance?**
