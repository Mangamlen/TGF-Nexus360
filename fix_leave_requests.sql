DROP TABLE IF EXISTS leave_requests;

CREATE TABLE leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    requested_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_remarks TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
