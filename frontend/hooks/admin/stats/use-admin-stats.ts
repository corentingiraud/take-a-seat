"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import { API_URL } from "@/config/site";

export interface StatsResponse {
  prepaidCardBuyers: number;
  paymentBreakdown: {
    prepaidCount: number;
    cbCount: number;
    total: number;
    prepaidPercentage: number;
    cbPercentage: number;
  };
  occupancyPerService: Array<{
    serviceId: number;
    serviceName: string;
    coworkingSpaceId: number;
    coworkingSpaceName: string;
    bookingCount: number;
    totalBookedHours: number;
    totalAvailableSeatHours: number;
    occupancyRate: number;
  }>;
  occupancyPerCoworkingSpace: Array<{
    coworkingSpaceId: number;
    coworkingSpaceName: string;
    totalBookedHours: number;
    totalAvailableSeatHours: number;
    occupancyRate: number;
  }>;
  uniqueCoworkers: number;
  newRegistrations: number;
  cancellationRate: { cancelled: number; total: number; rate: number };
  averageBookingDurationHours: number;
}

export function useAdminStats(startDate: string, endDate: string) {
  const { getJWT } = useAuth();

  return useQuery<StatsResponse>({
    queryKey: ["admin", "stats", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/stats?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${getJWT()}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!startDate && !!endDate,
  });
}
