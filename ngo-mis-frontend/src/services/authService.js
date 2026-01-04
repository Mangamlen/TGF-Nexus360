// src/services/authService.js
import API from "./api";
import { toast } from "react-toastify";

export const changePassword = async (passwordData) => {
  try {
    const { data } = await API.post("/auth/change-password", passwordData);
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to change password.");
    throw err;
  }
};
