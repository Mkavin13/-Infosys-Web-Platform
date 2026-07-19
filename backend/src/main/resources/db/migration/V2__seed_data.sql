-- Seed Emission Factors
INSERT INTO emission_factors (category, activity_type, factor, unit, description) VALUES
('TRANSPORT', 'CAR_PETROL', 0.18, 'KM', 'Standard petrol passenger car emissions per km'),
('TRANSPORT', 'CAR_DIESEL', 0.17, 'KM', 'Standard diesel passenger car emissions per km'),
('TRANSPORT', 'CAR_ELECTRIC', 0.05, 'KM', 'Electric car average emissions per km (grid-charging average)'),
('TRANSPORT', 'FLIGHT_SHORT', 0.15, 'KM', 'Short-haul flight emissions (< 1500km) per passenger km'),
('TRANSPORT', 'FLIGHT_LONG', 0.11, 'KM', 'Long-haul flight emissions (> 1500km) per passenger km'),
('TRANSPORT', 'PUBLIC_TRANSIT', 0.03, 'KM', 'Public train or bus emissions per passenger km'),

('ELECTRICITY', 'GRID_COAL', 0.85, 'KWH', 'Coal-heavy grid electricity generation per kWh'),
('ELECTRICITY', 'GRID_MIX', 0.45, 'KWH', 'Standard national grid energy mix average per kWh'),
('ELECTRICITY', 'RENEWABLE', 0.02, 'KWH', 'Solar, wind, or hydro renewable energy generation per kWh'),

('FOOD', 'MEAT_BEEF', 6.0, 'SERVINGS', 'Beef or lamb high-impact meal per serving (approx. 200g)'),
('FOOD', 'MEAT_POULTRY', 1.5, 'SERVINGS', 'Chicken, pork or fish medium-impact meal per serving'),
('FOOD', 'VEGETARIAN', 0.5, 'SERVINGS', 'Vegetarian meal (dairy/eggs, no meat) per serving'),
('FOOD', 'VEGAN', 0.25, 'SERVINGS', 'Fully plant-based vegan meal per serving'),

('SHOPPING', 'CLOTHING', 0.15, 'USD', 'Apparel and footwear production emissions per USD spent'),
('SHOPPING', 'ELECTRONICS', 0.35, 'USD', 'Smartphones, laptops, and IT accessories per USD spent'),
('SHOPPING', 'APPLIANCES', 0.25, 'USD', 'Large household appliances and hardware per USD spent'),
('SHOPPING', 'GENERAL_GOODS', 0.08, 'USD', 'General retail merchandise and groceries per USD spent');

-- Seed Badges
INSERT INTO badges (name, description, icon, criteria_type, criteria_value) VALUES
('Eco Pioneer', 'Log your very first activity on CarbonTrack.', 'Leaf', 'TOTAL_LOGS', 1),
('Sustained Logger', 'Log 15 activities to establish a consistent tracking routine.', 'Calendar', 'TOTAL_LOGS', 15),
('Green Commuter', 'Log a low-emission public transit or electric car journey.', 'Bike', 'LOW_EMISSION_TRANSPORT', 1),
('Plant Power', 'Log 10 vegetarian or vegan meals to support plant-based diets.', 'Apple', 'PLANT_MEALS', 10),
('Goal Crusher', 'Successfully complete your first carbon reduction goal.', 'Trophy', 'GOALS_COMPLETED', 1),
('Carbon Champion', 'Achieve a total footprint reduction of over 100 kg CO2e.', 'Award', 'TOTAL_SAVED_CO2', 100);

-- Seed a Default Organization for demo purposes
INSERT INTO organizations (name, invite_code) VALUES
('Acme Corporation', 'ACME2026'),
('Greenpeace Local', 'GREEN2026');
