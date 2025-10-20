"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

import moment from "@/lib/moment";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { User } from "@/models/user";
import { Booking } from "@/models/booking";
import { BookingStatus } from "@/models/booking-status";
import { PaymentStatus } from "@/models/payment-status";

export function useAdminBookingPayments() {
  const { fetchAll } = useStrapiAPI();
  const now = useRef(moment().toDate()).current;

  const query = useQuery({
    queryKey: ["admin", "booking-payments"],
    queryFn: async () => {
      const bookingQueryParams = {
        populate: {
          [Booking.contentType]: {
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
              { endDate: { $gt: now } },
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

  return {
    usersWithPendingBookingPayments: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    reload: query.refetch,
  };
}
