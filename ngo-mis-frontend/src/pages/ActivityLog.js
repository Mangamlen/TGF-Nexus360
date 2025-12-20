import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("/activity");
        setLogs(res.data);
      } catch (err) {
        setError("Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>System Activity Log</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <table border="1" cellPadding="8" cellSpacing="0" width="100%">
            <thead style={{ background: "#f2f2f2" }}>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Action</th>
                <th>Description</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" align="center">
                    No activity found
                  </td>
                </tr>
              )}

              {logs.map((log, index) => (
                <tr key={log.id}>
                  <td>{index + 1}</td>
                  <td>{log.user_name}</td>
                  <td>{log.action}</td>
                  <td>{log.description}</td>
                  <td>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
