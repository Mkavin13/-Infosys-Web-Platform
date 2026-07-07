-- Add OAuth and Preference Settings to users
ALTER TABLE users ADD COLUMN google_id TEXT NULL;
ALTER TABLE users ADD COLUMN preferred_unit VARCHAR(50) DEFAULT 'METRIC';
ALTER TABLE users ADD COLUMN goals_visible BOOLEAN DEFAULT TRUE;

-- Allow password_hash to be NULL for OAuth-only users (no password)
ALTER TABLE users ALTER COLUMN password_hash SET NULL;
