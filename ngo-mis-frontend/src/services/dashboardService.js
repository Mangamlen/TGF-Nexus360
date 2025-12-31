// src/services/dashboardService.js
import API from "./api";
import { toast } from "react-toastify";

const handleApiError = (err, message = "Failed to fetch data.") => {
  console.error("API call failed", err);
  toast.error(err.response?.data?.error || message);
  throw err;
};

// --- Summary Endpoints ---
export const getAdminSummary = () => {
  return API.get("/dashboard/admin-summary")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load admin summary."));
};

export const getHrSummary = () => {
  return API.get("/dashboard/hr-summary")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load HR summary."));
};

export const getMySummary = () => {
  return API.get("/dashboard/my-summary")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load your summary."));
};

// --- Project & Beneficiary Endpoints ---
export const getProjectStats = () => {
  return API.get("/dashboard/project-stats")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load project stats."));
};

export const getTopHoneyProducers = (limit = 5) => {
  return API.get(`/dashboard/top-honey-producers?limit=${limit}`)
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load top honey producers."));
};

export const getTopBeneficiaries = (limit = 5) => {
  return API.get(`/dashboard/top-beneficiaries?limit=${limit}`)
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load top beneficiaries."));
};

export const getBeneficiaryStats = () => {
  return API.get("/dashboard/beneficiary-stats")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load beneficiary stats."));
};

// --- Chart Data Endpoints ---
export const getBeneficiariesByVillage = () => {
  return API.get("/dashboard/beneficiaries-by-village")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load beneficiary distribution."));
};

export const getGenderDistribution = () => {
  return API.get("/dashboard/gender-distribution")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load gender distribution."));
};

export const getAttendanceTrend = (days = 30) => {
  return API.get(`/dashboard/attendance-trend?days=${days}`)
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load attendance trend."));
};

export const getHoneyTrend = (year) => {
  const endpoint = year ? `/dashboard/honey-trend?year=${year}` : "/dashboard/honey-trend";
  return API.get(endpoint)
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load honey production trend."));
};

// --- Filter Data ---
export const getDashboardFilters = () => {
  return API.get("/dashboard/filters")
    .then(res => res.data)
    .catch(err => handleApiError(err, "Failed to load dashboard filters."));
};
