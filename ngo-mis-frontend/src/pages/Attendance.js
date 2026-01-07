import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"; // Import Card components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { getRoleId } from "../utils/auth";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker"; // Import the new DatePicker
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Default styles for react-calendar

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

export default function Attendance() {
  const [status, setStatus] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAttendanceRecords, setAdminAttendanceRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date()); // State for the calendar's current month/year
  const [allEvents, setAllEvents] = useState([]); // Combined attendance and leave for calendar overlay

  /* =========================
     HELPER FUNCTIONS
  ========================= */
  const formatTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateTimeForMySQL = (date) => {
    if (!date) return null;
    const pad = (num) => num.toString().padStart(2, '0');
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  
  const combineDateAndTime = (dateObj, timeString) => {
    if (!dateObj || !timeString) return null;
    const [hours, minutes] = timeString.split(':');
    if (isNaN(parseInt(hours, 10)) || isNaN(parseInt(minutes, 10))) return null;
    const newDate = new Date(dateObj);
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  /* =========================
     LOAD TODAY STATUS (USER)
  ========================= */
  const loadTodayStatus = async () => {
    try {
      const res = await API.get("/attendance/today");
      setStatus(res.data || {});
    } catch (err) {
      console.error("Failed to load today status", err);
      toast.error("Failed to load today's status");
    }
  };

  /* =========================
     LOAD ATTENDANCE HISTORY (USER)
  ========================= */
  const loadHistory = async () => {
    try {
      const [attendanceRes, leaveRes] = await Promise.all([
        API.get("/attendance/history"),
        API.get("/leave/my") // Fetch user's leave history
      ]);
      setHistory(attendanceRes.data || []);
      
      const combinedEvents = [
        ...(attendanceRes.data || []).map(item => ({
          date: item.attendance_date,
          type: 'attendance',
          status: item.status,
          check_in: item.check_in,
          check_out: item.check_out
        })),
        ...(leaveRes.data || []).map(item => ({
          date: item.start_date, // Start date of leave
          end_date: item.end_date, // End date of leave
          type: 'leave',
          status: item.status,
          leave_type: item.leave_type
        }))
      ];
      setAllEvents(combinedEvents); // Set combined events for calendar
    } catch (err) {
      console.error("Failed to load attendance history or leaves", err);
      toast.error("Failed to load history or leaves");
    }
  };

  /* =========================
     LOAD ALL ATTENDANCE RECORDS (ADMIN)
  ========================= */
  const loadAllAttendanceRecords = async () => {
    setLoading(true);
    try {
      const [attendanceRes, leaveRes] = await Promise.all([
        API.get("/attendance/admin/all"),
        API.get("/leave") // Fetch all leave records for admin
      ]);
      setAdminAttendanceRecords(attendanceRes.data || []);

      const combinedEvents = [
        ...(attendanceRes.data || []).map(item => ({
          date: item.attendance_date,
          type: 'attendance',
          status: item.status,
          check_in: item.check_in,
          check_out: item.check_out,
          employee_name: item.employee_name
        })),
        ...(leaveRes.data || []).map(item => ({
          date: item.start_date, // Start date of leave
          end_date: item.end_date, // End date of leave
          type: 'leave',
          status: item.status,
          leave_type: item.leave_type,
          employee_name: item.user_name // Note: leave API returns user_name
        }))
      ];
      setAllEvents(combinedEvents); // Set combined events for calendar
    } catch (err) {
      console.error("Failed to load all attendance records or leaves", err);
      toast.error("Failed to load all records or leaves");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CHECK-IN
  ========================= */
  const checkIn = async () => {
    setLoading(true);
    try {
      await API.post("/attendance/check-in");
      await loadTodayStatus();
      await loadHistory();
      toast.success("Checked in successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Check-in failed");
    }
    setLoading(false);
  };

  /* =========================
     CHECK-OUT
  ========================= */
  const checkOut = async () => {
    setLoading(true);
    try {
      await API.post("/attendance/check-out");
      await loadTodayStatus();
      await loadHistory();
      toast.success("Checked out successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Check-out failed");
    }
    setLoading(false);
  };

  /* =========================
     MODAL EDIT HANDLERS (ADMIN)
  ========================= */
  const [editedRecordData, setEditedRecordData] = useState(null); // New state for modal form data
  const [isSaving, setIsSaving] = useState(false); // New state for modal saving loading

  const handleEditClick = (record) => {
    // Format date and time for input fields
    const formattedCheckIn = record.check_in ? format(new Date(record.check_in), "HH:mm") : "";
    const formattedCheckOut = record.check_out ? format(new Date(record.check_out), "HH:mm") : "";
    
    setEditingRecord(record);
    setEditedRecordData({
      id: record.id,
      employee_name: record.employee_name,
      attendance_date: new Date(record.attendance_date), // Date object for DatePicker
      check_in_time: formattedCheckIn,
      check_out_time: formattedCheckOut,
      status: record.status,
      gps_location: record.gps_location || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setEditedRecordData(null);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditedRecordData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalDateChange = (date) => {
    setEditedRecordData(prev => ({ ...prev, attendance_date: date }));
  };

  const handleModalStatusChange = (value) => {
    setEditedRecordData(prev => ({ ...prev, status: value }));
  };

  const handleSaveEdit = async () => {
    if (!editedRecordData || isSaving) return;

    setIsSaving(true);
    try {
      const { id, attendance_date, check_in_time, check_out_time, status, gps_location } = editedRecordData;

      const finalCheckIn = combineDateAndTime(attendance_date, check_in_time);
      const finalCheckOut = combineDateAndTime(attendance_date, check_out_time);

      const updatePayload = {
        attendance_date: attendance_date.toISOString().split('T')[0],
        check_in: formatDateTimeForMySQL(finalCheckIn),
        check_out: formatDateTimeForMySQL(finalCheckOut),
        status,
        gps_location,
      };

      await API.put(`/attendance/admin/${id}`, updatePayload);
      toast.success("Attendance record updated successfully!");
      
      loadAllAttendanceRecords();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save attendance record:", err);
      toast.error(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };
  /* =========================
     CALENDAR HELPERS
  ========================= */

  /* =========================
     CALENDAR HELPERS
  ========================= */
  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getFullYear() === dateB.getFullYear() &&
           dateA.getMonth() === dateB.getMonth() &&
           dateA.getDate() === dateB.getDate();
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = allEvents.filter(event => isSameDay(event.date, date) || (event.type === 'leave' && isSameDay(event.end_date, date)));
      
      if (dayEvents.some(event => event.type === 'leave' && event.status === 'Approved')) {
        return 'bg-status-approved/20'; // Light green for approved leave
      }
      if (dayEvents.some(event => event.type === 'leave' && event.status === 'Pending')) {
        return 'bg-status-pending/20'; // Light yellow for pending leave
      }
      if (dayEvents.some(event => event.type === 'attendance' && event.status === 'Present')) {
        return 'bg-secondary/10'; // Light green for attendance
      }
      if (dayEvents.some(event => event.type === 'attendance' && event.status === 'Absent')) {
        return 'bg-destructive/10'; // Light red for absent
      }
      if (dayEvents.some(event => event.type === 'attendance' && event.status === 'Half Day')) {
        return 'bg-status-pending/10'; // Light orange for half day
      }
    }
    return null;
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = allEvents.filter(event => isSameDay(event.date, date) || (event.type === 'leave' && isSameDay(event.end_date, date)));
      
      return (
        <div className="flex flex-col text-[8px] leading-tight mt-1 items-center justify-center">
          {dayEvents.map((event, index) => {
            if (event.type === 'attendance') {
              let icon = null;
              let colorClass = 'text-muted-foreground';
              if (event.status === 'Present') { icon = 'P'; colorClass = 'text-status-approved'; }
              if (event.status === 'Absent') { icon = 'A'; colorClass = 'text-destructive'; }
              if (event.status === 'Half Day') { icon = 'H'; colorClass = 'text-status-pending'; }
              return <span key={index} className={colorClass}>{icon}{isAdmin ? ` (${event.employee_name.split(' ')[0]})` : ''}</span>;
            } else if (event.type === 'leave') {
              let icon = null;
              let colorClass = 'text-muted-foreground';
              if (event.status === 'Approved') { icon = 'L✓'; colorClass = 'text-status-approved'; }
              if (event.status === 'Pending') { icon = 'L?'; colorClass = 'text-status-pending'; }
              if (event.status === 'Rejected') { icon = 'L✗'; colorClass = 'text-destructive'; }
              return <span key={index} className={colorClass}>{icon}{isAdmin ? ` (${event.employee_name.split(' ')[0]})` : ''}</span>;
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    const roleId = getRoleId();
    if (roleId === 1) { // Assuming role_id 1 is admin
      setIsAdmin(true);
      loadAllAttendanceRecords(); // This now loads attendance and leaves
    } else {
      loadTodayStatus();
      loadHistory(); // This now loads attendance and leaves
    }
  }, []); // Empty dependency array means it runs once on mount

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Attendance</h2>

      {/* --- Calendar View --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Attendance & Leave Calendar</CardTitle>
          <CardDescription>Visual overview of employee attendance and leave requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <Calendar
              onChange={setCalendarDate}
              value={calendarDate}
              tileClassName={getTileClassName}
              tileContent={getTileContent}
              view="month"
              locale="en-US" // or your preferred locale
              className="react-calendar-themed"
            />
          </div>
        </CardContent>
      </Card>

      {!isAdmin ? (
        <>
          {/* ================= TODAY STATUS (USER) ================= */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-medium">Your Today's Status</CardTitle>
              <CardDescription>Manage your daily check-in and check-out.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                <strong>Check-In:</strong>{" "}
                {status.check_in ? format(new Date(status.check_in), "p") : "N/A"}
              </p>
              <p className="text-lg">
                <strong>Check-Out:</strong>{" "}
                {status.check_out ? format(new Date(status.check_out), "p") : "N/A"}
              </p>
              <div className="flex gap-2">
                {!status.check_in && (
                  <Button onClick={checkIn} disabled={loading} variant="secondary">
                    Check In
                  </Button>
                )}

                {status.check_in && !status.check_out && (
                  <Button onClick={checkOut} disabled={loading} variant="outline">
                    Check Out
                  </Button>
                )}
              </div>
              {status.check_out && <p className="text-muted-foreground">You are checked out for today.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-medium">Attendance History</CardTitle>
              <CardDescription>A list of your recent attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton cols={5} />
              ) : history.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  No records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.attendance_date ? format(new Date(row.attendance_date), "PPP") : '-'}</TableCell>
                        <TableCell>
                          {row.check_in
                            ? format(new Date(row.check_in), "p")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {row.check_out
                            ? format(new Date(row.check_out), "p")
                            : "-"}
                        </TableCell>
                        <TableCell>{row.total_hours || "-"}</TableCell>
                        <TableCell>{row.status || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* ================= ADMIN ATTENDANCE VIEW ================= */}
          <Card>
            <CardHeader>
              <CardTitle>All Attendance Records (Admin View)</CardTitle>
              <CardDescription>Manage and edit all employee attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton cols={8} />
              ) : adminAttendanceRecords.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  No records found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminAttendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.emp_code}</TableCell>
                        <TableCell>{record.employee_name}</TableCell>
                        <TableCell className="font-medium">{record.attendance_date ? format(new Date(record.attendance_date), "PPP") : '-'}</TableCell>
                        <TableCell>
                          {record.check_in
                            ? format(new Date(record.check_in), "p")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.check_out
                            ? format(new Date(record.check_out), "p")
                            : "-"}
                        </TableCell>
                        <TableCell>{record.total_hours || "-"}</TableCell>
                        <TableCell>{record.status || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(record)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* ================= EDIT ATTENDANCE MODAL ================= */}
          {isModalOpen && editingRecord && editedRecordData && (
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Attendance Record</DialogTitle>
                  <DialogDescription>
                    Make changes to the attendance record here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employee_name" className="text-right">
                      Employee
                    </Label>
                    <Input
                      id="employee_name"
                      name="employee_name"
                      value={editedRecordData.employee_name}
                      className="col-span-3"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <div className="col-span-3">
                      <DatePicker
                        date={editedRecordData.attendance_date}
                        setDate={handleModalDateChange}
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="check_in_time" className="text-right">
                      Check-In Time
                    </Label>
                    <Input
                      id="check_in_time"
                      name="check_in_time"
                      type="time"
                      value={editedRecordData.check_in_time}
                      onChange={handleModalChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="check_out_time" className="text-right">
                      Check-Out Time
                    </Label>
                    <Input
                      id="check_out_time"
                      name="check_out_time"
                      type="time"
                      value={editedRecordData.check_out_time}
                      onChange={handleModalChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={editedRecordData.status}
                      onValueChange={handleModalStatusChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                        <SelectItem value="Half Day">Half Day</SelectItem>
                        <SelectItem value="Leave">Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gps_location" className="text-right">
                      GPS Location
                    </Label>
                    <Input
                      id="gps_location"
                      name="gps_location"
                      value={editedRecordData.gps_location || ""}
                      onChange={handleModalChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isSaving} variant="secondary">
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
