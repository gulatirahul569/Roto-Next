"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  googleLoginUser,
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

function getStoredValue(key, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallbackValue;
    }

    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const storedUser = getStoredValue("user", null);
    const storedToken = localStorage.getItem("token") || "";

    setUser(storedUser);
    setToken(storedToken);
    setIsAuthLoaded(true);
  }, []);

  const saveAuthData = (data) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    saveAuthData(data);
    return data;
  };

  const login = async (formData) => {
    const data = await loginUser(formData);
    saveAuthData(data);
    return data;
  };

  const googleLogin = async (credential) => {
    const data = await googleLoginUser(credential);
    saveAuthData(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken("");

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthLoaded,
      login,
      register,
      googleLogin,
      logout,
    }),
    [user, token, isAuthLoaded]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}