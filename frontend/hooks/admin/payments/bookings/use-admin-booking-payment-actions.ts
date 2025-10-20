"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";
import { PaymentStatus } from "@/models/payment-status";
import { PrepaidCard } from "@/models/prepaid-card";

export function useAdminBookingPaymentActions() {
  const { update } = useStrapiAPI();
  const qc = useQueryClient();

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin", "booking-payments"] }),
      qc.invalidateQueries({ queryKey: ["bookings"] }),
      qc.invalidateQueries({ queryKey: ["prepaid-cards"] }),
    ]);
  };

  const markBookingsAsPaid = useMutation({
    mutationFn: async (args: {
      bookings: Booking[];
      prepaidCard?: PrepaidCard;
    }) => {
      const { bookings, prepaidCard } = args;

      if (!bookings?.length) return { ok: 0, fail: 0 };

      let ok = 0;
      let fail = 0;

      for (const booking of bookings) {
        try {
          const obj = new Booking({
            ...booking,
            paymentStatus: PaymentStatus.PAID,
            ...(prepaidCard ? { prepaidCard } : {}),
          });

          await update({
            ...Booking.strapiAPIParams,
            object: obj,
            fieldsToUpdate: prepaidCard
              ? ["paymentStatus", "prepaidCard"]
              : ["paymentStatus"],
          });
          ok += 1;
        } catch {
          fail += 1;
        }
      }

      return { ok, fail, prepaidCard, total: bookings.length };
    },
    onSuccess: async ({ ok, fail, prepaidCard, total }) => {
      if (ok > 0) {
        const method = prepaidCard ? "(carte prépayée)" : "(CB / espèce)";

        toast.success(
          total === 1
            ? `La réservation a été marquée comme payée ${method}`
            : `Les réservations ont été marquées comme payées ${method}`,
        );
      }
      if (fail > 0) {
        toast.error(
          fail === 1
            ? "Échec pour 1 réservation."
            : `Échec pour ${fail} réservations.`,
        );
      }
      await invalidateAll();
    },
    onError: () => {
      toast.error("Impossible de marquer les réservations comme payées.");
    },
  });

  return {
    markBookingsAsPaid: (bookings: Booking[], prepaidCard?: PrepaidCard) =>
      markBookingsAsPaid.mutateAsync({ bookings, prepaidCard }),
    isMarkingBookingsAsPaid: markBookingsAsPaid.isPending,
  };
}
