-- Add starter_code column and convert reference_solution to json
ALTER TABLE problems ADD COLUMN IF NOT EXISTS starter_code json;
ALTER TABLE problems ALTER COLUMN reference_solution TYPE json USING reference_solution::json;
