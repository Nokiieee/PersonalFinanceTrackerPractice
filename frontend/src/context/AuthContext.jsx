import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // Attach or remove the Authorization header on the axios instance
  const applyToken = useCallback((t) => {
    if (t) {
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, []);

  // Apply saved token on first render
  applyToken(token);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    // data = { success, token, user }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    applyToken(data.token);
    return data.user;
  }, [applyToken]);

  const register = useCallback(async (username, password) => {
    const { data } = await api.post("/auth/register", { username, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    applyToken(data.token);
    return data.user;
  }, [applyToken]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    applyToken(null);
  }, [applyToken]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
