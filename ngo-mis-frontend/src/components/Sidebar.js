import { Link, useNavigate } from "react-router-dom";
import { getRoleId } from "../utils/auth";

export default function Sidebar() {
  const navigate = useNavigate();
  const roleId = getRoleId();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.title}>TGF Nexus360</h3>

      {/* Dashboard – Admin & Manager only */}
      {[1, 2].includes(roleId) && (
        <Link style={styles.link} to="/dashboard">
          Dashboard
        </Link>
      )}

      {/* Reports – All logged-in users */}
      <Link style={styles.link} to="/reports">
        Reports
      </Link>

      {/* Attendance – All logged-in users */}
      <Link style={styles.link} to="/attendance">
        Attendance
      </Link>

      {/* Activity Log – Super Admin only */}
      {roleId === 1 && (
        <Link style={styles.link} to="/activity">
          Activity Log
        </Link>
      )}

      {/* Logout */}
      <button onClick={logout} style={styles.logout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: "#2c3e50",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  title: {
    color: "#fff",
    marginBottom: "20px"
  },
  link: {
    color: "#ecf0f1",
    textDecoration: "none",
    fontWeight: "500"
  },
  logout: {
    marginTop: "auto",
    padding: "8px",
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
