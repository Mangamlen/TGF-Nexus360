CREATE TABLE monthly_reports (
  report_id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT,
  reporting_month INT,
  reporting_year INT,
  narrative_summary TEXT,
  status ENUM('Draft','Submitted','Approved'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_activities (
  activity_id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT,
  activity_type VARCHAR(255),
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  participants_count INT,
  shg_count INT,
  status VARCHAR(255)
);

CREATE TABLE activity_outputs (
  output_id INT PRIMARY KEY AUTO_INCREMENT,
  activity_id INT,
  output_type VARCHAR(255),
  description TEXT,
  FOREIGN KEY (activity_id) REFERENCES project_activities(activity_id)
);

CREATE TABLE project_expenses (
  expense_id INT PRIMARY KEY AUTO_INCREMENT,
  activity_id INT,
  amount DECIMAL(10, 2),
  bill_uploaded BOOLEAN,
  expense_status ENUM('Recorded','Pending'),
  FOREIGN KEY (activity_id) REFERENCES project_activities(activity_id)
);
