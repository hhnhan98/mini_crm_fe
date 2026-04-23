// src/api/project.api.js
import axios from "../utils/axios";

// POST login
export const loginApi = (credentials) => axios.post("/auth/login", credentials);
