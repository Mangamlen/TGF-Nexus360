-- SQL to add new biodata columns to the 'employees' table

ALTER TABLE employees
ADD COLUMN phone VARCHAR(20) NULL,
ADD COLUMN address VARCHAR(255) NULL,
ADD COLUMN photo_path VARCHAR(255) NULL;
