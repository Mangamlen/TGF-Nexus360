import { Link, useNavigate } from "react-router-dom";
import { getRoleId, clearAuth } from "../utils/auth";

export default function Sidebar() {
  const navigate = useNavigate();
  const roleId = getRoleId();

  const logout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div style={{ width: "220px", background: "#2c3e50", color: "#fff", padding: "20px" }}>
      <h3>TGF Nexus360</h3>

      {(roleId === 1 || roleId === 2) && <Link style={link} to="/dashboard">Dashboard</Link>}
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
