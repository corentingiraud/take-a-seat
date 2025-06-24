"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { API_URL } from "@/config/site";
import { User } from "@/models/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  getJWT: () => string | null;
  login: (username: string, password: string) => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    setLoading(true);
    const token = getJWT();

    if (!token) {
      logout();
      setLoading(false);

      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/me?populate=role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();

      if (data.id) {
        const user = User.fromJson(data);

        setUser(user);
        setIsAuthenticated(true);
      }
    } catch {
      toast.error("Erreur lors du chargement de l'utilisateur");
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: email,
        password,
      }),
    });

    if (!res.ok) {
      toast.error("Echec de la connexion. Veuillez essayer de nouveau.");
    }

    const data = await res.json();

    window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, data.jwt);

    await fetchUser();

    toast.success("Connexion réussie.");
  };

  const getJWT = () => {
    return window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
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
      value={{ user, isAuthenticated, loading, getJWT, login, logout, hasRole }}
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
