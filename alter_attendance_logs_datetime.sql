ALTER TABLE attendance_logs
CHANGE COLUMN `date` `attendance_date` DATE,
CHANGE COLUMN `check_in` `check_in` DATETIME NULL,
CHANGE COLUMN `check_out` `check_out` DATETIME NULL;