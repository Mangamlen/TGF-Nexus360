import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRoleId } from "../utils/auth";
import { submitLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } from "../services/leaveService";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge"; // Assuming a Badge component exists
import { Textarea } from "../components/ui/textarea"; // Assuming a Textarea component exists

import { CalendarDays, Briefcase, Check, X, Hourglass } from "lucide-react";

export default function Leave() {
  const roleId = getRoleId();
  const isAdmin = roleId === 1 || roleId === 2;

  const [leaves, setLeaves] = useState([]);
  const [view, setView] = useState(isAdmin ? "team-requests" : "my-requests");
  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: ""
  });
  
  // Placeholder stats - can be replaced with actual data from API
  const leaveBalance = 15;
  const pendingRequests = leaves.filter(l => l.status === 'Pending').length;

  const loadLeaves = async () => {
    try {
      const data = isAdmin ? await getAllLeaves() : await getMyLeaves();
      setLeaves(data);
    } catch (err) {
      toast.error("Failed to load leave records");
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
      toast.warning("All fields are required!");
      return;
    }

    try {
      await submitLeave(form);
      toast.success("Leave submitted successfully");
      setForm({ leave_type: "", start_date: "", end_date: "", reason: "" });
      loadLeaves();
      setView("my-requests"); // Switch back to requests view
    } catch (err) {
      toast.error(err?.response?.data?.message || "Leave application failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      toast.success(`Leave request has been ${status.toLowerCase()}`);
      loadLeaves();
    } catch {
      toast.error("Failed to update leave status");
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Leave Management</h1>

      {/* --- STATS CARDS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Leave Balance</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance} Days</div>
            <p className="text-xs text-muted-foreground">Remaining for this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin ? pendingRequests : leaves.filter(l => l.status === 'Pending').length}</div>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'Awaiting your approval' : 'Awaiting approval'}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- VIEW TOGGLE --- */}
      <div className="flex space-x-2">
        {isAdmin ? (
          <Button variant={view === 'team-requests' ? 'solid' : 'outline'} onClick={() => setView('team-requests')}>
            Team Requests
          </Button>
        ) : (
          <>
            <Button variant={view === 'my-requests' ? 'solid' : 'outline'} onClick={() => setView('my-requests')}>
              My Requests
            </Button>
            <Button variant={view === 'apply' ? 'solid' : 'outline'} onClick={() => setView('apply')}>
              Apply for Leave
            </Button>
          </>
        )}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      
      {/* APPLY FOR LEAVE VIEW */}
      {view === 'apply' && !isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>New Leave Application</CardTitle>
            <CardDescription>Complete the form below to request time off.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Input 
                    id="leave-type" 
                    placeholder="e.g., Annual, Sick, Unpaid" 
                    value={form.leave_type}
                    onChange={e => setForm({ ...form, leave_type: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input 
                    id="start-date" 
                    type="date" 
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input 
                    id="end-date" 
                    type="date" 
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Please provide a brief reason for your leave" 
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <Button type="submit">Submit Request</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* REQUESTS LIST VIEW (User or Admin) */}
      {(view === 'my-requests' || view === 'team-requests') && (
        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? 'All Team Requests' : 'My Leave History'}</CardTitle>
            <CardDescription>A record of all leave requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length > 0 ? leaves.map(l => (
                  <TableRow key={l.id}>
                    {isAdmin && <TableCell>{l.user_name}</TableCell>}
                    <TableCell className="font-medium">{l.leave_type}</TableCell>
                    <TableCell>{new Date(l.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(l.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(l.status)}</TableCell>
                    {isAdmin && (
                      <TableCell className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(l.id, 'Approved')} disabled={l.status !== 'Pending'}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleStatusChange(l.id, 'Rejected')} disabled={l.status !== 'Pending'}>
                           <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 4} className="h-24 text-center">
                      No leave records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}