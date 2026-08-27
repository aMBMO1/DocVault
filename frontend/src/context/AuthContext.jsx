import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // CHECK SAVED LOGIN
  // =========================================

  useEffect(() => {
    async function loadUser() {
      const access = localStorage.getItem("access");
      const savedUser = localStorage.getItem("user");

      if (!access) {
        setLoading(false);
        return;
      }

      try {
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // Verify token with backend
        const me = await api.get("/me/");

        setUser(me);

        localStorage.setItem(
          "user",
          JSON.stringify(me)
        );
      } catch (error) {
        console.error(
          "Session invalide :",
          error
        );

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  async function login(email, password) {
    const response = await api.post(
      "/auth/login/",
      {
        email: email.trim(),
        password,
      }
    );

    const data = response;

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

  // =========================================
  // LOGOUT
  // =========================================

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setUser(null);
  }

  // =========================================
  // ROLE
  // =========================================

  const isAuthenticated = !!user;

  const isAdmin =
    user?.role === "admin" ||
    user?.is_staff === true ||
    user?.is_superuser === true;

  // =========================================
  // CONTEXT
  // =========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================================
// HOOK
// =========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
export default AuthContext;