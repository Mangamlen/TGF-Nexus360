import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../services/api";
import Navbar from "../components/Navbar";


export default function Reports() {
  const token = localStorage.getItem("token");

  let roleId = null;
  if (token) {
    const user = jwtDecode(token);
    roleId = user.role_id;
  }

  const [month, setMonth] = useState("March");
  const [year, setYear] = useState("2025");
  const [status, setStatus] = useState("");

  const checkStatus = async () => {
    const res = await API.get(
      `/reports/status?type=monthly&month=${month}&year=${year}`
    );
    setStatus(res.data.status);
  };

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

  const lockReport = async () => {
    await API.post("/reports/status", {
      report_type: "monthly",
      month,
      year,
      status: "Locked"
    });
    checkStatus();
  };

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

      <button onClick={checkStatus}>Check Status</button>
      <button onClick={downloadPDF}>PDF</button>
      <button onClick={downloadExcel}>Excel</button>

      {[1, 2, 5].includes(roleId) && (
        <button onClick={lockReport}>Lock</button>
      )}

      <h3>Status: {status}</h3>
    </div>
  </>
);
}
