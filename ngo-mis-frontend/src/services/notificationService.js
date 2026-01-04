// src/services/notificationService.js
import API from "./api";
import { toast } from "react-toastify";

export const getNotificationPreferences = async () => {
  try {
    const { data } = await API.get("/notifications/me/notifications");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch notification preferences.");
    throw err;
  }
};

export const updateNotificationPreferences = async (preferences) => {
  try {
    const { data } = await API.put("/notifications/me/notifications", preferences);
    toast.success(data.message || "Notification preferences updated successfully!");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to update notification preferences.");
    throw err;
  }
};
