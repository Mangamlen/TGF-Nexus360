import { useEffect, useState } from "react";
import API from "../services/api";

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
      console.error("Failed to load today status");
    }
  };

  /* =========================
     LOAD HISTORY
  ========================= */
  const loadHistory = async () => {
    try {
      const res = await API.get("/attendance/history");
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load attendance history");
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
      alert("Checked in successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Check-in failed");
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
      alert("Checked out successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Check-out failed");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTodayStatus();
    loadHistory();
  }, []);

  return (
    <div>
      <h2>Attendance</h2>

      {/* TODAY STATUS */}
      <div style={{ marginBottom: "20px" }}>
        {!status.check_in && (
          <button onClick={checkIn} disabled={loading}>
            Check In
          </button>
        )}

        {status.check_in && !status.check_out && (
          <button onClick={checkOut} disabled={loading}>
            Check Out
          </button>
        )}

        {status.check_out && <p>Status: Checked Out</p>}
      </div>

      {/* HISTORY TABLE */}
      <h3>Attendance History</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row) => (
            <tr key={row.id}>
              <td>{row.attendance_date}</td>
              <td>{row.check_in || "-"}</td>
              <td>{row.check_out || "-"}</td>
              <td>{row.total_hours || "-"}</td>
              <td>{row.status || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
