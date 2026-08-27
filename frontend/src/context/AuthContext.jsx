import React, { createContext, useContext, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());
 async function login(email, password) {
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

  localStorage.setItem(
    "refresh",
    data.refresh
  );

  localStorage.setItem(
    "user",
    JSON.stringify(data)
  );

  setUser(data);

  return data;
}
  const logout = () => { authService.logout(); setUser(null); };
  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAdmin: user?.role === "admin" || user?.role === "Administrateur",
    isAuthenticated: Boolean(user && authService.getToken()),
    loading: false,
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
