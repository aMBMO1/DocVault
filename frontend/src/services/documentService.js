import api from "./api";

export const documentService = {
  getAll: () => api.get("/documents/"),
  getRecent: (limit = 5) => api.get(`/documents/recent/?limit=${limit}`),
  getByCategory: (slug) => api.get(`/documents/?category=${encodeURIComponent(slug)}`),
  create: (data) => {
    const formData = new FormData();
    formData.append("name", data.name || data.file.name);
    formData.append("description", data.description || "");
    formData.append("categoryId", data.categoryId);
    formData.append("file", data.file);
    return api.post("/documents/create/", formData);
  },
  rename: (id, name) => api.patch(`/documents/${id}/rename/`, { name }),
  remove: (id) => api.delete(`/documents/${id}/`),
};

export default documentService;
