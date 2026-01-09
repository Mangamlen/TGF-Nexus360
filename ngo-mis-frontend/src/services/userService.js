// src/services/userService.js
import API from "./api";
import { toast } from "react-toastify";

export const getAllUsers = async () => {
  try {
    const { data } = await API.get("/users");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch users.");
    throw err;
  }
};

export const updateUserRole = async (userId, roleId) => {
  try {
    const { data } = await API.put(`/users/${userId}/role`, { role_id: roleId });
    toast.success(data.message || "User role updated successfully!");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to update user role.");
    throw err;
  }
};
