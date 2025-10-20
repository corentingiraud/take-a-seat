"use client";

import { useQuery } from "@tanstack/react-query";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { PrepaidCard } from "@/models/prepaid-card";
import { PaymentStatus } from "@/models/payment-status";

export function useAdminPrepaidCardPayments() {
  const { fetchAll } = useStrapiAPI();

  const query = useQuery({
    queryKey: ["admin", "prepaid-card-payments"],
    queryFn: async () => {
      const queryParams = {
        populate: { user: true },
        filters: { paymentStatus: { $eq: PaymentStatus.PENDING } },
      };

      const rows = await fetchAll({
        ...PrepaidCard.strapiAPIParams,
        queryParams,
      });

      return rows as PrepaidCard[];
    },
  });

  return {
    prepaidCardsWithPendingPayments: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    reload: query.refetch,
  };
}
