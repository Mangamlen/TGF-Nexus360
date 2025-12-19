import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../services/api";
import Navbar from "../components/Navbar";

export default function Reports() {
  /* ================= AUTH ================= */
  const token = localStorage.getItem("token");

  let roleId = null;
  try {
    if (token) {
      const user = jwtDecode(token);
      roleId = user.role_id;
    }
  } catch {
    roleId = null;
  }

  /* ================= STATE ================= */
  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2025");
  const [status, setStatus] = useState("Draft");
  const [audit, setAudit] = useState(null);

  /* ================= ACTIONS ================= */

  const loadAudit = useCallback(async () => {
    try {
      const res = await API.get(
        `/reports/audit?type=monthly&month=${month}&year=${year}`
      );
      setAudit(res.data);
    } catch {
      setAudit(null);
    }
  }, [month, year]);

  const checkStatus = useCallback(async () => {
    try {
      const res = await API.get(
        `/reports/status?type=monthly&month=${month}&year=${year}`
      );
      setStatus(res.data.status || "Draft");
      loadAudit(); // 🔗 keep audit in sync
    } catch (err) {
      alert(err.response?.data?.error || "Failed to fetch report status");
    }
  }, [month, year, loadAudit]);

  const downloadPDF = () => {
    window.open(
      `http://localhost:5000/api/reports/monthly/pdf?month=${month}&year=${year}`,
      "_blank"
    );
  };

  const downloadExcel = () => {
    window.open(
      `http://localhost:5000/api/reports/monthly/excel?month=${month}&year=${year}`,
      "_blank"
    );
  };

  const submitReport = async () => {
    try {
      await API.post("/reports/submit", {
        report_type: "monthly",
        month,
        year
      });
      checkStatus();
    } catch (err) {
      alert(err.response?.data?.error || "Submit failed");
    }
  };

  const approveReport = async () => {
    try {
      await API.post("/reports/approve", {
        report_type: "monthly",
        month,
        year
      });
      checkStatus();
    } catch (err) {
      alert(err.response?.data?.error || "Approval failed");
    }
  };

  const lockReport = async () => {
    try {
      await API.post("/reports/status", {
        report_type: "monthly",
        month,
        year,
        status: "Locked"
      });
      checkStatus();
    } catch (err) {
      alert(err.response?.data?.error || "Lock failed");
    }
  };

  /* ================= AUTO LOAD ================= */
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Monthly Reports</h2>

        <select value={month} onChange={e => setMonth(e.target.value)}>
          {[
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
          ].map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <input value={year} onChange={e => setYear(e.target.value)} />

        <br /><br />

        <button onClick={checkStatus}>Refresh Status</button>

        <button
          onClick={downloadPDF}
          disabled={["Approved", "Locked"].includes(status)}
        >
          PDF
        </button>

        <button
          onClick={downloadExcel}
          disabled={["Approved", "Locked"].includes(status)}
        >
          Excel
        </button>

        {/* SUBMIT */}
        {[1, 2, 5].includes(roleId) && status === "Draft" && (
          <button onClick={submitReport}>Submit</button>
        )}

        {/* APPROVE (SUPER ADMIN ONLY) */}
        {roleId === 1 && status === "Submitted" && (
          <button onClick={approveReport}>Approve</button>
        )}

        {/* LOCK */}
        {[1, 2, 5].includes(roleId) && status === "Approved" && (
          <button onClick={lockReport}>Lock</button>
        )}

        {/* STATUS BADGE */}
        <h3>
          Status:
          <span
            style={{
              marginLeft: "10px",
              padding: "4px 10px",
              borderRadius: "6px",
              color: "white",
              background:
                status === "Locked" ? "#c0392b" :
                status === "Approved" ? "#27ae60" :
                status === "Submitted" ? "#f39c12" :
                "#7f8c8d"
            }}
          >
            {status}
          </span>
        </h3>

        {/* AUDIT TRAIL */}
        {audit && (
          <div style={{ marginTop: "20px", background: "#f4f6f7", padding: "15px" }}>
            <h4>Audit Trail</h4>

            {audit.submitted_by && (
              <p>
                📤 Submitted by <b>{audit.submitted_by}</b> on {audit.submitted_at}
              </p>
            )}

            {audit.approved_by && (
              <p>
                ✅ Approved by <b>{audit.approved_by}</b> on {audit.approved_at}
              </p>
            )}

            {audit.locked_by && (
              <p>
                🔒 Locked by <b>{audit.locked_by}</b> on {audit.locked_at}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
