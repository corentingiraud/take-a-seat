"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_URL } from "@/config/site";
import { User } from "@/models/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  getToken: () => string | null;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const JWT_LOCAL_STORAGE_KEY = "jwt";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = window.localStorage.getItem("jwt");

    if (token) {
      const fetchUser = async () => {
        const res = await fetch(`${API_URL}/users/me?populate=role`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.id) {
          const user = User.fromJson(data);

          setUser(user);
          setIsAuthenticated(true);
        }
      };

      fetchUser();
    }
  }, []);

  const getToken = () => {
    return window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
  };

  const login = (token: string) => {
    window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, token);
    setIsAuthenticated(true);
    const fetchUser = async () => {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      setUser(data);
    };

    fetchUser();
  };

  const logout = () => {
    window.localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasRole = (role: string) => {
    if (!user) return false;

    return user.role?.type === role;
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, getToken, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
