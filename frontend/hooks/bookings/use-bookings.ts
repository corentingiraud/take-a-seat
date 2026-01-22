"use client";

import { type Moment } from "moment";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";
import { StrapiResponse } from "@/types/strapi-api-params";

type UseBookingsParams = {
  userDocumentId?: string;
  startDate: Moment;
  endDate: Moment;
  pageSize?: number;
};

export function useBookings({
  userDocumentId,
  startDate,
  endDate,
  pageSize = 25,
}: UseBookingsParams) {
  const { user } = useAuth();
  const { fetchAllPaginated } = useStrapiAPI();

  const effectiveUserId = userDocumentId ?? user?.documentId;

  const query = useInfiniteQuery({
    queryKey: [
      "bookings",
      effectiveUserId,
      startDate.format("YYYY-MM-DD"),
      endDate.format("YYYY-MM-DD"),
      pageSize,
    ],
    enabled: !!effectiveUserId,
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<StrapiResponse<Booking>> => {
      if (!effectiveUserId) {
        return {
          data: [],
          meta: { pagination: { page: 1, pageSize, pageCount: 1, total: 0 } },
        };
      }

      const res = await fetchAllPaginated<Booking>({
        ...Booking.strapiAPIParams,
        queryParams: {
          populate: ["service", "service.coworkingSpace", "prepaidCard"],
          filters: {
            user: { documentId: { $eq: effectiveUserId } },
            startDate: { $gte: startDate.toDate() },
            endDate: { $lte: endDate.toDate() },
          },
          sort: ["startDate:asc"],
          "pagination[page]": pageParam,
          "pagination[pageSize]": pageSize,
        },
      });

      return res;
    },
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;

      return page < pageCount ? page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  const bookings = pages.flatMap((p) => p.data);

  const meta = pages[0]?.meta ?? {
    pagination: { page: 1, pageSize, pageCount: 0, total: 0 },
  };

  return {
    bookings,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    reload: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    total: meta.pagination.total,
    pageCount: meta.pagination.pageCount,
  };
}

type UseMarkedDaysParams = {
  userDocumentId?: string;
  monthStart: Moment;
  monthEnd: Moment;
};

export function useMarkedDays({
  userDocumentId,
  monthStart,
  monthEnd,
}: UseMarkedDaysParams) {
  const { user } = useAuth();
  const { fetchAll } = useStrapiAPI();

  const effectiveUserId = userDocumentId ?? user?.documentId;

  return useQuery({
    queryKey: [
      "bookings-marked-days",
      effectiveUserId,
      monthStart.format("YYYY-MM"),
    ],
    enabled: !!effectiveUserId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const bookings = await fetchAll<Booking>({
        ...Booking.strapiAPIParams,
        queryParams: {
          fields: ["startDate"],
          filters: {
            user: { documentId: { $eq: effectiveUserId } },
            startDate: {
              $gte: monthStart.toDate(),
              $lte: monthEnd.toDate(),
            },
          },
        },
        autoPaginate: true,
      });

      const uniqueDates = new Set(
        bookings.map((b) => b.startDate.format("YYYY-MM-DD"))
      );

      return Array.from(uniqueDates);
    },
  });
}
