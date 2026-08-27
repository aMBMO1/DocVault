const API_URL = (import.meta.env.VITE_API_URL || "https://docvault-production-ee37.up.railway.app/api").replace(/\/$/, "");

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  const response = await fetch(`${API_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (data.access) localStorage.setItem("access_token", data.access);
  return data.access || null;
}

async function request(endpoint, options = {}, retry = true) {
  const token = localStorage.getItem("access_token");
  const isFormData = options.body instanceof FormData;
  const headers = { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await parseResponse(response);

  if (response.status === 401 && retry && !endpoint.includes("/token/refresh/")) {
    const newToken = await refreshAccessToken();
    if (newToken) return request(endpoint, options, false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  if (!response.ok) {
    const detail = data?.detail || data?.message || data?.error || `Erreur HTTP ${response.status}`;
    throw new Error(detail);
  }
  return data;
}

const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export { API_URL };
export default api;
