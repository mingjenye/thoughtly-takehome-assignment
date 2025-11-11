-- Migration: Create tickets table
-- Created: 2024-01-01
-- Purpose: Store individual tickets with their booking status
-- Note: Implements row-level locking to prevent double-booking

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('VIP', 'Front Row', 'GA')),
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'booked')),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  booked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tier ON tickets(tier);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- Composite index for finding available tickets by event and tier
CREATE INDEX IF NOT EXISTS idx_tickets_event_tier_status ON tickets(event_id, tier, status);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

