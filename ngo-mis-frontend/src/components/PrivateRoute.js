import { Navigate } from "react-router-dom";
import { getRoleId } from "../utils/auth";

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const roleId = getRoleId();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(roleId)) {
    return <Navigate to="/attendance" replace />;
  }

  return children;
}
