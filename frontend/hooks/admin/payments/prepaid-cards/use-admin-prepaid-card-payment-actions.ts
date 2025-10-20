"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { PrepaidCard } from "@/models/prepaid-card";
import { PaymentStatus } from "@/models/payment-status";

export function useAdminPrepaidCardPaymentActions() {
  const { update } = useStrapiAPI();
  const qc = useQueryClient();

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin", "prepaid-card-payments"] }),
      qc.invalidateQueries({ queryKey: ["bookings"] }),
      qc.invalidateQueries({ queryKey: ["prepaid-cards"] }),
    ]);
  };

  const markPrepaidCardAsPaid = useMutation({
    mutationFn: async (prepaidCard: PrepaidCard) => {
      const obj = new PrepaidCard({
        ...prepaidCard,
        paymentStatus: PaymentStatus.PAID,
      });

      await update({
        ...PrepaidCard.strapiAPIParams,
        object: obj,
        fieldsToUpdate: ["paymentStatus"],
      });

      return obj;
    },
    onSuccess: async () => {
      toast.success("La carte prépayée a été marquée comme payée");
      await invalidateAll();
    },
    onError: () => {
      toast.error("Impossible de marquer la carte comme payée.");
    },
  });

  return {
    markPrepaidCardAsPaid: (card: PrepaidCard) =>
      markPrepaidCardAsPaid.mutateAsync(card),
    isMarkingPrepaidCardAsPaid: markPrepaidCardAsPaid.isPending,
  };
}
