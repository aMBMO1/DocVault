import api from "./api";

export const userService = {
  async getAll() {
    const response = await api.get(
      "/users/"
    );

    return response.data;
  },

  async create(data) {
    const response = await api.post(
      "/users/create/",
      {
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        role: "user",
      }
    );

    return response.data;
  },

  async rename(id, name) {
    const response = await api.patch(
      `/users/${id}/rename/`,
      {
        name,
      }
    );

    return response.data;
  },

  async setStatus(id, status) {
    const response = await api.patch(
      `/users/${id}/status/`,
      {
        status,
      }
    );

    return response.data;
  },

  async remove(id) {
    const response = await api.delete(
      `/users/${id}/`
    );

    return response.data;
  },
};

export default userService;