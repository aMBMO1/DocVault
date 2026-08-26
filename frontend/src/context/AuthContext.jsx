import React, { createContext, useContext, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());
  const login = async (email, password) => { const u = await authService.login(email, password); setUser(u); return u; };
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
