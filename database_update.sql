CREATE TABLE report_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type VARCHAR(50),
    month VARCHAR(20),
    year INT,
    status VARCHAR(20),
    submitted_by INT,
    submitted_at DATETIME,
    approved_by INT,
    approved_at DATETIME,
    locked_by INT,
    locked_at DATETIME,
    file_id INT,
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (locked_by) REFERENCES users(id),
    FOREIGN KEY (file_id) REFERENCES file_uploads(id)
);
