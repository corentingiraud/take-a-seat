"use client";

import { useQuery } from "@tanstack/react-query";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { User } from "@/models/user";
import { Booking } from "@/models/booking";
import { BookingStatus } from "@/models/booking-status";
import { PaymentStatus } from "@/models/payment-status";

export function useAdminBookingPayments() {
  const { fetchAll } = useStrapiAPI();

  const query = useQuery({
    queryKey: ["admin", "booking-payments"],
    queryFn: async () => {
      const bookingQueryParams = {
        populate: {
          [Booking.contentType]: {
            populate: {
              service: {
                populate: ["coworkingSpace"],
              },
            },
            filters: {
              $and: [
                { bookingStatus: { $eq: BookingStatus.CONFIRMED } },
                { paymentStatus: { $eq: PaymentStatus.PENDING } },
              ],
            },
          },
        },
        filters: {
          [Booking.contentType]: {
            $and: [
              { bookingStatus: { $eq: BookingStatus.CONFIRMED } },
              { paymentStatus: { $eq: PaymentStatus.PENDING } },
            ],
          },
        },
      };

      const rows = await fetchAll({
        ...User.strapiAPIParams,
        queryParams: bookingQueryParams,
      });

      return rows as User[];
    },
  });

  const getUserBookings = (userDocumentId?: string) => {
    const user = query.data?.find((u) => u.documentId === userDocumentId);
    return user?.bookings ?? [];
  };

  return {
    usersWithPendingBookingPayments: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    reload: query.refetch,
    getUserBookings,
  };
}
