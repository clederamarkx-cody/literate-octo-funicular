-- Migration: Drop email and focal_email from applications table
-- These fields are now sourced from the users table (single source of truth)

ALTER TABLE applications DROP COLUMN IF EXISTS email;
ALTER TABLE applications DROP COLUMN IF EXISTS focal_email;
