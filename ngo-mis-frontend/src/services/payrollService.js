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
 * Fetches a specific employee's payslip for a given month and year.
 * @param {number} employeeId The ID of the employee.
 * @param {string} month The month of the payslip (e.g., "December").
 * @param {number} year The year of the payslip.
 */
export const getEmployeePayslip = async (employeeId, month, year) => {
  try {
    const { data } = await API.get(`/payroll/slip/${employeeId}/${month}/${year}`);
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // Don't show an error toast if the payslip is simply not found.
      // The component will handle the null response.
      return null;
    }
    // For other errors (e.g., server error), show a generic error message.
    toast.error(err.response?.data?.error || "An error occurred while fetching the payslip.");
    throw err;
  }
};

/**
 * Fetches the payroll history for a specific employee.
 * @param {number} employeeId The ID of the employee.
 */
export const getEmployeePayrollHistory = async (employeeId) => {
  try {
    const { data } = await API.get(`/payroll/employee/history/${employeeId}`);
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch employee payroll history.");
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

/**
 * Downloads a specific employee's payslip PDF for a given month and year.
 * @param {number} employeeId The ID of the employee.
 * @param {string} month The month of the payslip (e.g., "December").
 * @param {number} year The year of the payslip.
 * @returns {Blob} The payslip PDF file as a blob.
 */
export const downloadPayslipPdf = async (employeeId, month, year) => {
  try {
    const response = await API.get(`/payroll/payslip/download/${employeeId}/${month}/${year}`, {
      responseType: 'blob', // Important for downloading files
    });
    return response.data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to download payslip PDF.");
    throw err;
  }
};
