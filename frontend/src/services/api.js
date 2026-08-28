import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  console.error(
    "ERROR: VITE_API_URL is not configured."
  );
}

let API_URL = (rawApiUrl || "").trim();

// Remove trailing slash
API_URL = API_URL.replace(/\/+$/, "");

// Add /api automatically if needed
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
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access");

    // JWT
    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // IMPORTANT:
    // If we are sending FormData, do NOT force
    // application/json.
    //
    // Axios/browser will automatically generate:
    // multipart/form-data; boundary=...
    if (
      config.data instanceof FormData
    ) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error?.response?.status,
      error?.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;