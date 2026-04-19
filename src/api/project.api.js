import axiosClient from "./axios";

export const getProjects = async () => {
  const res = await axiosClient.get("/projects");
  return res.data;
};
