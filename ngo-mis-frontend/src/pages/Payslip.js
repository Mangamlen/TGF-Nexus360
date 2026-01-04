import React, { useState, useEffect, useCallback } from "react";
import { getEmployeePayslip } from "../services/payrollService";
import API from "../services/api";
import { getEmployeeId } from "../utils/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"; // Import Select components
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton

const Payslip = () => {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const employeeId = getEmployeeId();

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear.toString()); // Ensure year is string for Select component

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString()); // Last 5 years as strings

  const fetchPayslip = useCallback(async () => {
    if (!employeeId || !month || !year) {
      toast.error("Employee ID, month, or year is missing.");
      return;
    }
    setLoading(true);
    try {
      const data = await getEmployeePayslip(employeeId, month, year);
      setPayslip(data);
    } catch (error) {
      setPayslip(null);
      toast.error("Failed to fetch payslip.");
    } finally {
      setLoading(false);
    }
  }, [employeeId, month, year]);

  useEffect(() => {
    fetchPayslip();
  }, [fetchPayslip]);

  if (!employeeId) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Payslip</h2>
        <p>Employee ID not found. Please log in as an employee.</p>
      </div>
    );
  }

  const renderPayslipSkeleton = () => (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2"><Skeleton className="h-5 w-40" /></h3>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2"><Skeleton className="h-5 w-40" /></h3>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <hr className="my-4" />
        <h3 className="text-lg font-semibold mb-2"><Skeleton className="h-5 w-40" /></h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payslip</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="month">Month</Label>
          <Select value={month} onValueChange={setMonth} disabled={loading}>
            <SelectTrigger id="month" className="w-full">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Select value={year} onValueChange={setYear} disabled={loading}>
            <SelectTrigger id="year" className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2"> {/* Added gap-2 for spacing between buttons */}
          <Button onClick={fetchPayslip} disabled={loading}>
            {loading ? "Fetching..." : "Fetch Payslip"}
          </Button>
          {payslip && (
            <a
              href={`${API.defaults.baseURL}/payroll/payslip/download/${employeeId}/${month}/${year}`}
              target="_blank"
              rel="noopener noreferrer"
              download // Suggests browser to download the file
            >
              <Button variant="secondary">Download PDF</Button>
            </a>
          )}
        </div>
      </div>

      {loading && renderPayslipSkeleton()}

      {!loading && !payslip && (
        <p className="text-muted-foreground">No payslip found for the selected period.</p>
      )}

      {payslip && !loading && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Payslip for {payslip.month}, {payslip.year}</CardTitle>
            <p className="text-sm text-muted-foreground">Generated on: {new Date(payslip.generated_on).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Employee Details</h3>
                <p><strong>Name:</strong> {payslip.employee_name}</p>
                <p><strong>Employee Code:</strong> {payslip.emp_code}</p>
                <p><strong>Email:</strong> {payslip.employee_email}</p>
                <p><strong>Department:</strong> {payslip.department_name}</p>
                <p><strong>Designation:</strong> {payslip.designation_title}</p>
                <p><strong>Joining Date:</strong> {new Date(payslip.joining_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Payroll Summary</h3>
                <p><strong>Total Present Days:</strong> {payslip.total_present}</p>
                <p><strong>Net Salary:</strong> ₹{payslip.net_salary.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <hr className="my-4" />

            <h3 className="text-lg font-semibold mb-2">Salary Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Basic:</strong> ₹{payslip.basic?.toLocaleString('en-IN') || "N/A"}</p>
                <p><strong>HRA:</strong> ₹{payslip.hra?.toLocaleString('en-IN') || "N/A"}</p>
                <p><strong>Allowance:</strong> ₹{payslip.allowance?.toLocaleString('en-IN') || "N/A"}</p>
              </div>
              <div>
                <p><strong>Deduction:</strong> ₹{payslip.deduction?.toLocaleString('en-IN') || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Payslip;