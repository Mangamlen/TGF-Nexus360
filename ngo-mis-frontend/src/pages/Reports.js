import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../services/api";

export default function Reports() {
  /* ================= AUTH ================= */
  const token = localStorage.getItem("token");
  let roleId = null;

  if (token) {
    const user = jwtDecode(token);
    roleId = user.role_id;
  }

  /* ================= STATE ================= */
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState(2025);
  const [status, setStatus] = useState("Draft");
  const [audit, setAudit] = useState(null);

  const REPORT_TYPE = "monthly"; // ✅ SINGLE SOURCE OF TRUTH

  /* ================= FETCH STATUS ================= */
  const fetchStatus = useCallback(async () => {
    try {
      const res = await API.get("/reports/status", {
        params: {
          report_type: REPORT_TYPE,
          month,
          year
        }
      });
      setStatus(res.data.status || "Draft");
    } catch (err) {
      console.error(err);
    }
  }, [month, year]);

  /* ================= FETCH AUDIT ================= */
  const fetchAudit = useCallback(async () => {
    try {
      const res = await API.get("/reports/audit", {
        params: {
          report_type: REPORT_TYPE,
          month,
          year
        }
      });
      setAudit(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [month, year]);

  useEffect(() => {
    fetchStatus();
    fetchAudit();
  }, [fetchStatus, fetchAudit]);

  /* ================= ACTIONS ================= */
  const submitReport = async () => {
    try {
      await API.post("/reports/submit", {
        report_type: REPORT_TYPE,
        month,
        year
      });
      alert("Report submitted successfully");
      fetchStatus();
      fetchAudit();
    } catch (err) {
      alert(err.response?.data?.error || "Submit failed");
    }
  };

  const approveReport = async () => {
    try {
      await API.post("/reports/approve", {
        report_type: REPORT_TYPE,
        month,
        year
      });
      alert("Report approved successfully");
      fetchStatus();
      fetchAudit();
    } catch (err) {
      alert(err.response?.data?.error || "Approve failed");
    }
  };

  const lockReport = async () => {
    try {
      await API.post("/reports/status", {
        report_type: REPORT_TYPE,
        month,
        year,
        status: "Locked"
      });
      alert("Report locked successfully");
      fetchStatus();
      fetchAudit();
    } catch (err) {
      alert(err.response?.data?.error || "Lock failed");
    }
  };

  /* ================= UI ================= */
  return (
    <>
     

      <div style={{ padding: "20px" }}>
        <h2>Monthly Reports</h2>

        <select value={month} onChange={e => setMonth(e.target.value)}>
          {[
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
          ].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ marginLeft: "10px" }}
        />

        <div style={{ marginTop: "10px" }}>
          <button onClick={fetchStatus}>Refresh Status</button>

          {status === "Draft" && (roleId === 1 || roleId === 2 || roleId === 5) && (
            <button onClick={submitReport}>Submit</button>
          )}

          {status === "Submitted" && roleId === 1 && (
            <button onClick={approveReport}>Approve</button>
          )}

          {status === "Approved" && (roleId === 1 || roleId === 2) && (
            <button onClick={lockReport}>Lock</button>
          )}
        </div>

        <p>
          Status: <strong>{status}</strong>
        </p>

        {/* ================= AUDIT ================= */}
        {audit && (
          <div style={{ marginTop: "20px" }}>
            <h4>Audit Trail</h4>

            {audit.submitted_by && (
              <p>
                Submitted by {audit.submitted_by} on{" "}
                {new Date(audit.submitted_at).toLocaleString()}
              </p>
            )}

            {audit.approved_by && (
              <p>
                Approved by {audit.approved_by} on{" "}
                {new Date(audit.approved_at).toLocaleString()}
              </p>
            )}

            {audit.locked_by && (
              <p>
                Locked by {audit.locked_by} on{" "}
                {new Date(audit.locked_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
