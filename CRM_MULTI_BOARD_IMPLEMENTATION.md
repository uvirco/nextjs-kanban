# CRM Multi-Board Support

## Overview

The CRM system now supports multiple pipelines/boards, allowing you to manage different deal workflows simultaneously (e.g., Sales Pipeline, Partnership Pipeline, Recruiting Pipeline).

## Architecture

### Database Schema

#### CRMBoard Table

```sql
CREATE TABLE "CRMBoard" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'deals',
  "description" TEXT,
  "backgroundUrl" TEXT,
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT REFERENCES "User"("id")
);
```

#### CRMDeal Table (Updated)

- Added `boardId` column referencing `CRMBoard.id`
- All deals must be associated with a board
- Existing deals are automatically assigned to the default board during migration

#### CRMDealColumn Table (Updated)

- Added `boardId` column referencing `CRMBoard.id`
- Columns are now board-specific
- Each board can have its own set of columns/stages

### API Endpoints

#### Boards Management

**GET /api/crm/boards**

- Fetch all boards
- Query params: `type` (optional, default: "deals")
- Returns boards sorted by isDefault (desc), then title (asc)

**POST /api/crm/boards**

- Create a new board
- Body: `{ title, description?, type?, backgroundUrl?, isDefault? }`
- Automatically unsets other defaults if isDefault=true

**GET /api/crm/boards/[id]**

- Fetch a single board by ID

**PUT /api/crm/boards/[id]**

- Update a board
- Body: `{ title?, description?, backgroundUrl?, isDefault? }`
- Automatically unsets other defaults if isDefault=true

**DELETE /api/crm/boards/[id]**

- Delete a board
- Validation:
  - Cannot delete default board
  - Cannot delete boards with existing deals
  - Must move or delete deals first

#### Deals & Columns (Updated)

**GET /api/crm/deals**

- Query param: `boardId` (optional)
- Filters deals by board when provided
- Returns all deals if boardId is omitted

**GET /api/crm/deal-columns**

- Query param: `boardId` (default: "default-sales-pipeline")
- Returns columns for the specified board

**POST /api/crm/deals**

- Body now includes: `{ ...dealData, boardId }`
- Automatically assigns deal to the specified board

## UI Components

### Deals Page

- **Board Selector**: Dropdown to switch between boards (shown when multiple boards exist)
- Automatically loads the default board on page load
- Fetches deals and columns specific to the selected board

### Deal Form Modal

- Automatically includes `boardId` when creating/editing deals
- BoardId is inherited from the currently selected board

## Migration Guide

### Running the Migration

1. Execute the SQL migration file:

```bash
# In Supabase SQL Editor
supabase-add-crm-boards-multi-pipeline.sql
```

This migration will:

- Create the `CRMBoard` table
- Add `boardId` column to `CRMDeal`
- Add `boardId` column to `CRMDealColumn`
- Create a default board: "Sales Pipeline"
- Migrate all existing deals to the default board
- Migrate all existing columns to the default board
- Create necessary indexes

### Creating Additional Boards

Use the API or database directly:

```javascript
// Create a new board via API
await fetch("/api/crm/boards", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Partnership Pipeline",
    description: "Track partnership opportunities",
    type: "deals",
    isDefault: false,
  }),
});
```

### Creating Columns for New Boards

After creating a board, add columns:

```sql
INSERT INTO "CRMDealColumn" ("id", "title", "stage", "color", "order", "boardId")
VALUES
  (gen_random_uuid()::text, 'Initial Contact', 'PROSPECTING', 'bg-blue-500', 0, '<board-id>'),
  (gen_random_uuid()::text, 'Qualification', 'QUALIFICATION', 'bg-yellow-500', 1, '<board-id>'),
  (gen_random_uuid()::text, 'Proposal', 'PROPOSAL', 'bg-orange-500', 2, '<board-id>'),
  (gen_random_uuid()::text, 'Negotiation', 'NEGOTIATION', 'bg-purple-500', 3, '<board-id>'),
  (gen_random_uuid()::text, 'Closed Won', 'CLOSED_WON', 'bg-green-500', 4, '<board-id>'),
  (gen_random_uuid()::text, 'Closed Lost', 'CLOSED_LOST', 'bg-red-500', 5, '<board-id>');
```

## Usage Examples

### Switching Between Boards

Users can switch boards using the dropdown selector in the UI. The page will:

1. Update the selected board ID
2. Fetch columns for the new board
3. Fetch deals for the new board
4. Re-render the pipeline view

### Creating Deals

When creating a deal, it's automatically assigned to the currently selected board:

```javascript
// In DealFormModal
const payload = {
  ...formData,
  boardId: selectedBoardId, // Automatically included
  value: formData.value ? parseFloat(formData.value) : null,
  contactId: formData.contactId || null,
};
```

### Board Management Best Practices

1. **Always have a default board**: Set one board as default for new users
2. **Delete protection**: Cannot delete boards with existing deals
3. **Column consistency**: Each board should have a complete set of columns/stages
4. **Naming convention**: Use clear, descriptive board names (e.g., "Enterprise Sales", "SMB Sales")

## Future Enhancements

Potential future features:

- Board templates (pre-configured column sets)
- Board sharing/permissions
- Board-specific analytics
- Deal transfer between boards
- Board archiving (soft delete)
- Column templates per board type
- Visual board customization (colors, backgrounds)

## TypeScript Types

```typescript
export interface CRMBoard {
  id: string;
  title: string;
  type: "leads" | "deals";
  description?: string;
  backgroundUrl?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId?: string;
}

export interface CRMDeal {
  // ... existing fields
  boardId?: string; // NEW FIELD
}
```

## Notes

- Backward compatibility maintained: APIs work without boardId parameter
- Default board ID: `default-sales-pipeline`
- Board type currently supports: `deals` (can be extended for `leads` in future)
- Board selector only shows when 2+ boards exist (clean UI for single-board setups)
