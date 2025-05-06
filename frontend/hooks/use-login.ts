import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";

export function useLogin() {
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      await authLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
