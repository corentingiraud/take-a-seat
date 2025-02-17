import { useState } from "react";

import { API_URL } from "@/config/site";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

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
        throw new Error("Identifiants invalides");
      }

      const data = await res.json();

      return data.jwt;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
