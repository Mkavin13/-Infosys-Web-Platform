ALTER TABLE users ADD COLUMN current_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN last_active_date DATE;

INSERT INTO badges (name, description, icon, criteria_type, criteria_value)
VALUES ('7-Day Streak', 'Logged in or added an activity for 7 consecutive days', '🔥', 'TOTAL_LOGS', 7);
