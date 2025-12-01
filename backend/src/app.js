import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import beneficiaryRoutes from "./routes/beneficiaryRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "HRM+MIS API", version: "1.0.0" }
  },
  apis: []
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

const port = process.env.PORT || 5000;
sequelize.sync({ alter: true }).then(() => {
  console.log("DB Synced");
  app.listen(port, () => console.log("Server running on port", port));
}).catch(err => {
  console.error("DB sync error", err);
});
