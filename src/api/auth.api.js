import axiosClient from "./axios";

// POST login
export const loginApi = async (data) => {
  return axiosClient.post("/auth/login", data);
};
