"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { API_URL, siteConfig } from "@/config/site";
import { User } from "@/models/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  getJWT: () => string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (user: User, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;

  /** Sends reset email via Strapi Users & Permissions */
  forgotPassword: (email: string) => Promise<void>;
  /** Completes reset using the code from the email link */
  resetPassword: (
    code: string,
    password: string,
    passwordConfirmation?: string,
  ) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const JWT_LOCAL_STORAGE_KEY = "jwt";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
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
    setLoading(true);

    try {
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
        setLoading(false);

        return;
      }

      const data = await res.json();

      window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, data.jwt);

      await fetchUser();

      toast.success("Connexion réussie.");
      router.push(siteConfig.path.dashboard.href);
    } catch {
      toast.error("Echec de la connexion. Veuillez essayer de nouveau.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (user: User, password: string) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...user.toJsonForRegistration(),
          password,
        }),
      });

      if (!res.ok) {
        let msg = "Échec de l'inscription. Veuillez réessayer.";

        try {
          const err = await res.json();

          if (err?.error?.message) msg = err.error.message;
        } catch {}
        toast.error(msg);
        setLoading(false);

        return;
      }

      const data = await res.json();

      window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, data.jwt);

      await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.jwt}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        }),
      });

      await fetchUser();

      toast.success("Compte créé avec succès. Bienvenue !");
      router.push(siteConfig.path.dashboard.href);
    } catch {
      toast.error("Échec de l'inscription. Veuillez réessayer.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // Strapi usually returns { error: { message } }
        let msg = "Impossible d'envoyer l'e-mail de réinitialisation.";

        try {
          const err = await res.json();

          if (err?.error?.message) msg = err.error.message;
        } catch {}
        toast.error(msg);

        return;
      }

      toast.success(
        "Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.",
      );
    } catch {
      toast.error("Erreur lors de l'envoi de l'e-mail de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    code: string,
    password: string,
    passwordConfirmation?: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          password,
          passwordConfirmation: passwordConfirmation ?? password,
        }),
      });

      if (!res.ok) {
        let msg = "Échec de la réinitialisation du mot de passe.";

        try {
          const err = await res.json();

          if (err?.error?.message) msg = err.error.message;
        } catch {}
        toast.error(msg);

        return;
      }

      const data = await res.json();

      // Strapi returns a fresh JWT + user after reset
      if (data?.jwt) {
        window.localStorage.setItem(JWT_LOCAL_STORAGE_KEY, data.jwt);
        await fetchUser();
      }

      toast.success("Mot de passe réinitialisé. Vous êtes connecté.");
      router.push(siteConfig.path.dashboard.href);
    } catch {
      toast.error("Erreur lors de la réinitialisation du mot de passe.");
    } finally {
      setLoading(false);
    }
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
      value={{
        user,
        isAuthenticated,
        loading,
        getJWT,
        login,
        logout,
        hasRole,
        signup,
        forgotPassword,
        resetPassword,
      }}
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
