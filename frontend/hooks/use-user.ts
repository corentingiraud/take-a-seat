import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useStrapiAPI } from "./use-strapi-api";

import { User } from "@/models/user";

export function useUser(userId: string) {
  const { fetchOne } = useStrapiAPI();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const user = await fetchOne({
        ...User.strapiAPIParams,
        id: userId,
      });

      setUser(user ?? null);
    } catch {
      toast.error(
        "Une erreur est survennue lors du chargement de l'utilisateur",
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return {
    reload,
    user,
    loading,
  };
}
