import { jwtDecode } from "jwt-decode";

export const getRoleId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role_id; 
  } catch {
    return null;
  }
};
