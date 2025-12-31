// src/services/beneficiaryService.js
import API from "./api";
import { toast } from "react-toastify";

export const addBeneficiary = async (beneficiaryData) => {
  try {
    const { data } = await API.post("/beneficiaries/add", beneficiaryData);
    toast.success(data.message || "Beneficiary added successfully!");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to add beneficiary.");
    throw err;
  }
};

export const getAllBeneficiaries = async () => {
  try {
    const { data } = await API.get("/beneficiaries/all");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch beneficiaries.");
    throw err;
  }
};

export const getBeneficiaryById = async (id) => {
  try {
    const { data } = await API.get(`/beneficiaries/${id}`);
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to fetch beneficiary details.");
    throw err;
  }
};

export const updateTrainingStatus = async (id, status) => {
  try {
    const { data } = await API.put(`/beneficiaries/training/${id}`, { training_status: status });
    toast.success(data.message || "Training status updated successfully!");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to update status.");
    throw err;
  }
};

export const deleteBeneficiary = async (id) => {
  try {
    const { data } = await API.delete(`/beneficiaries/delete/${id}`);
    toast.success(data.message || "Beneficiary deleted successfully!");
    return data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to delete beneficiary.");
    throw err;
  }
};
