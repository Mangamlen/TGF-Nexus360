require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const hrRoutes = require("./routes/hr");
const attendanceRoutes = require("./routes/attendance");
const payrollRoutes = require("./routes/payroll");
const leaveRoutes = require("./routes/leave");
const expenseRoutes = require("./routes/expenses");
const dashboardRoutes = require("./routes/dashboard");
const beneficiaryRoutes = require("./routes/beneficiaries");
const reportRoutes = require("./routes/reports");


app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/reports", reportRoutes);


app.get("/", (req, res) => {
  res.send("NGO MIS Backend is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
