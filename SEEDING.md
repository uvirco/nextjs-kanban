# Database Seeding

This project includes a comprehensive seeding system that populates the database with default data for new installations.

## What Gets Seeded

### 👤 Default Users
- **Admin User**
  - **Email:** `admin@company.com`
  - **Password:** `admin123`
  - **Role:** ADMIN

- **Managers**
  - **Pierre:** `pierre@uvirco.com` / `pierre`
  - **Jaco:** `jaco@uvirco.com` / `jaco12`
  - **LeonS:** `leons@uvirco.com` / `leons12`

- **Team Members**
  - **Michale:** `michael@uvirco.com` / `michael`
  - **Ters:** `ters@uvirco.com` / `ters12`
  - **Ockert:** `ockert@uvirco.com` / `ockert`
  - **Mathew:** `mathew@uvirco.com` / `mathew`
  - **Leon:** `leon@uvirco.com` / `leons12`
  - **Ian:** `ian@uvirco.com` / `ian123`
  - **Marcel:** `marcel@uvirco.com` / `marcel`
  - **Tshepho:** `tshepho@uvirco.com` / `tshepho`
  - **Nkele:** `nkele@uvirco.com` / `nkele12`
  - **Madeleine:** `madeleine@uvirco.com` / `madeleine`
  - **Tiffany:** `tiffany@uvirco.com` / `tiffany`
  - **Rika:** `rika@uvirco.com` / `rika12`
  - **Ans:** `ans@uvirco.com` / `ans123`
  - **Kimon:** `kimon@uvirco.com` / `kimon12`

### 📋 Sample Board
- **Title:** "Sample Project Board"
- **Columns:** To Do, In Progress, Review, Done
- **Labels:** Bug (red), Feature (blue), Enhancement (green), Documentation (yellow), High Priority (orange)

### ✅ Sample Tasks
- "Welcome to TaskManager!" - Introduction task
- "Create your first board" - Getting started guide
- "Invite team members" - Collaboration guide

### ⚙️ Board Settings
- Default project management settings
- All advanced features disabled by default

## Running the Seed

```bash
# Run the seeding system
npm run db:seed

# Or directly with Prisma
npx prisma db seed
```

## Seed Script Location

- **File:** `prisma/seed.ts`
- **Configuration:** `package.json` (prisma.seed)
- **Command:** `npm run db:seed`

## What Happens During Seeding

1. ✅ Creates/updates admin user
2. ✅ Creates sample board with columns
3. ✅ Adds board member relationship
4. ✅ Creates default labels
5. ✅ Adds sample tasks
6. ✅ Configures board settings

## Safety Features

- **Idempotent:** Can be run multiple times safely
- **Upsert Logic:** Updates existing data instead of duplicating
- **No Data Loss:** Preserves existing user data
- **Error Handling:** Comprehensive error reporting

## After Seeding

Once seeded, you can:

1. **Login** with admin credentials
2. **Explore** the sample board and tasks
3. **Customize** settings and create new content
4. **Invite** additional users through the admin panel

## Manual Seeding Scripts

Individual seeding scripts are also available:

```bash
# Create admin user only
node scripts/create-admin-user.js

# Create test user
node scripts/create-test-user.js
```</content>
<parameter name="filePath">c:\swdev\next\nextjs-kanban/SEEDING.md