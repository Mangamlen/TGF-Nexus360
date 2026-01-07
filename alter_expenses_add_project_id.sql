ALTER TABLE expenses
ADD COLUMN project_id INT NULL,
ADD CONSTRAINT fk_project_id
FOREIGN KEY (project_id) REFERENCES projects(id)
ON DELETE SET NULL;