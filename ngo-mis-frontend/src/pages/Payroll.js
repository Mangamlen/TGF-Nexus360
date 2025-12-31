import { useState, useEffect, useCallback } from "react";
import * as payrollService from "../services/payrollService";
import { getRoleId, getEmployeeId } from "../utils/auth"; // Import getRoleId, getEmployeeId

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";

export default function Payroll() {
  const [history, setHistory] = useState([]);
  const [runDetails, setRunDetails] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    month: "January",
    year: new Date().getFullYear(),
  });

  const roleId = getRoleId(); // Get roleId
  const employeeId = getEmployeeId(); // Get employeeId

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    const data = await payrollService.getPayrollHistory();
    setHistory(data);
    setIsLoadingHistory(false);
  }, []);

  const fetchEmployeeHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await payrollService.getEmployeePayrollHistory(employeeId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch employee payroll history:", error);
      setHistory([]);
    }
    setIsLoadingHistory(false);
  }, [employeeId]);

  useEffect(() => {
    if (roleId === 1 || roleId === 2) {
      fetchHistory();
    } else if (roleId === 5 && employeeId) {
      fetchEmployeeHistory();
    }
  }, [fetchHistory, fetchEmployeeHistory, roleId, employeeId]);

  const handleViewDetails = async (run) => {
    setSelectedRun(run);
    setIsLoadingDetails(true);
    const details = await payrollService.getRunDetails(run.month, run.year);
    setRunDetails(details);
    setIsLoadingDetails(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setGenerateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    await payrollService.generateSalaries(generateForm.month, generateForm.year);
    setIsGenerating(false);
    setIsDialogOpen(false);
    // Refresh history and details if the generated run was the one being viewed
    fetchHistory();
    if (selectedRun?.month === generateForm.month && selectedRun?.year === generateForm.year) {
      handleViewDetails(generateForm);
    }
  };

  // Employee Payroll History View
  if (roleId === 5) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <h1 className="text-2xl font-bold">My Payroll History</h1>
        <Card>
          <CardHeader>
            <CardTitle>Individual Payroll Records</CardTitle>
            <CardDescription>Your personal history of payroll records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Total Present</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Generated On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingHistory ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading your payroll history...</TableCell></TableRow>
                ) : history.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">No payroll records found for you.</TableCell></TableRow>
                ) : (
                  history.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.month}</TableCell>
                      <TableCell>{record.year}</TableCell>
                      <TableCell>{record.total_present}</TableCell>
                      <TableCell>₹{Number(record.net_salary).toLocaleString('en-IN')}</TableCell>
                      <TableCell>{new Date(record.generated_on).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin/Manager Payroll Management View
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Generate Salaries</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Payroll Run</DialogTitle>
              <DialogDescription>Select the month and year to run bulk salary generation for all employees.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <select name="month" id="month" value={generateForm.month} onChange={handleFormChange} className="w-full h-10 border rounded-md px-2">
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input type="number" name="year" id="year" value={generateForm.year} onChange={handleFormChange} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
          <CardDescription>Summary of all past payroll runs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Run Date</TableHead>
                <TableHead>Employees Paid</TableHead>
                <TableHead>Total Payout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingHistory ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading history...</TableCell></TableRow>
              ) : history.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">No payroll history found.</TableCell></TableRow>
              ) : (
                history.map((run) => (
                  <TableRow key={`${run.month}-${run.year}`} className={selectedRun?.month === run.month && selectedRun?.year === run.year ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">{run.month} {run.year}</TableCell>
                    <TableCell>{new Date(run.run_date).toLocaleDateString()}</TableCell>
                    <TableCell>{run.employee_count}</TableCell>
                    <TableCell>₹{Number(run.total_payout).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(run)}>View Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRun && (
        <Card>
          <CardHeader>
            <CardTitle>Run Details: {selectedRun.month} {selectedRun.year}</CardTitle>
            <CardDescription>Detailed breakdown for each employee in this payroll run.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Net Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDetails ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading details...</TableCell></TableRow>
                ) : runDetails.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">No details found for this run.</TableCell></TableRow>
                ) : (
                  runDetails.map((detail) => (
                    <TableRow key={detail.emp_code}>
                      <TableCell>{detail.name}</TableCell>
                      <TableCell>{detail.emp_code}</TableCell>
                      <TableCell>{detail.department}</TableCell>
                      <TableCell>₹{Number(detail.salary).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
