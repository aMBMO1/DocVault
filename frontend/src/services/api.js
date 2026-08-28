import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "";

// Remove accidental trailing slash
API_URL = API_URL.replace(/\/+$/, "");

// If the backend URL doesn't already end with /api,
// add it automatically.
if (!API_URL.endsWith("/api")) {
  API_URL = `${API_URL}/api`;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;