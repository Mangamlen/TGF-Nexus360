import { useState } from "react";
import API from "../services/api";

export default function Reports() {
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
    <div>
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
      <button onClick={lockReport}>Lock</button>

      <h3>Status: {status}</h3>
    </div>
  );
}
