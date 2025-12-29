import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import API from "../services/api";
import { getRoleId } from "../utils/auth";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Download, Check, Lock, History, Loader2 } from "lucide-react";

export default function Reports() {
  const roleId = getRoleId();
  const isAdmin = roleId === 1;
  const isManager = roleId === 2;

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [dialogs, setDialogs] = useState({ submit: false, audit: false });
  const [selectedReport, setSelectedReport] = useState(null);

  const [form, setForm] = useState({
    month: "January",
    year: new Date().getFullYear(),
    file: null,
  });

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get("/reports");
      setReports(data);
    } catch (err) {
      toast.error("Failed to fetch reports.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      return toast.warning("Please select a file to submit.");
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("report_type", "monthly");
    formData.append("month", form.month);
    formData.append("year", form.year);
    formData.append("file", form.file);

    try {
      await API.post("/reports/submit", formData);
      toast.success("Report submitted successfully");
      setDialogs(prev => ({ ...prev, submit: false }));
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (report) => {
    try {
      await API.post("/reports/approve", {
        report_type: report.report_type,
        month: report.month,
        year: report.year
      });
      toast.success("Report approved!");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to approve");
    }
  };

  const handleLock = async (report) => {
    try {
      // Note: The backend uses the POST /reports/status endpoint to lock
      await API.post("/reports/status", {
        report_type: report.report_type,
        month: report.month,
        year: report.year,
        status: "Locked"
      });
      toast.success("Report locked!");
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to lock");
    }
  };

  const openAuditDialog = (report) => {
    setSelectedReport(report);
    setDialogs(prev => ({ ...prev, audit: true }));
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'Locked':
        return <Badge className="bg-gray-700 text-white">Locked</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        {(isAdmin || isManager || roleId === 5) && (
          <Dialog open={dialogs.submit} onOpenChange={(isOpen) => setDialogs(p => ({...p, submit: isOpen}))}>
            <DialogTrigger asChild>
              <Button>Generate Report</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Monthly Report</DialogTitle>
                <DialogDescription>Select the period and upload the report file.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <select name="month" id="month" value={form.month} onChange={handleFormChange} className="w-full h-10 border rounded-md px-2">
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input type="number" name="year" id="year" value={form.year} onChange={handleFormChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Report File</Label>
                  <Input type="file" name="file" id="file" onChange={handleFormChange} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Report
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>A list of all submitted, approved, and locked reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Period</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading reports...</TableCell></TableRow>
              ) : reports.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">No reports found.</TableCell></TableRow>
              ) : (
                reports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{`Monthly - ${report.month} ${report.year}`}</TableCell>
                    <TableCell>{report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {report.file_id && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`${API.defaults.baseURL}/reports/download/${report.file_id}`} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openAuditDialog(report)}>
                        <History className="h-4 w-4" />
                      </Button>
                      {isAdmin && report.status === 'Submitted' && (
                        <Button size="sm" onClick={() => handleApprove(report)}><Check className="mr-1 h-4 w-4" />Approve</Button>
                      )}
                      {(isAdmin || isManager) && report.status === 'Approved' && (
                        <Button size="sm" variant="secondary" onClick={() => handleLock(report)}><Lock className="mr-1 h-4 w-4" />Lock</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Audit Trail Dialog */}
      <Dialog open={dialogs.audit} onOpenChange={(isOpen) => setDialogs(p => ({...p, audit: isOpen}))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Audit Trail</DialogTitle>
              <DialogDescription>{`History for ${selectedReport?.month} ${selectedReport?.year} report.`}</DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="text-sm space-y-2">
                {selectedReport.submitted_by_username && (
                  <p><strong>Submitted by:</strong> {selectedReport.submitted_by_username} on {new Date(selectedReport.submitted_at).toLocaleString()}</p>
                )}
                {selectedReport.approved_by_username && (
                  <p><strong>Approved by:</strong> {selectedReport.approved_by_username} on {new Date(selectedReport.approved_at).toLocaleString()}</p>
                )}
                {selectedReport.locked_by_username && (
                  <p><strong>Locked by:</strong> {selectedReport.locked_by_username} on {new Date(selectedReport.locked_at).toLocaleString()}</p>
                )}
                {!selectedReport.submitted_by_username && <p>This report is still a draft.</p>}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}