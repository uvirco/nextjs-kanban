# Products Management Feature - Implementation Guide

## Overview
Added a complete Products management section to the CRM alongside Organizations. This allows you to manage product catalogs with pricing, categories, billing cycles, and more.

## Features Implemented

### 1. **Navigation Integration**
- Added "Products" link to CRM main navigation (between Organizations and Email Inbox)
- Uses IconPackage icon from Tabler icons
- Fully integrated into CRMLayout navigation system

### 2. **Products Page** (`/crm/products`)
- **Table View**: Display all products with columns:
  - Name
  - Product Code
  - Category
  - Unit Price (with currency)
  - Billing Cycle
  - Product Type
  - Status (Active/Inactive)
  - Actions (Edit/Delete)

- **Card View**: Alternative grid layout for product browsing
  - Shows product details in card format
  - Quick access to edit/delete actions

- **Search & Filter**
  - Search by name, product code, or category
  - Filter by status (All, Active, Inactive)

### 3. **Add Product Page** (`/crm/products/new`)
Form with fields:
- Product Name * (required)
- Product Code * (required)
- Category
- Product Type
- Description (text area)
- Unit Price
- Currency (default: EUR)
- Billing Cycle
- Active checkbox

### 4. **Edit Product Page** (`/crm/products/[id]`)
- Pre-populated form with product details
- Same fields as add product page
- Save or cancel options

## Database Schema

### CRMProduct Table
```sql
CREATE TABLE "CRMProduct" (
  id TEXT PRIMARY KEY
  name TEXT NOT NULL
  productCode TEXT NOT NULL UNIQUE
  active BOOLEAN DEFAULT true
  category TEXT
  description TEXT
  unitPrice NUMERIC(12, 2)
  billingCycle TEXT
  productType TEXT
  currency TEXT DEFAULT 'EUR'
  createdAt TIMESTAMP
  updatedAt TIMESTAMP
  createdByUserId TEXT (FK to User)
)
```

**Indexes Created:**
- active
- category
- productCode
- name

## API Routes

### GET `/api/crm/products`
Fetch all products
- Returns: `{ products: CRMProduct[] }`

### POST `/api/crm/products`
Create new product
- Body: Product data
- Returns: Created product object

### GET `/api/crm/products/[id]`
Fetch single product
- Returns: Product object

### PUT `/api/crm/products/[id]`
Update product
- Body: Updated product data
- Returns: Updated product object

### DELETE `/api/crm/products/[id]`
Delete product
- Returns: `{ success: true }`

## Sample Data
The SQL migration includes 5 sample products:
1. CoroCAM 6D - Discontinued (C6000) - 34,000 EUR
2. CoroCAM 7HD (C7000) - 46,000 EUR
3. Corocam 7 Core (C7000Core) - 43,000 EUR
4. Corocam 8 (C8000) - 64,200 EUR
5. CoroCAM 6HD (C6000HD) - 41,000 EUR

## Installation Steps

### 1. Create the Database Table
Run the SQL migration in Supabase SQL Editor:
```bash
# File: supabase-add-products-table.sql
```

### 2. Build & Test
```bash
npm run build
npm run dev
```

### 3. Access the Feature
Navigate to: `/crm/products`

## File Structure
```
app/
  (crm-layout)/crm/
    products/
      page.tsx                 # Main products list
      new/
        page.tsx              # Add new product form
      [id]/
        page.tsx              # Edit product form
  api/crm/
    products/
      route.ts                # GET all, POST create
      [id]/
        route.ts              # GET, PUT, DELETE single

types/
  crm.ts                       # Added CRMProduct interface

ui/CRM/
  CRMLayout.tsx               # Updated with Products nav

supabase-add-products-table.sql  # Database migration
```

## Usage Examples

### Access Products List
```
Navigate to: /crm → Products
```

### Add New Product
```
1. Click "Add Product" button
2. Fill in product details
3. Click "Create Product"
```

### Edit Product
```
1. Click Edit button (pencil icon) on product
2. Modify details
3. Click "Save Changes"
```

### Delete Product
```
1. Click Delete button (trash icon) on product
2. Confirm deletion
3. Product removed from list
```

## Customization Options

### Add More Fields
1. Update `CRMProduct` interface in `types/crm.ts`
2. Update API route handlers
3. Add form fields to new/edit pages

### Change Product Code to Optional
Edit API route: `app/api/crm/products/route.ts`
Remove `productCode` from required check

### Add Product Categories Enum
```typescript
export enum ProductCategory {
  CAMERA_HANDHELD = "Camera Handheld",
  CORE = "Core",
  // Add more...
}
```

### Add Sorting Options
Update products page to include:
- Sort by name (A-Z)
- Sort by price (low-high)
- Sort by date (newest first)

## Performance Considerations

- **Indexes**: Included on frequently queried columns (name, category, productCode, active)
- **Pagination**: Can be added to products list for large datasets
- **Caching**: Consider implementing React Query for API caching

## Security

- All endpoints require authentication (`auth()` check)
- User ID tracked for audit purposes
- DELETE operations require confirmation
- Product Code is unique constraint

## Next Steps

1. ✅ Create database table (using SQL migration)
2. ✅ Add Products navigation
3. ✅ Create products listing page
4. ✅ Create add/edit forms
5. ✅ Implement API routes
6. Optional: Add product categories as separate entity
7. Optional: Add product variants/SKUs
8. Optional: Link products to deals/opportunities
9. Optional: Add product inventory tracking
10. Optional: Add product images

## Troubleshooting

### Products table not found
- Ensure SQL migration was run in Supabase
- Check table exists: `SELECT * FROM "CRMProduct" LIMIT 1;`

### API returning 401 Unauthorized
- Check session/authentication is working
- Verify user is logged in

### Product Code duplicate error
- Product codes must be unique
- Use different code for new product

## Support
For questions or issues, refer to the CRM documentation or check:
- API response status codes
- Browser console for client-side errors
- Server logs for backend errors
