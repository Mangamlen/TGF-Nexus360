import { Link, useNavigate } from "react-router-dom";
import { getRoleId } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const roleId = getRoleId();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        padding: "10px 20px",
        background: "#2c3e50",
        display: "flex",
        gap: "20px",
        alignItems: "center"
      }}
    >
      {[1, 2, 5].includes(roleId) && (
        <Link style={linkStyle} to="/dashboard">Dashboard</Link>
      )}

      <Link style={linkStyle} to="/reports">Reports</Link>

      {[1, 2].includes(roleId) && (
        <Link style={linkStyle} to="/admin">Admin</Link>
      )}

      <button onClick={logout} style={logoutStyle}>
        Logout
      </button>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold"
};

const logoutStyle = {
  marginLeft: "auto",
  background: "#e74c3c",
  color: "white",
  border: "none",
  padding: "6px 12px",
  cursor: "pointer"
};
