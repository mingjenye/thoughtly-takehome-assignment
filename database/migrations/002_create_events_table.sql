-- Migration: Create events table
-- Created: 2024-01-01
-- Purpose: Store concert event information and available ticket counts

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  available_vip INTEGER NOT NULL DEFAULT 0,
  available_front_row INTEGER NOT NULL DEFAULT 0,
  available_ga INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_id ON events(id);

-- Insert default event (Event ID = 1)
INSERT INTO events (id, name, description, available_vip, available_front_row, available_ga)
VALUES (1, 'Default Concert Event', 'Main concert event for ticket booking', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

