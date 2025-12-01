import { useEffect, useState } from "react";
import api from "../services/api";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard(){
  const [summary,setSummary]=useState({});
  const [monthly,setMonthly]=useState([]);

  useEffect(()=>{ 
    async function load(){ 
      const s = await api.get("/dashboard/summary");
      const m = await api.get("/dashboard/monthly-activities");
      setSummary(s.data);
      setMonthly(m.data);
    } 
    load(); 
  },[]);

  const data = {
    labels: monthly.map(x=>x.month),
    datasets: [{
      label: "Field Activities",
      data: monthly.map(x=>x.total_activities),
    }]
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded">Employees: {summary.employees||0}</div>
        <div className="bg-white p-4 shadow rounded">Beneficiaries: {summary.beneficiaries||0}</div>
        <div className="bg-white p-4 shadow rounded">Activities: {summary.activities||0}</div>
        <div className="bg-white p-4 shadow rounded">Production: {summary.production||0}</div>
      </div>
      <div className="bg-white p-4 shadow rounded mt-6">
        <Bar data={data} />
      </div>
      <div className="mt-6 flex gap-4">
        <a href="http://localhost:5000/api/reports/beneficiaries-excel" className="btn-primary">Download Beneficiaries Excel</a>
        <a href="http://localhost:5000/api/reports/monthly-pdf" className="btn-primary">Download Monthly PDF</a>
      </div>
    </div>
  );
}
