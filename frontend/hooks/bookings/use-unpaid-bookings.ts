"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";
import { PaymentStatus } from "@/models/payment-status";
import { BookingStatus } from "@/models/booking-status";
import { User } from "@/models/user";

type UseUnpaidBookingsOptions = {
  user?: User | null;
};

export function useUnpaidBookings(options?: UseUnpaidBookingsOptions) {
  const { user: authUser } = useAuth();
  const { fetchAll } = useStrapiAPI();

  const user = options?.user ?? authUser;

  const query = useQuery({
    queryKey: ["unpaid-bookings", user?.documentId],
    enabled: !!user?.documentId,
    queryFn: async () => {
      if (!user?.documentId) return [];

      const bookings = await fetchAll<Booking>({
        ...Booking.strapiAPIParams,
        queryParams: {
          fields: ["id"],
          filters: {
            user: { documentId: { $eq: user.documentId } },
            paymentStatus: { $eq: PaymentStatus.PENDING },
            bookingStatus: {
              $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
            },
            endDate: { $lt: new Date() },
          },
        },
      });

      return bookings;
    },
  });

  return {
    hasUnpaidBookings: (query.data?.length ?? 0) > 0,
    unpaidCount: query.data?.length ?? 0,
    isLoading: query.isLoading,
  };
}
