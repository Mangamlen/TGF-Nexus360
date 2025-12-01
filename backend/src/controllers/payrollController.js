import { Employee, Payroll } from "../models/index.js";

export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month } = req.body;
    const emp = await Employee.findByPk(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    const net = (parseFloat(emp.baseSalary || 0) + parseFloat(emp.hra || 0) + parseFloat(emp.allowances || 0)) - parseFloat(emp.deductions || 0);
    const p = await Payroll.create({
      employeeId,
      month,
      basic: emp.baseSalary || 0,
      hra: emp.hra || 0,
      allowances: emp.allowances || 0,
      deductions: emp.deductions || 0,
      netSalary: net
    });
    res.json({ p });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
