import { useQuery } from "@tanstack/react-query";

import { useStrapiAPI } from "./use-strapi-api";

import moment from "@/lib/moment";
import { useAuth } from "@/contexts/auth-context";
import { PrepaidCard } from "@/models/prepaid-card";
import { PaymentStatus } from "@/models/payment-status";

export function usePrepaidCard({
  userDocumentId,
}: {
  userDocumentId?: string;
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

        return (
          from.isSameOrBefore(today) &&
          exp.isAfter(today) &&
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
