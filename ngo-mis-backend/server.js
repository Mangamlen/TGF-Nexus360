require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const authRoutes = require("./routes/auth");
const hrRoutes = require("./routes/hr");
const attendanceRoutes = require("./routes/attendance");
const payrollRoutes = require("./routes/payroll");
const leaveRoutes = require("./routes/leave");
const expenseRoutes = require("./routes/expenses");
const dashboardRoutes = require("./routes/dashboard");
const beneficiaryRoutes = require("./routes/beneficiaries");
const reportRoutes = require("./routes/reports");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit per IP
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/payroll", payrollRoutes);
app.use("/api/leave", require("./routes/leave"));
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/activity", require("./routes/activity"));
app.use(helmet());


app.get("/", (req, res) => {
  res.send("NGO MIS Backend is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    error: "Internal server error"
  });
});
