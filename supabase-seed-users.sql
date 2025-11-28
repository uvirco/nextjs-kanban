-- Supabase User Seeding Script
-- Run this in Supabase SQL Editor to create users and sample data

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert admin user
INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-user-id',
  'Admin User',
  'admin@company.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', -- hashed 'admin123'
  'ADMIN',
  true,
  NOW(),
  NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Insert test users
INSERT INTO "User" ("id", "name", "email", "password", "role", "isActive", "createdAt", "updatedAt") VALUES
('pierre-user-id', 'Pierre', 'pierre@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MANAGER', true, NOW(), NOW()),
('jaco-user-id', 'Jaco', 'jaco@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MANAGER', true, NOW(), NOW()),
('michael-user-id', 'Michale', 'michael@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('ters-user-id', 'Ters', 'ters@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('ockert-user-id', 'Ockert', 'ockert@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('mathew-user-id', 'Mathew', 'mathew@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('leons-user-id', 'LeonS', 'leons@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MANAGER', true, NOW(), NOW()),
('leon-user-id', 'Leon', 'leon@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('ian-user-id', 'Ian', 'ian@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('marcel-user-id', 'Marcel', 'marcel@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('tshepho-user-id', 'Tshepho', 'tshepho@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('nkele-user-id', 'Nkele', 'nkele@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('madeleine-user-id', 'Madeleine', 'madeleine@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('tiffany-user-id', 'Tiffany', 'tiffany@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('rika-user-id', 'Rika', 'rika@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('ans-user-id', 'Ans', 'ans@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW()),
('kimon-user-id', 'Kimon', 'kimon@uvirco.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2nO', 'MEMBER', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Create sample board
INSERT INTO "Board" ("id", "title", "createdAt", "updatedAt")
VALUES ('sample-board-1', 'Sample Project Board', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Add users as board members
INSERT INTO "BoardMember" ("userId", "boardId", "role", "createdAt") VALUES
('admin-user-id', 'sample-board-1', 'owner', NOW()),
('pierre-user-id', 'sample-board-1', 'owner', NOW()),
('jaco-user-id', 'sample-board-1', 'owner', NOW()),
('michael-user-id', 'sample-board-1', 'member', NOW()),
('ters-user-id', 'sample-board-1', 'member', NOW()),
('ockert-user-id', 'sample-board-1', 'member', NOW()),
('mathew-user-id', 'sample-board-1', 'member', NOW()),
('leons-user-id', 'sample-board-1', 'owner', NOW()),
('leon-user-id', 'sample-board-1', 'member', NOW()),
('ian-user-id', 'sample-board-1', 'member', NOW()),
('marcel-user-id', 'sample-board-1', 'member', NOW()),
('tshepho-user-id', 'sample-board-1', 'member', NOW()),
('nkele-user-id', 'sample-board-1', 'member', NOW()),
('madeleine-user-id', 'sample-board-1', 'member', NOW()),
('tiffany-user-id', 'sample-board-1', 'member', NOW()),
('rika-user-id', 'sample-board-1', 'member', NOW()),
('ans-user-id', 'sample-board-1', 'member', NOW()),
('kimon-user-id', 'sample-board-1', 'member', NOW())
ON CONFLICT ("userId", "boardId") DO NOTHING;

-- Create columns
INSERT INTO "Column" ("id", "title", "boardId", "order", "createdAt", "updatedAt") VALUES
('todo-column', 'To Do', 'sample-board-1', 0, NOW(), NOW()),
('inprogress-column', 'In Progress', 'sample-board-1', 1, NOW(), NOW()),
('review-column', 'Review', 'sample-board-1', 2, NOW(), NOW()),
('done-column', 'Done', 'sample-board-1', 3, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Create default labels
INSERT INTO "Label" ("id", "title", "color", "isDefault", "userId", "boardId") VALUES
('bug-label', 'Bug', 'red', true, 'admin-user-id', 'sample-board-1'),
('feature-label', 'Feature', 'blue', true, 'admin-user-id', 'sample-board-1'),
('enhancement-label', 'Enhancement', 'green', true, 'admin-user-id', 'sample-board-1'),
('documentation-label', 'Documentation', 'yellow', true, 'admin-user-id', 'sample-board-1'),
('high-priority-label', 'High Priority', 'orange', true, 'admin-user-id', 'sample-board-1')
ON CONFLICT ("id") DO NOTHING;

-- Create sample tasks
INSERT INTO "Task" ("id", "title", "description", "columnId", "order", "createdByUserId", "createdAt", "updatedAt") VALUES
('welcome-task', 'Welcome to TaskManager!', 'This is a sample task to help you get started. Feel free to edit or delete it.', 'todo-column', 0, 'admin-user-id', NOW(), NOW()),
('create-board-task', 'Create your first board', 'Boards help you organize your projects. Try creating a new board for your next project.', 'todo-column', 1, 'admin-user-id', NOW(), NOW()),
('invite-members-task', 'Invite team members', 'Collaborate with your team by inviting them to boards and assigning tasks.', 'todo-column', 2, 'admin-user-id', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Create board settings
INSERT INTO "BoardSettings" ("id", "boardId", "enablePriority", "enableBusinessValue", "enableEstimatedEffort", "enableDependencies", "enableBudgetEstimate", "enableRiskLevel", "enableStrategicAlignment", "enableRoiEstimate", "enableStageGate", "enableTimeSpent", "enableStoryPoints", "enableWatchers", "enableAttachments", "enableSubtasks", "defaultPriority", "defaultRiskLevel") VALUES
('sample-board-settings', 'sample-board-1', true, false, false, false, false, false, false, false, false, false, false, false, false, false, 'MEDIUM', 'LOW')
ON CONFLICT ("boardId") DO NOTHING;