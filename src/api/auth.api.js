import axiosClient from "./axios";

export const loginApi = async (data) => {
  return axiosClient.post("/auth/login", data);
};
