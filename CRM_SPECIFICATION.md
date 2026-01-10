# CRM Integration Specification for Next.js Kanban App

## Overview

- **Purpose**: Add CRM (Customer Relationship Management) capabilities for tracking customer interactions, leads, and sales pipelines alongside existing Kanban boards for project management.
- **Integration**: CRM will be a separate section (`/crm`) in the app, with its own boards (e.g., for lead pipelines). Shared elements like user authentication and database connections will be reused.
- **Scope**: Basic CRUD for contacts, leads, and deals. Boards will use a similar layout to Kanban (columns for stages like "Prospect", "Qualified", "Closed").
- **Assumptions**: CRM data is user-specific; no cross-app integrations initially. Start with 3-5 core entities to test feasibility.
- **Tech Stack**: Next.js (pages/routes), Supabase (database), Tailwind (styling), existing UI components.

## Key Features

1. **Contacts Management**:

   - Create, edit, delete contacts (name, email, phone, company, notes).
   - Search/filter contacts.
   - Link contacts to leads/deals.

2. **Leads Management**:

   - Convert contacts to leads with status (e.g., New, Contacted, Qualified).
   - Assign owners, set priorities, add notes/activities.
   - Track lead sources (e.g., website, referral).

3. **Deals/Pipeline**:

   - Create deals from leads (value, stage, close date).
   - Visualize in board view: Columns for stages (e.g., Prospecting, Proposal, Negotiation, Closed Won/Lost).
   - Basic analytics: Total value, conversion rates.

4. **CRM Boards**:

   - Dedicated boards for leads/deals (similar to Kanban boards but with CRM-specific columns/cards).
   - Drag-and-drop for stage changes.
   - Filters by owner, status, date.

5. **Shared Features**:
   - Notifications (reuse existing system for blockers/tasks).
   - Time tracking (optional, reuse from epics).
   - Export data (CSV for contacts/leads).

## Database Schema Additions (Supabase)

Add new tables to the existing schema. Use migrations for changes.

### Tables

**crm_contacts**:

- id (UUID, PK)
- user_id (FK to users)
- name (text)
- email (text, unique)
- phone (text)
- company (text)
- notes (text)
- created_at (timestamp)

**crm_leads**:

- id (UUID, PK)
- contact_id (FK to crm_contacts)
- user_id (FK to users)
- status (enum: NEW, CONTACTED, QUALIFIED, LOST)
- priority (enum: LOW, MEDIUM, HIGH)
- source (text)
- notes (text)
- assigned_to (FK to users)
- created_at (timestamp)

**crm_deals**:

- id (UUID, PK)
- lead_id (FK to crm_leads)
- user_id (FK to users)
- value (decimal)
- stage (enum: PROSPECTING, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST)
- close_date (date)
- notes (text)
- created_at (timestamp)

**crm_activities** (for notes/history):

- id (UUID, PK)
- entity_id (FK to leads/deals)
- entity_type (text: lead/deal)
- user_id (FK to users)
- activity_type (text: note, call, email)
- description (text)
- created_at (timestamp)

**crm_emails** (for email integration):

- id (UUID, PK)
- user_id (FK to users)
- deal_id (FK to crm_deals, nullable)
- lead_id (FK to crm_leads, nullable)
- contact_id (FK to crm_contacts, nullable)
- subject (text)
- body (text)
- from_email (text)
- to_email (text)
- cc_emails (text[])
- sent_at (timestamp)
- received_at (timestamp)
- direction (enum: INBOUND, OUTBOUND)
- email_provider_id (text) - for syncing with Gmail/Outlook
- thread_id (text) - to group email conversations
- created_at (timestamp)

**crm_email_attachments**:

- id (UUID, PK)
- email_id (FK to crm_emails)
- filename (text)
- file_url (text)
- file_size (integer)
- mime_type (text)
- created_at (timestamp)

## UI/UX Structure

