-- Seed new Milestone 2 Badges
INSERT INTO badges (name, description, icon, criteria_type, criteria_value) VALUES
('7-Day Logging Streak', 'Log your footprints for 7 consecutive days to build a tracking habit.', 'Flame', 'STREAK', 7),
('First Goal Achieved', 'Successfully complete a carbon reduction goal.', 'Trophy', 'GOALS_COMPLETED', 1),
('10 kg Reduction', 'Save 10 kg of CO2e emissions vs baseline.', 'CheckCircle', 'TOTAL_SAVED_CO2', 10),
('25 kg Reduction', 'Save 25 kg of CO2e emissions vs baseline.', 'TrendingDown', 'TOTAL_SAVED_CO2', 25),
('50 kg Reduction', 'Save 50 kg of CO2e emissions vs baseline.', 'Award', 'TOTAL_SAVED_CO2', 50)
ON DUPLICATE KEY UPDATE description=VALUES(description);
