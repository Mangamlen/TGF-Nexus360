CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (id, name) VALUES
(1, 'Admin'),
(2, 'Manager'),
(3, 'HR'),
(4, 'Employee'),
(5, 'Field Staff');
