import api from "../api/axios";

export const submitLeave = async (leaveData) => {
  const res = await api.post("/leave/apply", leaveData);
  return res.data;
};

export const getMyLeaves = async () => {
  const res = await api.get("/leave/my");
  return res.data;
};

export const getAllLeaves = async () => {
  const res = await api.get("/leave/list");
  return res.data;
};

export const updateLeaveStatus = async (id, status) => {
  const res = await api.put(`/leave/status/${id}`, { status });
  return res.data;
};
