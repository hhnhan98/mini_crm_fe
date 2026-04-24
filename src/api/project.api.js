// src/api/project.api.js
import axios from "../utils/axios";

// GET all projects
export const getProjectsApi = () => axios.get("/projects");

// CREATE new project
export const createProjectApi = (data) => axios.post("/projects", data);

// GET PROJECTMEMBER
export const getProjectMembersApi = (projectId) =>
  axios.get(`/projects/${projectId}/members`);

// ADD MEMBER
export const addMemberApi = (projectId, data) =>
  axios.post(`/projects/${projectId}/members`, data);

// GET PROJECT DETAIL
export const getProjectByIdApi = (projectId) =>
  axios.get(`/projects/${projectId}`);