- **Navigation**: Add "CRM" tab to the main nav (reuse existing nav component).
- **Pages/Routes**:
  - `/crm/contacts`: List view with search/filter.
  - `/crm/leads`: Board view for leads.
  - `/crm/deals`: Board view for deals.
  - `/crm/contacts/[id]`: Detail page for a contact (with linked leads/deals).
- **Components**: Reuse `Board.tsx`, `TaskCard.tsx` (rename/adapt to `CRMCard.tsx` for leads/deals). Add new forms like `CreateContactForm.tsx`.
- **Styling**: Dark theme consistent with Kanban (zinc colors).

## Implementation Plan

### Phase 1 (Setup)

- Add database tables via Supabase migration
- Create basic types in `types/crm.ts`
- Files: `db/migrations/20260108_add_crm_tables.sql`, `types/crm.ts`

### Phase 2 (Core CRUD)

- Implement server actions in `server-actions/CRMServerActions.ts` for contacts/leads/deals
- Add API routes in `app/api/crm/` (contacts, leads, deals)
- Files: `server-actions/CRMServerActions.ts`, `app/api/crm/*/route.ts`

### Phase 3 (Boards)

- Build CRM board pages, adapting existing board logic
- Create pages: `/crm/contacts`, `/crm/leads`, `/crm/deals`, `/crm/contacts/[id]`
- Reuse/adapt components: Board layout, Card components
- Files: `app/(default-layout)/crm/**/*.tsx`

### Phase 4 (Polish)

- Add filters, notifications, and basic tests
- Integrate with activity logging
- Update navigation (add CRM link to navbar)
- Run tests: Ensure Kanban boards still work

### Phase 5 (Email Integration) - Future

- Implement email sync with Gmail/Outlook
- Display emails linked to contacts, leads, and deals
- Email threading and conversation view
- Send emails directly from CRM
- Email templates for common scenarios
- Track email opens and clicks
- Files: `app/api/crm/emails/**`, `lib/email-provider.ts`

## Implementation Status

### ✅ Completed

- Database schema (`db/migrations/20260108_add_crm_tables.sql`)
- TypeScript types (`types/crm.ts`)
- Server actions (`server-actions/CRMServerActions.ts`)
- API routes:
  - `/api/crm/contacts`
  - `/api/crm/leads`
  - `/api/crm/deals`
- UI pages:
  - `/crm/contacts` (list view)
  - `/crm/contacts/[id]` (detail view)
  - `/crm/leads` (board view)
  - `/crm/deals` (board view)
- Navigation (CRM link in navbar)

### 🚧 Pending

- Create/edit forms for contacts, leads, deals
- Drag-and-drop for leads/deals boards
- Contact detail page enhancements (related leads/deals)
- Export functionality
- Analytics dashboard
- Activity logging for CRM actions
- Tests

### 📅 Future (Phase 5)

- Email integration (tables already prepared)
- Email sync with Gmail/Outlook
- Email threading and conversation view
- Send emails from CRM
- Email templates

## Estimated Effort

- **Time**: 2-4 weeks for MVP (1 developer), depending on reuse
- **Complexity**: Low-medium; high reuse potential. Monitor for code duplication.

## Risks & Considerations

- If CRM grows (e.g., >50% new code), consider feature flags or a separate module
- Ensure proper separation between CRM and Kanban data
- Monitor database performance with additional tables
- Consider rate limiting for API endpoints

## Next Steps

1. Review and test existing implementation
2. Add create/edit forms
3. Implement drag-and-drop functionality
4. Enhance contact detail page with related entities
5. Add activity logging
6. Write tests
7. Deploy and gather feedback

## Technical Notes

- Reuse authentication from existing app (NextAuth)
- Use Supabase Row Level Security (RLS) for data isolation
- Follow existing patterns for server actions and API routes
- Maintain consistent dark theme (zinc colors)
- Use existing UI components where possible
