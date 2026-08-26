import api from "./api";

export const authService = {
  async login(email, password) {
    const data = await api.post("/auth/login/", { email, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  },
  getToken() { return localStorage.getItem("access_token"); },
};
