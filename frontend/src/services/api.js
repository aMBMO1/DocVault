import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  console.error(
    "VITE_API_URL is not defined. Configure it in Railway."
  );
}

let API_URL = (rawApiUrl || "").trim();

// Remove trailing slash
API_URL = API_URL.replace(/\/+$/, "");

// Add /api automatically if needed
if (API_URL && !API_URL.endsWith("/api")) {
  API_URL += "/api";
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// ADD ACCESS TOKEN TO PROTECTED REQUESTS
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// HANDLE AUTH ERRORS
// ==========================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "Authentication required."
      );
    }

    return Promise.reject(error);
  }
);

export default api;