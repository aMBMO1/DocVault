import api from "./api";

export function getSlug(name) {
  return String(name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export const categoryService = {
  getAll: () => api.get("/categories/"),
  getBySlug: (slug) => api.get(`/categories/${encodeURIComponent(slug)}/`),
  create: (data) => api.post("/categories/create/", { name: data.name, description: data.description || "" }),
  rename: (id, name) => api.patch(`/categories/${id}/rename/`, { name }),
  remove: (id) => api.delete(`/categories/${id}/`),
};
