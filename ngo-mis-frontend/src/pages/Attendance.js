import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
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
} from "../components/ui/dialog"; // Assuming you have a Dialog component

const ADMIN_ROLE_ID = 1; // Assuming role_id 1 is admin
console.log("API Base URL from Attendance.js:", API.defaults.baseURL);
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

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const combineDateAndTime = (date, time) => {
    if (!date || !time) return null;
    return new Date(`${date}T${time}:00`); // Assuming time is HH:MM
  };

  /* =========================
     LOAD TODAY STATUS (USER)
  ========================= */
  const loadTodayStatus = async () => {
    try {
      console.log("Attempting API call to (today):", API.getUri({ url: "/attendance/today" }));
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
      console.log("Attempting API call to (history):", API.getUri({ url: "/attendance/history" }));
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
    // Convert date and time to formats suitable for input fields
    setEditingRecord({
      ...record,
      date: formatDateForInput(record.attendance_date), // Use formatted date
      check_in_time: formatTimeForInput(record.check_in),
      check_out_time: formatTimeForInput(record.check_out),
    });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => ({ ...prev, [name]: value }));
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
        date: editingRecord.date,
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
    if (roleId === ADMIN_ROLE_ID) {
      setIsAdmin(true);
      loadAllAttendanceRecords();
    } else {
      loadTodayStatus();
      loadHistory();
    }

    // === TEMPORARY DIAGNOSTIC FETCH CALL ===
    console.log("Attempting direct fetch to: http://localhost:5000/api/attendance/today");
    fetch("http://localhost:5000/api/attendance/today", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include authorization if needed
      }
    })
      .then(response => {
        console.log("Direct fetch response status:", response.status);
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
      })
      .then(data => console.log("Direct fetch data:", data))
      .catch(error => console.error("Direct fetch error:", error));
    // ======================================

  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance</h2>

      {!isAdmin ? (
        <>
          {/* ================= TODAY STATUS (USER) ================= */}
          <div className="mb-5">
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

            {status.check_out && <p className="text-lg">Status: Checked Out for today.</p>}
          </div>

          <hr className="my-6" />

          {/* ================= HISTORY TABLE (USER) ================= */}
          <h3 className="text-xl font-bold mb-3">Attendance History</h3>

          <Table>
            <TableCaption>A list of your recent attendance records.</TableCaption>
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
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">
                    No records found
                  </TableCell>
                </TableRow>
              )}

              {history.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.attendance_date}</TableCell>
                  <TableCell>
                    {row.check_in
                      ? new Date(row.check_in).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {row.check_out
                      ? new Date(row.check_out).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>{row.total_hours || "-"}</TableCell>
                  <TableCell>{row.status || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <>
          {/* ================= ADMIN ATTENDANCE VIEW ================= */}
          <h3 className="text-xl font-bold mb-3">All Attendance Records (Admin View)</h3>

          <Table>
            <TableCaption>All attendance records across employees.</TableCaption>
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
              {adminAttendanceRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan="8" className="text-center">
                    {loading ? "Loading..." : "No records found"}
                  </TableCell>
                </TableRow>
              )}

              {adminAttendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.emp_code}</TableCell>
                  <TableCell>{record.employee_name}</TableCell>
                  <TableCell className="font-medium">{record.attendance_date}</TableCell>
                  <TableCell>
                    {record.check_in
                      ? new Date(record.check_in).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {record.check_out
                      ? new Date(record.check_out).toLocaleTimeString()
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
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={editingRecord.date}
                      onChange={handleModalChange}
                      className="col-span-3"
                    />
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
                    <select
                      id="status"
                      name="status"
                      value={editingRecord.status}
                      onChange={handleModalChange}
                      className="col-span-3 p-2 border rounded-md"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Leave">Leave</option>
                    </select>
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
