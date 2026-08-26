import api from "./api";

export const profileService = {
  getMe: () => api.get("/me/"),
  changePassword: (currentPassword, newPassword, confirmPassword) => api.post("/profile/password/", {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  }),
};
