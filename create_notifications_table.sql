CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'leave_status', 'report_assigned', 'payroll_update'
    message TEXT NOT NULL,
    link VARCHAR(255), -- Optional link to relevant page
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
