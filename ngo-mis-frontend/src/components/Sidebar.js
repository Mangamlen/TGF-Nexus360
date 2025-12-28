import { Link, useNavigate } from "react-router-dom";
import { getRoleId, clearAuth } from "../utils/auth";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState(getRoleId());

  useEffect(() => {
    const handleStorageChange = () => {
      setRoleId(getRoleId());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div style={{ position: "fixed", left: 0, top: 0, width: "220px", height: "100vh", background: "#2c3e50", color: "#fff", padding: "20px", display: "flex", flexDirection: "column", overflowY: "auto", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "23px", marginBottom: "30px" }}>TGF Nexus360</h1>

      {(roleId === 1 || roleId === 2 || roleId === 3) && <Link style={link} to="/dashboard">Dashboard</Link>}
      <Link style={link} to="/reports">Reports</Link>
      <Link style={link} to="/attendance">Attendance</Link>
      <Link style={link} to="/leave">Leave</Link>
      {roleId === 1 && <Link style={link} to="/activity">Activity Log</Link>}

      <button style={logoutBtn} onClick={logout}>Logout</button>
    </div>
  );
}

const link = {
  display: "block",
  color: "#ecf0f1",
  margin: "12px 0",
  textDecoration: "none"
};

const logoutBtn = {
  marginTop: "auto",
  width: "100%",
  padding: "10px",
  background: "#e74c3c",
  border: "none",
  color: "#fff",
  cursor: "pointer"
};
