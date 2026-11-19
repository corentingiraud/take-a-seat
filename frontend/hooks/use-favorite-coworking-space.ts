"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";
import { CoworkingSpace } from "@/models/coworking-space";

const STORAGE_KEY = "favoriteCoworkingSpaceId";

/**
 * Space shown by default: the stored favorite, else the space of the user's latest
 * booking, else the first space. `select` stores the choice in localStorage.
 */
export function useFavoriteCoworkingSpace(spaces: CoworkingSpace[]) {
  const { user } = useAuth();
  const { fetchAllPaginated } = useStrapiAPI();
  // Only rendered once the user is loaded client-side, so reading storage here is hydration-safe.
  const [stored, setStored] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const { data: latestSpaceId, isLoading } = useQuery({
    queryKey: ["bookings", "latest-space", user?.documentId],
    enabled: !!user?.documentId,
    queryFn: async () => {
      const res = await fetchAllPaginated<Booking>({
        ...Booking.strapiAPIParams,
        queryParams: {
          populate: ["service", "service.coworkingSpace"],
          filters: { user: { documentId: { $eq: user!.documentId } } },
          sort: ["startDate:desc"],
          "pagination[page]": 1,
          "pagination[pageSize]": 1,
        },
      });

      return res.data[0]?.service?.coworkingSpace?.documentId ?? null;
    },
  });

  const known = (id?: string | null) => spaces.find((s) => s.documentId === id);
  const selected =
    known(stored) ?? known(latestSpaceId) ?? (isLoading ? undefined : spaces[0]);

  function select(documentId: string) {
    setStored(documentId);
    try {
      localStorage.setItem(STORAGE_KEY, documentId);
    } catch {
      // ignore: the choice just lasts for this page view
    }
  }

  return { selected, select };
}
