import { useQuery } from "@tanstack/react-query";
import { Moment } from "moment";

import { useStrapiAPI } from "./use-strapi-api";

import moment from "@/lib/moment";
import { useAuth } from "@/contexts/auth-context";
import { PrepaidCard } from "@/models/prepaid-card";
import { PaymentStatus } from "@/models/payment-status";

export function usePrepaidCard({
  userDocumentId,
  bookingDates,
}: {
  userDocumentId?: string;
  bookingDates?: Moment[];
}) {
  const { user } = useAuth();
  const { fetchAll } = useStrapiAPI();

  const effectiveUserId = userDocumentId ?? user?.documentId;

  const query = useQuery({
    queryKey: ["prepaid-cards", effectiveUserId],
    enabled: !!effectiveUserId,
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const allCards = await fetchAll({
        ...PrepaidCard.strapiAPIParams,
        queryParams: {
          filters: { user: { documentId: { $eq: effectiveUserId } } },
        },
      });

      return allCards as PrepaidCard[];
    },
    select: (allCards) => {
      const today = moment().startOf("day");
      const usableCards = allCards.filter((card) => {
        const from = moment(card.validFrom).startOf("day");
        const exp = moment(card.expirationDate).startOf("day");

        // If booking dates are provided, check if the card was valid
        // during the booking period (allows using expired cards for
        // bookings that occurred within the card's validity window)
        if (bookingDates?.length) {
          const allBookingsCovered = bookingDates.every(
            (date) =>
              from.isSameOrBefore(date, "day") &&
              exp.isSameOrAfter(date, "day"),
          );

          return allBookingsCovered && card.paymentStatus === PaymentStatus.PAID;
        }

        return (
          from.isSameOrBefore(today) &&
          exp.isSameOrAfter(today) &&
          card.paymentStatus === PaymentStatus.PAID
        );
      });

      return { allCards, usableCards };
    },
  });

  return {
    reload: query.refetch,
    allPrepaidCards: query.data?.allCards ?? [],
    usablePrepaidCards: query.data?.usableCards ?? [],
    isLoading: query.isLoading,
  };
}
