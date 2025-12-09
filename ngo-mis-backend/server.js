require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const hrRoutes = require("./routes/hr");
const attendanceRoutes = require("./routes/attendance");
const payrollRoutes = require("./routes/payroll");


app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);


app.get("/", (req, res) => {
  res.send("NGO MIS Backend is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
