-- This script modifies the employees table as part of the staff registration restructure.
-- It removes columns that have been moved to other tables and adds new ones.

-- Step 1: Remove columns that are now in other tables
ALTER TABLE employees
DROP COLUMN phone,
DROP COLUMN address,
DROP COLUMN photo_path;

-- Step 2: Add new columns for job details
ALTER TABLE employees
ADD COLUMN employment_type VARCHAR(50),
ADD COLUMN reporting_manager INT, -- Can be a FK to employees.id or users.id
ADD COLUMN work_location VARCHAR(100);

-- Step 3: Add foreign key constraint for reporting_manager if needed
-- This assumes reporting_manager is a user_id. Adjust if it's an employee_id.
-- ALTER TABLE employees
-- ADD CONSTRAINT fk_reporting_manager
-- FOREIGN KEY (reporting_manager) REFERENCES users(id);
