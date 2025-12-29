That error is expected. It's a database safety feature preventing you from deleting the `roles` table because the `users` table depends on it.

We can work around this by temporarily disabling this check.

**Here is the complete set of commands to fix the `roles` table.** Please run all of this as a single block in your MySQL Workbench.

```sql
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS roles;

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

SET FOREIGN_KEY_CHECKS=1;
```

**After running these commands:**

1.  **Restart your backend server.**
2.  **Try to mark attendance as a non-admin user.**

This should finally resolve all the database issues with the `roles` table. Let me know if it works.