-- Seed data for development
-- Note: This file should only be run in development environment

-- Insert test users
INSERT INTO users (id, name, tickets) VALUES
  (1, 'John Doe', '{}'),
  (2, 'Jane Smith', '{}'),
  (3, 'Admin User', '{}')
ON CONFLICT (id) DO NOTHING;

-- Note: No tickets seeded initially. Use the frontend interface to create tickets.
