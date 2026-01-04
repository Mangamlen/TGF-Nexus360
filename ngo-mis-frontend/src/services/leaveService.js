import api from "../api/axios";

export const submitLeave = async (leaveData) => {
  const res = await api.post("/leave", leaveData);
  return res.data;
};

export const getMyLeaves = async () => {
  const res = await api.get("/leave/my");
  return res.data;
};

export const getAllLeaves = async () => {
  const res = await api.get("/leave");
  return res.data;
};

export const updateLeaveStatus = async (id, status, admin_remarks) => {
  const res = await api.put(`/leave/${id}`, { status, admin_remarks });
  return res.data;
};
