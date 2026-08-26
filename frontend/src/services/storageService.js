import api from "./api";

export const storageService = {
  async getInfo() {
    return await api.get("/storage/");
  },
};

export default storageService;