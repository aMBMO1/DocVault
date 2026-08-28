import api from "./api";

export const documentService = {
  // =========================================
  // GET ALL DOCUMENTS
  // =========================================

  async getAll() {
    const response = await api.get(
      "/documents/"
    );

    return response.data;
  },

  // =========================================
  // GET RECENT DOCUMENTS
  // =========================================

  async getRecent(limit = 5) {
    const response = await api.get(
      `/documents/recent/?limit=${limit}`
    );

    return response.data;
  },

  // =========================================
  // GET DOCUMENTS BY CATEGORY
  // =========================================

  async getByCategory(slug) {
    const response = await api.get(
      `/documents/?category=${encodeURIComponent(
        slug
      )}`
    );

    return response.data;
  },

  // =========================================
  // CREATE DOCUMENT
  // =========================================

  async create(data) {
    const formData = new FormData();

    formData.append(
      "name",
      data.name || data.file.name
    );

    formData.append(
      "description",
      data.description || ""
    );

    formData.append(
      "categoryId",
      data.categoryId
    );

    formData.append(
      "file",
      data.file
    );

    const response = await api.post(
      "/documents/create/",
      formData
    );

    return response.data;
  },

  // =========================================
  // RENAME DOCUMENT
  // =========================================

  async rename(id, name) {
    const response = await api.patch(
      `/documents/${id}/rename/`,
      {
        name: String(name || "").trim(),
      }
    );

    return response.data;
  },

  // =========================================
  // DELETE DOCUMENT
  // =========================================

  async remove(id) {
    const response = await api.delete(
      `/documents/${id}/`
    );

    return response.data;
  },
};

export default documentService;