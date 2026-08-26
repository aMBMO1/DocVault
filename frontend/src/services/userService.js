import api from "./api";

export const userService = {
  async getAll() {
    return await api.get("/users/");
  },

  async create(data) {
    return await api.post("/users/create/", {
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      role:
        data.role === "Administrateur"
          ? "admin"
          : "user",
    });
  },

  async rename(id, name) {
    return await api.patch(`/users/${id}/rename/`, {
      name,
    });
  },

  async setStatus(id, status) {
    return await api.patch(`/users/${id}/status/`, {
      status,
    });
  },

  async remove(id) {
    return await api.delete(`/users/${id}/`);
  },
};

export default userService;