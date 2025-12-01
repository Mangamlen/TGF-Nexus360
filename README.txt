HRM+MIS Project (Extended)
==========================

This archive contains:

- backend/  => Node.js + Express + Sequelize backend
  * JWT auth + refresh tokens
  * Role-based access control
  * HRM: Employees, Attendance, Leaves, Payroll
  * MIS: Beneficiaries, FieldActivities, ProductionRecords
  * Dashboard & reporting APIs (summary, monthly activities)
  * Excel + PDF export endpoints
  * Email + WhatsApp notification service
  * Swagger endpoint: /api-docs

- frontend/ => React + Tailwind + Chart.js frontend
  * Login page
  * Dashboard with summary cards & bar chart
  * Employee creation form with file upload
  * Beneficiary creation form with file upload
  * Download buttons for Excel & PDF reports

- hrm_mis_schema.sql => MySQL schema to create the database and tables.

Quick start (backend)
---------------------
1. cd backend
2. cp .env.example .env
3. Edit .env with your MySQL credentials, JWT secrets, email & Twilio config.
4. npm install
5. npm run dev
   (Requires Node.js and MySQL running.)

Quick start (frontend)
----------------------
1. cd frontend
2. npm install
3. npm run dev
   (Requires Vite setup; you can `npm create vite@latest` if needed and merge.)

You now have a strong expert-level base. 
You can extend controllers, add validation, error handling, pagination, and more UI pages as needed.
