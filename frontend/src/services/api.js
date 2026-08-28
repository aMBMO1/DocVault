import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  console.error(
    "ERROR: VITE_API_URL is not configured."
  );
}

let API_URL = (rawApiUrl || "").trim();

// Remove trailing slashes
API_URL = API_URL.replace(/\/+$/, "");

// Add /api automatically
if (API_URL && !API_URL.endsWith("/api")) {
  API_URL += "/api";
}

console.log("API BASE URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// JWT
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

export default api;