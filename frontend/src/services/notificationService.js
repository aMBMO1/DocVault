let notifications = [
  { id: 1, icon: "bi-file-earmark-plus", message: "Bienvenue dans DocVault", time: "Maintenant", read: false },
];
export const notificationService = {
  getAll: async () => [...notifications],
  markAsRead: async (id) => { notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n); },
  markAllAsRead: async () => { notifications = notifications.map(n => ({ ...n, read: true })); },
};
