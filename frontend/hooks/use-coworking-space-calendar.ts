"use client";

import { Moment } from "moment";
import { useQuery } from "@tanstack/react-query";

import { CoworkingSpace } from "@/models/coworking-space";
import { API_URL } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";

type Params = {
  coworkingSpaceId?: string;
  startDate: Moment;
  endDate: Moment;
};

export function useCoworkingSpaceCalendar({ coworkingSpaceId, startDate, endDate }: Params) {
  const { getJWT } = useAuth();
  const start = startDate.clone().startOf("day");
  const end = endDate.clone().endOf("day");

  return useQuery<CoworkingSpace | undefined>({
    queryKey: [
      "calendar",
      coworkingSpaceId,
      start.format("YYYY-MM-DD"),
      end.format("YYYY-MM-DD"),
    ],
    enabled: !!coworkingSpaceId,
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      }).toString();

      const token = getJWT();

      const response = await fetch(
        `${API_URL}/coworking-spaces/${coworkingSpaceId}/calendar?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error("Échec du chargement du calendrier");
      }

      const json = await response.json();

      // The backend returns [] for a space without services.
      return CoworkingSpace.fromJson(Array.isArray(json) ? { name: "", services: [] } : json);
    },
  });
}
