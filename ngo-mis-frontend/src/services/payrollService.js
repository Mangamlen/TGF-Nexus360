// src/services/payrollService.js
import API from "./api";
import { toast } from "react-toastify";

/**
 * Generates salaries for all employees for a given month and year.
 * @param {string} month The month to generate salaries for (e.g., "January").
 * @param {number} year The year to generate salaries for.
 */
export const generateSalaries = async (month, year) => {
  try {
    const { data } = await API.post("/payroll/generate", { month, year });
    toast.success(data.message || "Payroll generation started.");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "An unexpected error occurred.");
    throw err;
  }
};

/**
 * Fetches the summarized history of all payroll runs.
 */
export const getPayrollHistory = async () => {
  try {
    const { data } = await API.get("/payroll/history");
    return data;
  } catch (err) {
    toast.error("Failed to fetch payroll history.");
    throw err;
  }
};

/**
 * Fetches the detailed report for a specific payroll run.
 * @param {string} month The month of the report.
 * @param {number} year The year of the report.
 */
export const getRunDetails = async (month, year) => {
  try {
    const { data } = await API.get(`/payroll/report/${month}/${year}`);
    return data;
  } catch (err) {
    toast.error("Failed to fetch run details.");
    throw err;
  }
};
