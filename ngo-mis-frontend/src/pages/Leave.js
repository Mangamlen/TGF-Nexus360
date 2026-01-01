import { useEffect, useState, useCallback } from "react";
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
import { DatePicker } from "../components/ui/date-picker"; // Import DatePicker
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton
import { format } from "date-fns"; // Import format for dates

import { CalendarDays, Check, X, Hourglass } from "lucide-react";

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

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </CardContent>
  </Card>
);

export default function Leave() {
  const roleId = getRoleId();
  const isAdmin = roleId === 1 || roleId === 2;

  const [leaves, setLeaves] = useState([]);
  const [view, setView] = useState(isAdmin ? "team-requests" : "my-requests");
  const [loading, setLoading] = useState(true); // Add loading state
  const [form, setForm] = useState({
    leave_type: "",
    start_date: null, // Change to Date object for DatePicker
    end_date: null,   // Change to Date object for DatePicker
    reason: ""
  });
  
  // Placeholder stats - can be replaced with actual data from API
  const leaveBalance = 15;
  const pendingRequests = leaves.filter(l => l.status === 'Pending').length;

  const loadLeaves = useCallback(async () => {
    setLoading(true); // Set loading true
    try {
      const data = isAdmin ? await getAllLeaves() : await getMyLeaves();
      setLeaves(data);
    } catch (err) {
      toast.error("Failed to load leave records");
    } finally {
      setLoading(false); // Set loading false
    }
  }, [isAdmin]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves, view]); // Add view to dependency array to reload on view change

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
      toast.warning("All fields are required!");
      return;
    }

    try {
      await submitLeave({
        ...form,
        start_date: format(form.start_date, "yyyy-MM-dd"), // Format date for API
        end_date: format(form.end_date, "yyyy-MM-dd"),     // Format date for API
      });
      toast.success("Leave submitted successfully");
      setForm({ leave_type: "", start_date: null, end_date: null, reason: "" }); // Reset to null
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
        return <Badge className="bg-status-approved text-primary-foreground hover:bg-status-approved/90">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-status-rejected text-primary-foreground hover:bg-status-rejected/90">Rejected</Badge>;
      case 'Pending':
        return <Badge className="bg-status-pending text-primary-foreground hover:bg-status-pending/90">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leave Management</h1>

      {/* --- STATS CARDS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
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
                <div className="text-2xl font-bold">{pendingRequests}</div>
                <p className="text-xs text-muted-foreground">{isAdmin ? 'Awaiting your approval' : 'Awaiting approval'}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* --- VIEW TOGGLE --- */}
      <div className="flex space-x-2">
        {isAdmin ? (
          <Button variant={view === 'team-requests' ? 'default' : 'outline'} onClick={() => setView('team-requests')}>
            Team Requests
          </Button>
        ) : (
          <>
            <Button variant={view === 'my-requests' ? 'default' : 'outline'} onClick={() => setView('my-requests')}>
              My Requests
            </Button>
            <Button variant={view === 'apply' ? 'default' : 'outline'} onClick={() => setView('apply')}>
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
                  <DatePicker 
                    date={form.start_date}
                    setDate={(date) => setForm({ ...form, start_date: date })}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <DatePicker 
                    date={form.end_date}
                    setDate={(date) => setForm({ ...form, end_date: date })}
                    placeholder="Select end date"
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
            {loading ? (
              <TableSkeleton cols={isAdmin ? 6 : 4} />
            ) : leaves.length > 0 ? (
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
                  {leaves.map(l => (
                    <TableRow key={l.id}>
                      {isAdmin && <TableCell>{l.user_name}</TableCell>}
                      <TableCell className="font-medium">{l.leave_type}</TableCell>
                      <TableCell>{format(new Date(l.start_date), "PPP")}</TableCell>
                      <TableCell>{format(new Date(l.end_date), "PPP")}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-24 text-muted-foreground">
                No leave records found.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}