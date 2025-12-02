-- Migration: Add EpicRole table for epic member roles
-- Created: 2025-12-02
-- Description: Replace hardcoded functional roles with a proper EpicRole table

-- Create EpicRole table
CREATE TABLE "EpicRole" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "category" TEXT DEFAULT 'functional', -- 'functional', 'technical', 'management', etc.
  "isActive" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX "EpicRole_category_idx" ON "EpicRole"("category");
CREATE INDEX "EpicRole_isActive_idx" ON "EpicRole"("isActive");
CREATE INDEX "EpicRole_sortOrder_idx" ON "EpicRole"("sortOrder");

-- Add comments for documentation
COMMENT ON TABLE "EpicRole" IS 'Available roles for epic team members';
COMMENT ON COLUMN "EpicRole"."category" IS 'Role category (functional, technical, management, etc.)';
COMMENT ON COLUMN "EpicRole"."isActive" IS 'Whether this role is currently available for selection';
COMMENT ON COLUMN "EpicRole"."sortOrder" IS 'Display order for roles in dropdowns';

-- Insert common functional roles
INSERT INTO "EpicRole" ("name", "description", "category", "sortOrder") VALUES
  ('Product Manager', 'Manages product strategy and roadmap', 'management', 1),
  ('Project Manager', 'Manages project execution and delivery', 'management', 2),
  ('Lead Developer', 'Senior developer leading technical implementation', 'technical', 3),
  ('Developer', 'Software developer implementing features', 'technical', 4),
  ('Designer', 'UI/UX designer creating user interfaces', 'design', 5),
  ('UX Designer', 'User experience designer focusing on usability', 'design', 6),
  ('QA Engineer', 'Quality assurance engineer testing software', 'technical', 7),
  ('DevOps Engineer', 'Manages deployment and infrastructure', 'technical', 8),
  ('Business Analyst', 'Analyzes business requirements and processes', 'business', 9),
  ('Technical Writer', 'Creates technical documentation', 'technical', 10),
  ('Scrum Master', 'Facilitates agile development processes', 'management', 11),
  ('Frontend Developer', 'Specializes in user interface development', 'technical', 12),
  ('Backend Developer', 'Specializes in server-side development', 'technical', 13),
  ('Full Stack Developer', 'Works on both frontend and backend development', 'technical', 14),
  ('Mobile Developer', 'Develops mobile applications', 'technical', 15),
  ('Data Analyst', 'Analyzes data to support business decisions', 'business', 16),
  ('Data Scientist', 'Applies statistical analysis to complex datasets', 'technical', 17),
  ('Security Engineer', 'Ensures system and data security', 'technical', 18),
  ('System Administrator', 'Manages IT infrastructure and systems', 'technical', 19),
  ('Database Administrator', 'Manages database systems and performance', 'technical', 20),
  ('UI Designer', 'Creates visual design for user interfaces', 'design', 21),
  ('Product Owner', 'Defines product requirements and priorities', 'management', 22),
  ('Release Manager', 'Manages software release processes', 'management', 23),
  ('Technical Lead', 'Leads technical architecture and decisions', 'technical', 24),
  ('Engineering Manager', 'Manages engineering teams and processes', 'management', 25),
  ('Solutions Architect', 'Designs technical solutions for business problems', 'technical', 26),
  ('Software Architect', 'Designs software system architecture', 'technical', 27),
  ('Test Automation Engineer', 'Develops automated testing frameworks', 'technical', 28),
  ('Performance Engineer', 'Optimizes system performance and scalability', 'technical', 29),
  ('Support Engineer', 'Provides technical support and troubleshooting', 'technical', 30),
  ('Documentation Specialist', 'Creates and maintains technical documentation', 'technical', 31),
  -- Manufacturing & Operations
  ('Manufacturing Manager', 'Oversees manufacturing operations and processes', 'operations', 32),
  ('Production Supervisor', 'Supervises production line operations', 'operations', 33),
  ('Quality Control Inspector', 'Inspects products for quality standards', 'operations', 34),
  ('Supply Chain Manager', 'Manages supply chain and logistics', 'operations', 35),
  ('Procurement Specialist', 'Handles purchasing and vendor relationships', 'operations', 36),
  ('Warehouse Manager', 'Manages warehouse operations and inventory', 'operations', 37),
  ('Operations Manager', 'Oversees operational efficiency and processes', 'operations', 38),
  ('Plant Manager', 'Manages manufacturing plant operations', 'operations', 39),
  ('Maintenance Technician', 'Performs equipment maintenance and repairs', 'operations', 40),
  ('Safety Officer', 'Ensures workplace safety and compliance', 'operations', 41),
  -- Administration & HR
  ('HR Manager', 'Manages human resources functions', 'administration', 42),
  ('Recruiter', 'Handles recruitment and hiring processes', 'administration', 43),
  ('Training Coordinator', 'Coordinates employee training programs', 'administration', 44),
  ('Executive Assistant', 'Provides administrative support to executives', 'administration', 45),
  ('Office Manager', 'Manages office operations and administration', 'administration', 46),
  ('Administrative Assistant', 'Provides general administrative support', 'administration', 47),
  ('Receptionist', 'Handles front desk and visitor coordination', 'administration', 48),
  -- Finance
  ('Finance Manager', 'Manages financial operations and reporting', 'finance', 49),
  ('Accountant', 'Handles accounting and financial records', 'finance', 50),
  ('Financial Analyst', 'Analyzes financial data and trends', 'finance', 51),
  ('Controller', 'Oversees accounting operations and controls', 'finance', 52),
  -- Legal & Compliance
  ('Legal Counsel', 'Provides legal advice and representation', 'legal', 53),
  ('Compliance Officer', 'Ensures regulatory compliance', 'legal', 54),
  ('Risk Manager', 'Manages organizational risk assessment', 'legal', 55),
  -- Marketing & Sales
  ('Marketing Manager', 'Manages marketing strategies and campaigns', 'marketing', 56),
  ('Sales Manager', 'Manages sales team and revenue targets', 'sales', 57),
  ('Customer Service Manager', 'Manages customer service operations', 'customer-service', 58),
  ('Marketing Specialist', 'Executes marketing campaigns and content', 'marketing', 59),
  -- Additional IT & Facilities
  ('IT Manager', 'Manages information technology operations', 'technical', 60),
  ('Facilities Manager', 'Manages building and facilities operations', 'operations', 61),
  ('Help Desk Technician', 'Provides technical support to users', 'technical', 62),
  ('Other', 'Other role not listed above', 'other', 99)
ON CONFLICT ("name") DO NOTHING;

-- Update EpicMember table to reference EpicRole table (optional - for future enhancement)
-- This would require a migration to change the role column from TEXT to foreign key
-- ALTER TABLE "EpicMember" ADD COLUMN "roleId" TEXT REFERENCES "EpicRole"("id");
-- Then migrate existing data and drop old column