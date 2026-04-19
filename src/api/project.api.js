import axios from "./axios";

// GET all projects
export const getProjectsApi = async () => {
  const res = await axios.get("/projects");
  return res.data;
};
