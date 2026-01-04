// src/services/notificationBellService.js
import API from "./api";
import { toast } from "react-toastify";

export const getNotifications = async () => {
  try {
    const { data } = await API.get("/bell-notifications/me");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch notifications.");
    throw err;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const { data } = await API.get("/bell-notifications/me/unread-count");
    return data.unread_count;
  } catch (err) {
    // Don't show toast for count, just log it silently
    console.error("Failed to fetch unread notification count:", err);
    return 0;
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const { data } = await API.put(`/bell-notifications/me/${id}/mark-read`);
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to mark notification as read.");
    throw err;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const { data } = await API.put("/bell-notifications/me/mark-all-read");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to mark all notifications as read.");
    throw err;
  }
};
