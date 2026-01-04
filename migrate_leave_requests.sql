-- This script migrates the 'leave_requests' table to a new schema
-- without dropping the table, preserving existing data.
--
-- PLEASE READ CAREFULLY BEFORE EXECUTING:
--
-- 1. BACKUP YOUR DATABASE before running this script.
--
-- 2. VERIFY FOREIGN KEY NAME in Step 5. You may need to edit this file.
--    Run `SHOW CREATE TABLE leave_requests;` in your MySQL client to find
--    the correct constraint name to drop. The script assumes 'leave_requests_ibfk_1'.
--

-- Step 1: Add the 'admin_remarks' column (COMMENTED OUT - MAY ALREADY EXIST)
-- ALTER TABLE leave_requests
-- ADD COLUMN admin_remarks TEXT NULL;

-- Step 2: Add the 'requested_on' column (COMMENTED OUT - MAY ALREADY EXIST)
-- ALTER TABLE leave_requests
-- ADD COLUMN requested_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 3: Add a new 'user_id' column temporarily (COMMENTED OUT - LIKELY ALREADY DONE)
-- ALTER TABLE leave_requests
-- ADD COLUMN new_user_id INT NULL;

-- Step 4: Populate the new 'new_user_id' column with the correct user IDs (COMMENTED OUT - LIKELY ALREADY DONE/NOT APPLICABLE)
-- UPDATE leave_requests lr
-- JOIN employees e ON lr.employee_id = e.id
-- SET lr.new_user_id = e.user_id;

-- Step 5: Drop the existing foreign key constraint on 'employee_id' (COMMENTED OUT - LIKELY ALREADY DONE/NOT APPLICABLE)
-- !!! IMPORTANT: Replace 'leave_requests_ibfk_1' if your constraint name is different !!!
-- ALTER TABLE leave_requests
-- DROP FOREIGN KEY leave_requests_ibfk_1;

-- Step 6: Drop the old 'employee_id' column (COMMENTED OUT - LIKELY ALREADY DONE)
-- ALTER TABLE leave_requests
-- DROP COLUMN employee_id;

-- Step 7: Rename the 'new_user_id' column to 'user_id' (COMMENTED OUT - LIKELY ALREADY DONE)
-- ALTER TABLE leave_requests
-- CHANGE COLUMN new_user_id user_id INT;

-- Step 8: Add the new foreign key constraint for 'user_id' referencing 'users(id)'
ALTER TABLE leave_requests
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id) REFERENCES users(id);
