// src/services/api.js
import axios from "axios";
import { getAuthHeader, clearAuth } from "../utils/auth";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Auto attach token & auto logout on 401
API.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getAuthHeader(),
  };
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearAuth();
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default API;
