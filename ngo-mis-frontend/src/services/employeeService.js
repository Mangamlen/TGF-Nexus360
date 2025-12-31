// src/services/employeeService.js
import API from "./api";
import { toast } from "react-toastify";

export const registerStaff = async (formData) => {
  try {
    const { data } = await API.post("/hr/employees", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success(data.message || "Staff registered successfully!");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to register staff.");
    throw err;
  }
};

export const getAllEmployees = async () => {
  try {
    const { data } = await API.get("/hr/employees/all");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch employees.");
    throw err;
  }
};

export const getEmployeeById = async (id) => {
  try {
    const { data } = await API.get(`/hr/employees/${id}`);
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch employee profile.");
    throw err;
  }
};

export const getProfile = async () => {
  try {
    const { data } = await API.get("/hr/employees/me");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch profile.");
    throw err;
  }
};

export const updateProfile = async (formData) => {
  try {
    const { data } = await API.put("/hr/employees/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success(data.message || "Profile updated successfully!");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to update profile.");
    throw err;
  }
};

export const getDepartments = async () => {
  try {
    const { data } = await API.get("/hr/departments");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch departments.");
    throw err;
  }
};

export const getDesignations = async () => {
  try {
    const { data } = await API.get("/hr/designations");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch designations.");
    throw err;
  }
};
