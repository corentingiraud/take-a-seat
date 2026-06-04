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
  returningCoworkers: number;
  newCoworkers: number;
  newRegistrations: number;
  cancellationRate: {
    cancelled: number;
    total: number;
    rate: number;
    sameDayCancellations: number;
    sameDayRate: number;
  };
  averageBookingLeadTimeDays: number;
  averageBookingsPerMember: number;
  topClients: Array<{
    name: string;
    bookingCount: number;
    totalHours: number;
  }>;
  bookingHeatmap: Array<{
    coworkingSpaceId: number;
    coworkingSpaceName: string;
    cells: Array<{
      dayOfWeek: number;
      hour: number;
      count: number;
    }>;
  }>;
  cardBreakdown: {
    expiredCount: number;
    breakageCount: number;
    breakageBalance: number;
    consumptionRate: number;
  };
}

export function useAdminStats(startDate: string, endDate: string) {
  const { getJWT } = useAuth();

  return useQuery<StatsResponse>({
    queryKey: ["admin", "stats", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`${API_URL}/stats?${params}`, {
        headers: {
          Authorization: `Bearer ${getJWT()}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!startDate && !!endDate,
  });
}
