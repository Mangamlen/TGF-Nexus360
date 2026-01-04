import API from "./api";

const BASE_URL = "/beekeeping"; // Corresponds to /api/beekeeping

const beekeepingService = {
  // --- Reports ---
  getComprehensiveReport: () => API.get(`${BASE_URL}/report`),

  // --- Bee Box Management ---
  getAllBoxes: () => API.get(`${BASE_URL}/boxes`),
  getBoxById: (id) => API.get(`${BASE_URL}/boxes/${id}`),
  addBox: (boxData) => API.post(`${BASE_URL}/boxes`, boxData),
  updateBoxDetails: (id, detailsData) => API.put(`${BASE_URL}/boxes/${id}/details`, detailsData),
  updateBoxStatus: (id, statusData) => API.put(`${BASE_URL}/boxes/${id}/status`, statusData),
  deleteBox: (id) => API.delete(`${BASE_URL}/boxes/${id}`),

  // --- History ---
  getBoxHistory: (id) => API.get(`${BASE_URL}/history/${id}`),
};

export default beekeepingService;
