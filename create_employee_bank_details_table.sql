CREATE TABLE employee_bank_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number TEXT NOT NULL, -- Stored encrypted
    ifsc_code VARCHAR(50) NOT NULL,
    branch_name VARCHAR(255),
    upi_id VARCHAR(100),
    pan_number TEXT, -- Stored encrypted
    aadhaar_number TEXT, -- Stored encrypted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
