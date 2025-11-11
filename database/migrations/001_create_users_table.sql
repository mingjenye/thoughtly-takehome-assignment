-- Migration: Create users table
-- Created: 2024-01-01
-- Purpose: Simple user table for ticket booking system

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tickets VARCHAR[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
