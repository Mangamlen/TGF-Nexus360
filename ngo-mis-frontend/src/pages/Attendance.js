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

export default function Attendance() {
  const [status, setStatus] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     LOAD TODAY STATUS
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
     LOAD ATTENDANCE HISTORY
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
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    loadTodayStatus();
    loadHistory();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance</h2>

      {/* ================= TODAY STATUS ================= */}
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

      {/* ================= HISTORY TABLE ================= */}
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
    </div>
  );
}
