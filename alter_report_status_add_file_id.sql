ALTER TABLE report_status
ADD COLUMN file_id INT,
ADD CONSTRAINT fk_file_id
FOREIGN KEY (file_id) REFERENCES file_uploads(id);
