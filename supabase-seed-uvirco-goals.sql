-- Seed UViRCO's Strategic Objectives and Goals
-- This file contains all 7 objectives with their 3 sub-goals each (21 goals total)

-- Objective 1: Financial Growth, Profitability, and Long-Term Value Creation
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
VALUES (
  'Objective 1: Financial Growth, Profitability, and Long-Term Value Creation',
  'Drive sustainable financial growth and profitability through disciplined commercial strategies, effective capital management, and strong financial governance.',
  'active',
  0,
  '2026',
  '2026-12-31',
  NULL
) RETURNING id AS obj1_id;

-- Objective 2: New Product and Service Development
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
VALUES (
  'Objective 2: New Product and Service Development',
  'Develop and launch innovative new products and services aligned with market opportunities and customer needs through collaborative partnerships.',
  'active',
  0,
  '2026',
  '2026-12-31',
  NULL
) RETURNING id AS obj2_id;

-- Objective 3: Support and Enhance Existing Products and Services
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
VALUES (
  'Objective 3: Support and Enhance Existing Products and Services',
  'Maximize the performance, reliability, and lifecycle value of existing products and services through continuous improvement and strategic partnerships.',
  'active',
  0,
  '2026',
  '2026-12-31',
  NULL
) RETURNING id AS obj3_id;

-- Objective 4: Marketing, Sales, Business Development and Communications
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
VALUES (
  'Objective 4: Marketing, Sales, Business Development and Communications',
  'Strengthen brand presence, expand market reach, and build high-performing sales channels to drive sustainable growth across new and existing markets.',
  'active',
  0,
  '2026',
  '2026-12-31',
  NULL
) RETURNING id AS obj4_id;

-- Objective 5: Build a High-Performance Team
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
VALUES (
  'Objective 5: Build a High-Performance Team',
  'Create an engaged, capable, and values-driven workforce through effective HR management, skill development, and a high-performance culture.',
  'active',
  0,
  '2026',
  '2026-12-31',
  NULL
) RETURNING id AS obj5_id;

-- Objective 6: Regulatory Compliance, Policy Management and Governance Excellence
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
VALUES (
  'Objective 6: Regulatory Compliance, Policy Management and Governance Excellence',
  'Ensure regulatory compliance, establish robust policies, and deliver governance excellence to support business integrity and stakeholder confidence.',
  'active',
  0,
  '2026',
  '2026-12-31',
  NULL
) RETURNING id AS obj6_id;

-- Objective 7: Operations and Production Excellence
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
VALUES (
  'Objective 7: Operations and Production Excellence',
  'Optimize production, procurement, and operations to maximize efficiency and reliability while maintaining the highest quality and service standards.',
  'active',
  0,
  '2026',
  '2026-12-31',
  NULL
) RETURNING id AS obj7_id;

-- ============================================
-- OBJECTIVE 1 GOALS
-- ============================================

-- 1.1: Revenue Growth and Cost Optimisation
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 1.1: Revenue Growth and Cost Optimisation',
  'Focus on increasing revenue streams and improving cost efficiency through disciplined commercial strategies and operational cost control.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 1: Financial Growth, Profitability, and Long-Term Value Creation'
LIMIT 1;

-- 1.2: Investment and Capital Management
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 1.2: Investment and Capital Management',
  'Manage the allocation of retained earnings, support the funding of strategic initiatives, and ensure governance and accountability in investment decisions.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 1: Financial Growth, Profitability, and Long-Term Value Creation'
LIMIT 1;

-- 1.3: Financial Controls and Reporting
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 1.3: Financial Controls and Reporting',
  'Strengthen financial governance through effective budgeting, forecasting, cash flow and foreign exchange management, precise transaction processing, and timely, compliant financial reporting.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 1: Financial Growth, Profitability, and Long-Term Value Creation'
LIMIT 1;

-- ============================================
-- OBJECTIVE 2 GOALS
-- ============================================

-- 2.1: New Product Development
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 2.1: New Product Development',
  'Advance the design and delivery of new imaging products, including both hardware and software platforms, aligned to strategic technology opportunities and customer needs.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 2: New Product and Service Development'
LIMIT 1;

-- 2.2: New Service Development
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 2.2: New Service Development',
  'Expand service offerings such as training, analytics, engineering support, diagnostics, and consultancy to enhance customer value and differentiation.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 2: New Product and Service Development'
LIMIT 1;

-- 2.3: Establish and Manage Strategic Partnerships for New Product and Service Development
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 2.3: Establish and Manage Strategic Partnerships for New Product and Service Development',
  'Identify, build, and maintain strategic partnerships with research institutions, technology companies, distributors, and key customers to access complementary expertise, technologies, and market insights.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 2: New Product and Service Development'
LIMIT 1;

-- ============================================
-- OBJECTIVE 3 GOALS
-- ============================================

-- 3.1: Support and Enhance Existing Products
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 3.1: Support and Enhance Existing Products',
  'Provide comprehensive support, upgrades, and continuous improvements to maximise the performance, reliability, and lifecycle value of existing products, ensuring they continue to meet customer needs and industry standards.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 3: Support and Enhance Existing Products and Services'
LIMIT 1;

