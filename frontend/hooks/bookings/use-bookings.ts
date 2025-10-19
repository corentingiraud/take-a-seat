"use client";

import { useQuery } from "@tanstack/react-query";
import { Moment } from "moment";

import { useAuth } from "@/contexts/auth-context";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";

type UseBookingsParams = {
  userDocumentId?: string;
  startDate: Moment;
  endDate: Moment;
};

export function useBookings({
  userDocumentId,
  startDate,
  endDate,
}: UseBookingsParams) {
  const { user } = useAuth();
  const { fetchAll } = useStrapiAPI();

  const effectiveUserId = userDocumentId ?? user?.documentId;

  const query = useQuery({
    queryKey: [
      "bookings",
      effectiveUserId,
      startDate.format("YYYY-MM-DD"),
      endDate.format("YYYY-MM-DD"),
    ],
    enabled: !!effectiveUserId,
    queryFn: async () => {
      if (!effectiveUserId) return [] as Booking[];

      const rows = await fetchAll({
        ...Booking.strapiAPIParams,
        queryParams: {
          populate: ["service", "service.coworkingSpace", "prepaidCard"],
          filters: {
            user: { documentId: { $eq: effectiveUserId } },
            startDate: { $gte: startDate.toDate() },
            endDate: { $lte: endDate.toDate() },
          },
          sort: ["startDate:asc"],
        },
      });

      return rows as Booking[];
    },
  });

  return {
    bookings: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    reload: query.refetch,
  };
}
