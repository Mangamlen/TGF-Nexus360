// src/services/reportService.js
import API from "./api";
import { toast } from "react-toastify";

/**
 * Downloads a report file.
 * @param {number} fileId - The ID of the file to download.
 * @returns {Promise<Blob>} A promise that resolves with the file blob.
 */
export const downloadReport = async (fileId) => {
  try {
    const response = await API.get(`/reports/download/${fileId}`, {
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to download report.");
    throw err;
  }
};
