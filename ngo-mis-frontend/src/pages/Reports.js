import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import API from "../services/api"; // Import API
import { getRoleId } from "../utils/auth"; // Import getRoleId

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Download, Check, Lock, History, Loader2, Users } from "lucide-react"; // Import Icons
import * as dashboardService from "../services/dashboardService"; // Import dashboard service
import { Skeleton } from "../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"; // Import Skeleton

const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <Table>
    <TableHeader>
      <TableRow>
        {Array.from({ length: cols }).map((_, i) => (
          <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function Reports() {
  const roleId = getRoleId();
  const isAdmin = roleId === 1;
  const isManager = roleId === 2;

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [beneficiaryStats, setBeneficiaryStats] = useState(null); // New state for beneficiary stats
  const [isStatsLoading, setIsStatsLoading] = useState(true); // New state for stats loading
  
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

  const fetchBeneficiaryStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await dashboardService.getBeneficiaryStats();
      setBeneficiaryStats(data);
    } catch (err) {
      // Error handled by service
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    if (isAdmin || isManager || roleId === 5) { // Only fetch stats for relevant roles
      fetchBeneficiaryStats();
    }
  }, [fetchReports, fetchBeneficiaryStats, isAdmin, isManager, roleId]);

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
        return <Badge variant="muted">Locked</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports Dashboard</h1>
        {(isAdmin || isManager || roleId === 5) && (
          <Dialog open={dialogs.submit} onOpenChange={(isOpen) => setDialogs(p => ({...p, submit: isOpen}))}>
            <DialogTrigger asChild>
              <Button variant="secondary">Generate Report</Button>
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
                  <Select name="month" value={form.month} onValueChange={(value) => handleFormChange({ target: { name: 'month', value: value }})}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Button type="submit" disabled={isSubmitting} variant="secondary">
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
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><TableSkeleton cols={4} /></TableCell></TableRow>
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
                        <Button size="sm" onClick={() => handleApprove(report)} variant="secondary"><Check className="mr-1 h-4 w-4" />Approve</Button>
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

      {(isAdmin || isManager || roleId === 5) && ( // Only show this section for relevant roles
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Demographics</CardTitle>
            <CardDescription>Overall statistics and distribution of beneficiaries.</CardDescription>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="space-y-4">
                <TableSkeleton cols={4} rows={1} /> {/* For summary cards */}
                <TableSkeleton cols={2} rows={3} /> {/* For village distribution */}
              </div>
            ) : beneficiaryStats ? (
              <div className="grid gap-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Beneficiaries</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{beneficiaryStats.summary.total_beneficiaries || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Male</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{beneficiaryStats.summary.total_male || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Female</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{beneficiaryStats.summary.total_female || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Trained</CardTitle>
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{beneficiaryStats.summary.trained || 0}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Village Distribution */}
                <h3 className="text-lg font-semibold mt-4">Beneficiaries by Village</h3>
                {beneficiaryStats.village_distribution && beneficiaryStats.village_distribution.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Village</TableHead>
                        <TableHead className="text-right">Total Beneficiaries</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beneficiaryStats.village_distribution.map((vd, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{vd.village}</TableCell>
                          <TableCell className="text-right">{vd.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No village distribution data available.</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No beneficiary demographic data available.</p>
            )}
          </CardContent>
        </Card>
      )}

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