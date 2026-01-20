# CRM Deal Stage History Tracking

## Overview

The system now automatically tracks when deals move between stages in the pipeline, recording:

- Previous stage
- New stage
- Timestamp of change
- User who made the change

## Database Setup

### 1. Run the SQL Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- File: supabase-add-deal-stage-history.sql
```

This creates:

- `CRMDealStageHistory` table with proper indexes
- Foreign key relationships to CRMDeal and User tables
- Automatic CASCADE delete when deals are removed

## How It Works

### Automatic Tracking

When a deal card is dragged and dropped to a new column:

1. **Frontend** (`deals/page.tsx`):

   - User drags deal to new stage
   - `handleDrop` function calls PUT API with new stage

2. **Backend** (`api/crm/deals/[id]/route.ts`):
   - Fetches current deal stage
   - Updates deal with new stage
   - **Logs change** to `CRMDealStageHistory` table with:
     - `dealId`: The deal that changed
     - `fromStage`: Previous stage
     - `toStage`: New stage
     - `changedAt`: Current timestamp
     - `changedByUserId`: Authenticated user ID

### Viewing History

The deal detail page (`/crm/deals/[id]`) shows a Timeline tab with:

- Visual timeline with dots and connecting line
- Each stage change showing:
  - From stage → To stage (with badges)
  - Date and time of change
  - User who made the change
- Chronological order (newest first)

## API Endpoints

### Get Stage History

```
GET /api/crm/deals/[id]/history
```

Returns array of stage changes for a deal.

## Benefits

1. **Accountability**: Know who moved deals and when
2. **Analytics**: Calculate average time in each stage
3. **Audit Trail**: Complete history of deal progression
4. **Sales Insights**: Identify bottlenecks in your pipeline

## Future Enhancements

Possible additions:

- Add notes when moving deals (e.g., "Customer requested more info")
- Calculate time spent in each stage
- Pipeline velocity metrics
- Stage conversion rates
- Automatic notifications on stage changes
