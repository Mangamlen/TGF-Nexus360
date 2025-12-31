import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"; // Import Card components
import {
  Table,
  TableBody,
  TableCaption,
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
} from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker"; // Import the new DatePicker
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton
import { format } from "date-fns";

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
  
  const combineDateAndTime = (dateObj, timeString) => {
    if (!dateObj || !timeString) return null;
    const [hours, minutes] = timeString.split(':');
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
      const res = await API.get("/attendance/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load attendance history", err);
      toast.error("Failed to load attendance history");
    }
  };

  /* =========================
     LOAD ALL ATTENDANCE RECORDS (ADMIN)
  ========================= */
  const loadAllAttendanceRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get("/attendance/admin/all");
      setAdminAttendanceRecords(res.data || []);
    } catch (err) {
      console.error("Failed to load all attendance records", err);
      toast.error("Failed to load all attendance records");
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
  const handleEditClick = (record) => {
    setEditingRecord({
      ...record,
      date: record.attendance_date ? new Date(record.attendance_date) : null, // Date object for DatePicker
      check_in_time: formatTimeForInput(record.check_in),
      check_out_time: formatTimeForInput(record.check_out),
    });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalDateChange = (date) => {
    setEditingRecord((prev) => ({ ...prev, date: date }));
  };

  const handleModalStatusChange = (value) => {
    setEditingRecord((prev) => ({ ...prev, status: value }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord.date || !editingRecord.check_in_time) {
      toast.error("Date and Check-in time are required.");
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        date: format(editingRecord.date, "yyyy-MM-dd"), // Format date for API
        check_in: combineDateAndTime(editingRecord.date, editingRecord.check_in_time),
        check_out: editingRecord.check_out_time
          ? combineDateAndTime(editingRecord.date, editingRecord.check_out_time)
          : null,
        status: editingRecord.status,
        gps_location: editingRecord.gps_location,
      };

      await API.put(`/attendance/admin/${editingRecord.id}`, updatedData);
      toast.success("Attendance record updated successfully!");
      handleCloseModal();
      loadAllAttendanceRecords(); // Refresh the admin view
    } catch (err) {
      console.error("Failed to update attendance record", err);
      toast.error(err.response?.data?.error || "Failed to update record.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    const roleId = getRoleId();
    if (roleId === 1) { // Assuming role_id 1 is admin
      setIsAdmin(true);
      loadAllAttendanceRecords();
    } else {
      loadTodayStatus();
      loadHistory();
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Attendance</h2>

      {!isAdmin ? (
        <>
          {/* ================= TODAY STATUS (USER) ================= */}
          <Card>
            <CardHeader>
              <CardTitle>Your Today's Status</CardTitle>
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
                  <Button onClick={checkIn} disabled={loading}>
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
              <CardTitle>Attendance History</CardTitle>
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
                        <TableCell className="font-medium">{format(new Date(row.attendance_date), "PPP")}</TableCell>
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
                        <TableCell className="font-medium">{format(new Date(record.attendance_date), "PPP")}</TableCell>
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
          {isModalOpen && editingRecord && (
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Attendance Record</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employee_name" className="text-right">
                      Employee
                    </Label>
                    <Input
                      id="employee_name"
                      name="employee_name"
                      value={editingRecord.employee_name}
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
                        date={editingRecord.date}
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
                      value={editingRecord.check_in_time}
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
                      value={editingRecord.check_out_time}
                      onChange={handleModalChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={editingRecord.status}
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
                      value={editingRecord.gps_location || ""}
                      onChange={handleModalChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={loading}>
                    Save changes
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
