-- Migration: Add EpicRoleCategory table for role categories
-- Created: 2025-12-02
-- Description: Create a table for role categories to make them manageable

-- Create EpicRoleCategory table
CREATE TABLE "EpicRoleCategory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE, -- e.g., "management", "technical"
  "label" TEXT NOT NULL, -- e.g., "Management", "Technical"
  "color" TEXT NOT NULL, -- e.g., "bg-blue-500"
  "sortOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX "EpicRoleCategory_sortOrder_idx" ON "EpicRoleCategory"("sortOrder");
CREATE INDEX "EpicRoleCategory_isActive_idx" ON "EpicRoleCategory"("isActive");

-- Add comments for documentation
COMMENT ON TABLE "EpicRoleCategory" IS 'Categories for epic roles';
COMMENT ON COLUMN "EpicRoleCategory"."name" IS 'Internal name used in code (lowercase, no spaces)';
COMMENT ON COLUMN "EpicRoleCategory"."label" IS 'Display label shown to users';
COMMENT ON COLUMN "EpicRoleCategory"."color" IS 'Tailwind CSS color class for UI display';

-- Insert default categories
INSERT INTO "EpicRoleCategory" ("name", "label", "color", "sortOrder") VALUES
  ('management', 'Management', 'bg-blue-500', 1),
  ('technical', 'Technical', 'bg-green-500', 2),
  ('design', 'Design', 'bg-purple-500', 3),
  ('business', 'Business', 'bg-yellow-500', 4),
  ('operations', 'Operations', 'bg-orange-500', 5),
  ('administration', 'Administration', 'bg-pink-500', 6),
  ('finance', 'Finance', 'bg-indigo-500', 7),
  ('legal', 'Legal', 'bg-red-500', 8),
  ('marketing', 'Marketing', 'bg-teal-500', 9),
  ('sales', 'Sales', 'bg-cyan-500', 10),
  ('customer-service', 'Customer Service', 'bg-lime-500', 11),
  ('other', 'Other', 'bg-gray-500', 99)
ON CONFLICT ("name") DO NOTHING;

-- Update EpicRole table to reference categories (optional - for data integrity)
-- ALTER TABLE "EpicRole" ADD CONSTRAINT "EpicRole_category_fkey"
-- FOREIGN KEY ("category") REFERENCES "EpicRoleCategory"("name");