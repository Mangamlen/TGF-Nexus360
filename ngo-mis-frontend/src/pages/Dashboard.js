import { useEffect, useState } from "react";
import API from "../services/api";
import { getRoleId } from "../utils/auth";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [projectStats, setProjectStats] = useState(null);

  const roleId = getRoleId();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const adminRes = await API.get("/dashboard/admin-summary");
      setSummary(adminRes.data);

      const projectRes = await API.get("/dashboard/project-stats");
      setProjectStats(projectRes.data);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  if (!summary || !projectStats) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <>
      

      <div style={{ padding: "20px" }}>
        <h1>Dashboard</h1>

        {/* SUMMARY CARDS */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {[1, 2].includes(roleId) && (
            <Card title="Total Users" value={summary.total_users} />
          )}

          <Card title="Employees" value={summary.total_employees} />
          <Card title="Departments" value={summary.total_departments} />

          {[1, 2, 5].includes(roleId) && (
            <Card title="Pending Leaves" value={summary.pending_leaves} />
          )}
        </div>

        {/* PROJECT STATISTICS */}
        {[1, 2, 5].includes(roleId) && (
          <>
            <h2 style={{ marginTop: "40px" }}>Project Statistics</h2>

            <div style={{ display: "flex", gap: "20px" }}>
              <Card
                title="Beneficiaries"
                value={projectStats.total_beneficiaries}
              />
              <Card
                title="Beehives Distributed"
                value={projectStats.total_beehives_distributed}
              />
              <Card
                title="Honey This Year (kg)"
                value={projectStats.total_honey_this_year || 0}
              />
              <Card
                title="Expenses This Month (₹)"
                value={projectStats.total_expenses_this_month || 0}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* Reusable Card Component */
function Card({ title, value }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        width: "220px",
        borderRadius: "8px",
        background: "#f9f9f9"
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}
