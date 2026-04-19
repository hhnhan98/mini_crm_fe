import axios from "./axios";

// GET tasks by project
export const getTasksByProjectApi = async (projectId) => {
  const res = await axios.get(`/tasks?projectId=${projectId}`);
  return res.data;
};