-- 3.2: Support and Enhance Existing Services
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 3.2: Support and Enhance Existing Services',
  'Maintain and improve existing value-added services through responsive support, timely updates, and ongoing refinement based on client feedback, ensuring continued differentiation and customer satisfaction.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 3: Support and Enhance Existing Products and Services'
LIMIT 1;

-- 3.3: Establish and Manage Strategic Partnerships to Support Existing Products and Services
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 3.3: Establish and Manage Strategic Partnerships to Support Existing Products and Services',
  'Identify, build, and manage partnerships with technology providers, service vendors, and key customers to strengthen the support, enhancement, and longevity of existing products and services.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 3: Support and Enhance Existing Products and Services'
LIMIT 1;

-- ============================================
-- OBJECTIVE 4 GOALS
-- ============================================

-- 4.1: Build, Strengthen, and Communicate the UViRCO Brand
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 4.1: Build, Strengthen, and Communicate the UViRCO Brand',
  'Develop strategies to enhance UViRCO''s brand identity, reputation, and recognition across target markets. Implement these strategies through consistent and impactful brand activities. Maintain brand consistency to reinforce UViRCO''s market presence.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 4: Marketing, Sales, Business Development and Communications'
LIMIT 1;

-- 4.2: Develop and Manage Sales Channels
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 4.2: Develop and Manage Sales Channels',
  'Pursue business development opportunities to unlock new markets, industry segments, and customer applications. Establish and manage a high-performing distributor network to achieve effective sales coverage and sustainable growth.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 4: Marketing, Sales, Business Development and Communications'
LIMIT 1;

-- 4.3: Expand Market Reach
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 4.3: Expand Market Reach',
  'Increase UViRCO''s market presence by introducing new products and services, unlocking opportunities in additional market segments, and entering new geographic regions to drive sustainable growth.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 4: Marketing, Sales, Business Development and Communications'
LIMIT 1;

-- ============================================
-- OBJECTIVE 5 GOALS
-- ============================================

-- 5.1: Operational HR Management
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 5.1: Operational HR Management',
  'Deliver efficient and effective day-to-day human resources services, including recruitment, onboarding, leave administration, performance management, and employee support and wellness programmes.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 5: Build a High-Performance Team'
LIMIT 1;

-- 5.2: Capability Development
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 5.2: Capability Development',
  'Enhance individual and team capabilities through targeted technical skills training, professional growth initiatives, mentoring, coaching, and leadership development programmes.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 5: Build a High-Performance Team'
LIMIT 1;

-- 5.3: High-Performance Culture Development
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 5.3: High-Performance Culture Development',
  'Cultivate a values-driven, engaged, and accountable workforce by embedding organisational knowledge, reinforcing behavioural standards, and fostering continuous improvement.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 5: Build a High-Performance Team'
LIMIT 1;

-- ============================================
-- OBJECTIVE 6 GOALS
-- ============================================

-- 6.1: Regulatory Compliance
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 6.1: Regulatory Compliance',
  'Ensure compliance with all relevant laws and regulations, including arms control, OHS, FICA, POPIA, CIPC, labour laws, and tax obligations. Proactively monitor changes and implement necessary updates.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 6: Regulatory Compliance, Policy Management and Governance Excellence'
LIMIT 1;

-- 6.2: Policy Management
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 6.2: Policy Management',
  'Develop, implement, and regularly review policies across key areas such as IT governance (including information security), human resources, investments, and dividend management. Ensure policies support compliance, integrity, and risk management.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 6: Regulatory Compliance, Policy Management and Governance Excellence'
LIMIT 1;

-- 6.3: Governance Excellence
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 6.3: Governance Excellence',
  'Support the Board and operational committees like IT Steering, Product Steering, and Health and Safety. Establish new governance bodies as needed. Provide accurate information for decision-making and maintain clear processes and accountability.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 6: Regulatory Compliance, Policy Management and Governance Excellence'
LIMIT 1;

-- ============================================
-- OBJECTIVE 7 GOALS
-- ============================================

-- 7.1: Effective and Efficient Production and Procurement
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 7.1: Effective and Efficient Production and Procurement',
  'Optimize production and procurement processes and systems to maximise throughput and supply chain reliability while minimising waste. Apply continuous improvement to sustain performance and resilience.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 7: Operations and Production Excellence'
LIMIT 1;

-- 7.2: Effective and Efficient Operations
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 7.2: Effective and Efficient Operations',
  'Manage logistics, workflows, systems, policies, and facilities including buildings, laboratories, and storage to ensure efficient, reliable, and cost-effective operations. Drive systems integration across IT and operational domains to protect and enhance operational integrity.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 7: Operations and Production Excellence'
LIMIT 1;

-- 7.3: Product Quality and Service Excellence
INSERT INTO public."StrategicGoal" (title, description, status, progress, fiscal_year, target_date, parent_goal_id)
SELECT
  'Goal 7.3: Product Quality and Service Excellence',
  'Maintain and enhance product quality and service standards by following frameworks such as ISO9001 and ITIL. Use robust IT systems and cybersecurity practices to ensure consistent delivery and compliance.',
  'active',
  0,
  '2026',
  '2026-12-31',
  id
FROM public."StrategicGoal"
WHERE title = 'Objective 7: Operations and Production Excellence'
LIMIT 1;
