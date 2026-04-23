// src/api/project.api.js
import axios from "../utils/axios";

// GET all projects
// Không cần async/await rườm rà, trả về thẳng Promise của axios
export const getProjectsApi = () => axios.get("/projects");
