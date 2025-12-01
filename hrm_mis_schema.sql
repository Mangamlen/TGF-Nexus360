-- MySQL script for HRM + MIS schema (extended)

CREATE DATABASE IF NOT EXISTS hrm_mis;
USE hrm_mis;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin','mis-manager','project-manager','field-staff','data-entry','hr') DEFAULT 'field-staff',
  refreshToken TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empCode VARCHAR(50) UNIQUE,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  department VARCHAR(100),
  designation VARCHAR(100),
  profilePhoto VARCHAR(255),
  documentFile VARCHAR(255),
  joinDate DATE,
  exitDate DATE,
  baseSalary DECIMAL(10,2),
  hra DECIMAL(10,2),
  allowances DECIMAL(10,2),
  deductions DECIMAL(10,2),
  status ENUM('active','resigned') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Beneficiaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150),
  gender VARCHAR(20),
  age INT,
  village VARCHAR(150),
  district VARCHAR(150),
  phone VARCHAR(20),
  photo_url TEXT,
  id_proof_url TEXT,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  created_by INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT,
  date DATE,
  checkInTime DATETIME,
  checkOutTime DATETIME,
  latitude VARCHAR(50),
  longitude VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT,
  type VARCHAR(50),
  fromDate DATE,
  toDate DATE,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId INT,
  month VARCHAR(20),
  basic DECIMAL(10,2),
  hra DECIMAL(10,2),
  allowances DECIMAL(10,2),
  deductions DECIMAL(10,2),
  netSalary DECIMAL(10,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS FieldActivities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_type VARCHAR(150),
  description TEXT,
  beneficiary_id INT,
  staff_id INT,
  activity_date DATE,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  photo_url TEXT,
  report_pdf TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ProductionRecords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id INT,
  product_type VARCHAR(150),
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  record_month VARCHAR(20),
  record_year INT,
  staff_id INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
