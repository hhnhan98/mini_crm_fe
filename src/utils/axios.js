import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/**
 * REQUEST INTERCEPTOR
 * Auto attach token mỗi request
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // <- đơn giản hóa, tránh dependency utils

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Handle auth errors globally
 */
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // clear auth sạch sẽ
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
