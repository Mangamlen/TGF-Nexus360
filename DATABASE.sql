
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

CREATE TABLE designations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100)
);

CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    emp_code VARCHAR(50) UNIQUE,
    department_id INT,
    designation_id INT,
    joining_date DATE,
    salary DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (designation_id) REFERENCES designations(id)
);


CREATE TABLE shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(50),
    start_time TIME,
    end_time TIME
);

CREATE TABLE attendance_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    date DATE,
    check_in TIME,
    check_out TIME,
    gps_location VARCHAR(255),
    status ENUM('Present','Absent','Half Day','Leave'),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    start_date DATE,
    end_date DATE,
    leave_type VARCHAR(50),
    status ENUM('Pending','Approved','Rejected'),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE salary_structures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    basic DECIMAL(10,2),
    hra DECIMAL(10,2),
    allowance DECIMAL(10,2),
    deduction DECIMAL(10,2),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE payroll_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    month VARCHAR(20),
    total_present INT,
    total_absent INT,
    net_salary DECIMAL(10,2),
    generated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE payslips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payroll_id INT,
    pdf_path VARCHAR(255),
    FOREIGN KEY (payroll_id) REFERENCES payroll_records(id)
);

CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_name VARCHAR(100),
    location VARCHAR(150),
    start_date DATE,
    end_date DATE
);

CREATE TABLE beneficiaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    name VARCHAR(100),
    village VARCHAR(100),
    phone VARCHAR(20),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE trainings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    topic VARCHAR(150),
    training_date DATE,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE hives (
    id INT PRIMARY KEY AUTO_INCREMENT,
    beneficiary_id INT,
    hive_number VARCHAR(50),
    allocation_date DATE,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id)
);

CREATE TABLE honey_production (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hive_id INT,
    month VARCHAR(20),
    quantity_kg DECIMAL(10,2),
    FOREIGN KEY (hive_id) REFERENCES hives(id)
);

CREATE TABLE file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    activity TEXT,
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

