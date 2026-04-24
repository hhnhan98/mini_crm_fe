// src/api/project.api.js
import axios from "../utils/axios";

// POST login
export const loginApi = (credentials) => axios.post("/auth/login", credentials);

// POST register
export const registerApi = (data) => axios.post("/auth/register", data);
