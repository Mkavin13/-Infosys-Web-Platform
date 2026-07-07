-- Add OAuth and Preference Settings to users
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL UNIQUE;
ALTER TABLE users ADD COLUMN preferred_unit VARCHAR(50) DEFAULT 'METRIC';
ALTER TABLE users ADD COLUMN goals_visible BOOLEAN DEFAULT TRUE;
