// src/utils/auth.js

export function saveAuth(token, role_id, employee_id) {
  localStorage.setItem("token", token);
  localStorage.setItem("role_id", role_id);
  if (employee_id) {
    localStorage.setItem("employee_id", employee_id);
  } else {
    localStorage.removeItem("employee_id");
  }
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role_id");
  localStorage.removeItem("employee_id");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getRoleId() {
  const r = localStorage.getItem("role_id");
  return r ? parseInt(r) : null;
}

export function getEmployeeId() {
  const empId = localStorage.getItem("employee_id");
  return empId ? parseInt(empId) : null;
}

export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
