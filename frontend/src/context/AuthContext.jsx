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
  // RESTORE SESSION
  // =========================================

  useEffect(() => {
    async function loadUser() {
      const accessToken =
        localStorage.getItem("access");

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/me/");

        const currentUser = response.data;

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
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
        password: password,
      }
    );

    const data = response.data;

    if (!data.access) {
      throw new Error(
        "Le serveur n'a pas retourné de token d'accès."
      );
    }

    localStorage.setItem(
      "access",
      data.access
    );

    if (data.refresh) {
      localStorage.setItem(
        "refresh",
        data.refresh
      );
    }

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
  // AUTH STATE
  // =========================================

  const isAuthenticated = Boolean(user);

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