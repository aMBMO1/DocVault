import api from "./api";

export function getSlug(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const categoryService = {
  async getAll() {
    const response = await api.get("/categories/");
    return response.data;
  },

  async getBySlug(slug) {
    const response = await api.get(
      `/categories/${encodeURIComponent(slug)}/`
    );

    return response.data;
  },

  async create(data) {
    const response = await api.post(
      "/categories/create/",
      {
        name: String(data.name || "").trim(),
        description: String(
          data.description || ""
        ).trim(),
      }
    );

    return response.data;
  },

  async rename(id, name) {
    const response = await api.patch(
      `/categories/${id}/rename/`,
      {
        name: String(name || "").trim(),
      }
    );

    return response.data;
  },

  async remove(id) {
    const response = await api.delete(
      `/categories/${id}/`
    );

    return response.data;
  },
};

export default categoryService;