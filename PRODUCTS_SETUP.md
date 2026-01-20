# Products Management - Quick Setup

## What Was Added

A complete **Products Management** section for your CRM to manage product catalogs with:
- Product names and codes
- Categories and types
- Pricing and billing cycles
- Active/Inactive status
- Full CRUD operations (Create, Read, Update, Delete)

## Quick Start

### Step 1: Run Database Migration
Open Supabase SQL Editor and execute:
```sql
-- File: supabase-add-products-table.sql
CREATE TABLE IF NOT EXISTS "CRMProduct" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "productCode" TEXT NOT NULL UNIQUE,
  "active" BOOLEAN DEFAULT true,
  "category" TEXT,
  "description" TEXT,
  "unitPrice" NUMERIC(12, 2),
  "billingCycle" TEXT,
  "productType" TEXT,
  "currency" TEXT DEFAULT 'EUR',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "CRMProduct_active_idx" ON "CRMProduct"("active");
CREATE INDEX IF NOT EXISTS "CRMProduct_category_idx" ON "CRMProduct"("category");
CREATE INDEX IF NOT EXISTS "CRMProduct_productCode_idx" ON "CRMProduct"("productCode");
CREATE INDEX IF NOT EXISTS "CRMProduct_name_idx" ON "CRMProduct"("name");

-- Sample data
INSERT INTO "CRMProduct" ("name", "productCode", "active", "category", "unitPrice", "billingCycle", "productType", "currency")
VALUES 
  ('CoroCAM 6D - Discontinued', 'C6000', true, 'Camera Handheld', 34000, '', 'CC6', 'EUR'),
  ('CoroCAM 7HD', 'C7000', true, 'Camera Handheld', 46000, '', 'CC7', 'EUR'),
  ('Corocam 7 Core', 'C7000Core', true, 'Core', 43000, '', 'CC7', 'EUR'),
  ('Corocam 8', 'C8000', true, 'Camera Handheld', 64200, '', 'CC8', 'EUR'),
  ('CoroCAM 6HD', 'C6000HD', true, 'Camera Handheld', 41000, '', 'CC6', 'EUR')
ON CONFLICT ("productCode") DO NOTHING;
```

### Step 2: Build & Start
```bash
npm run build
npm run dev
```

### Step 3: Access Products
Navigate to: **CRM → Products** (new menu item)

## Features

### Products List (`/crm/products`)
- **Table View**: See all products in a table with columns for name, code, category, price, billing cycle, type, and status
- **Card View**: Alternative grid layout for browsing
- **Search**: Find products by name, code, or category
- **Filter**: Show All, Active, or Inactive products
- **Actions**: Edit or delete any product

### Add Product (`/crm/products/new`)
Form fields:
- Product Name (required)
- Product Code (required, unique)
- Category
- Product Type
- Description (textarea)
- Unit Price
- Currency
- Billing Cycle
- Active toggle

### Edit Product (`/crm/products/[id]`)
- Pre-filled form with current product data
- Modify any field and save
- Auto-updates timestamps

## File Locations

**Frontend Pages:**
- `app/(crm-layout)/crm/products/page.tsx` - List view
- `app/(crm-layout)/crm/products/new/page.tsx` - Create form
- `app/(crm-layout)/crm/products/[id]/page.tsx` - Edit form

**API Routes:**
- `app/api/crm/products/route.ts` - GET all, POST create
- `app/api/crm/products/[id]/route.ts` - GET, PUT, DELETE single

**Type Definitions:**
- `types/crm.ts` - Added `CRMProduct` interface

**Navigation:**
- `ui/CRM/CRMLayout.tsx` - Updated with Products link

## Database

**Table:** `CRMProduct`
**Columns:**
- id (TEXT, Primary Key)
- name (TEXT, Required)
- productCode (TEXT, Required, Unique)
- active (BOOLEAN)
- category (TEXT)
- description (TEXT)
- unitPrice (NUMERIC)
- billingCycle (TEXT)
- productType (TEXT)
- currency (TEXT, Default: EUR)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- createdByUserId (TEXT, FK)

## API Endpoints

```
GET    /api/crm/products           - Get all products
POST   /api/crm/products           - Create product
GET    /api/crm/products/[id]      - Get single product
PUT    /api/crm/products/[id]      - Update product
DELETE /api/crm/products/[id]      - Delete product
```

## Navigation Integration

Products is now in the CRM main navigation:
- Dashboard
- Contacts
- Organizations
- **Products** ← NEW
- Email Inbox
- Pipeline

## Next Steps (Optional)

1. **Link Products to Deals**
   - Add `productIds` array to CRMDeal
   - Show products on deal detail page

2. **Product Categories as Dropdown**
   - Create `ProductCategory` table
   - Update form to use select instead of text input

3. **Bulk Import**
   - CSV upload for products
   - Batch create from spreadsheet

4. **Pricing Tiers**
   - Add pricing history
   - Volume-based pricing
   - Discount rules

5. **Inventory Tracking**
   - Add quantity in stock
   - Track stock movements
   - Low stock alerts

## Troubleshooting

**"CRMProduct table not found" error**
- Run the SQL migration in Supabase
- Verify table exists with: `SELECT COUNT(*) FROM "CRMProduct";`

**API returning 401 Unauthorized**
- Ensure you're logged in to the CRM
- Check authentication is working

**Product Code must be unique error**
- Use a different product code
- Check if code already exists in another product

**Changes not appearing**
- Clear browser cache
- Run `npm run build` and restart dev server

## Documentation

See `PRODUCTS_FEATURE.md` for complete documentation including:
- Detailed feature list
- Schema specifications
- API route details
- Customization guide
- Performance tips
