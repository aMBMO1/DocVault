import api from "./api";

export const authService = {
  async login(email, password) {
    const response = await api.post(
      "/auth/login/",
      {
        email,
        password,
      }
    );

    const data = response.data;

    localStorage.setItem(
      "access",
      data.access
    );

    if (data.refresh) {
      localStorage.setItem(
        "refresh",
        data.refresh
      );
    }

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    return data;
  },

  logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
  },

  getUser() {
    try {
      return JSON.parse(
        localStorage.getItem("user") ||
          "null"
      );
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem("access");
  },
};

export default authService;