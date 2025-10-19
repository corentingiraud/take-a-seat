"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";
import { BookingStatus } from "@/models/booking-status";
import { PaymentStatus } from "@/models/payment-status";
import { PrepaidCard } from "@/models/prepaid-card";

export function useBookingActions() {
  const { update } = useStrapiAPI();
  const qc = useQueryClient();

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["prepaid-cards"], exact: false }),
      qc.invalidateQueries({ queryKey: ["bookings"], exact: false }),
    ]);
  };

  const cancel = useMutation({
    mutationFn: async (booking: Booking) => {
      const obj = new Booking({
        ...booking,
        bookingStatus: BookingStatus.CANCELLED,
      });

      await update({
        ...Booking.strapiAPIParams,
        object: obj,
        fieldsToUpdate: ["bookingStatus"],
      });

      return obj;
    },
    onSuccess: async () => {
      toast.success("Votre réservation a été annulée");
      await invalidateAll();
    },
    onError: () => toast.error("Annulation impossible"),
  });

  const cancelMany = async (items: Booking[]) => {
    if (!items?.length) return;

    let ok = 0;
    let fail = 0;

    for (const b of items) {
      try {
        await update({
          ...Booking.strapiAPIParams,
          object: new Booking({ ...b, bookingStatus: BookingStatus.CANCELLED }),
          fieldsToUpdate: ["bookingStatus"],
        });
        ok += 1;
      } catch {
        fail += 1;
      }
    }

    if (ok > 0)
      toast.success(
        ok === 1 ? "1 réservation annulée" : `${ok} réservations annulées`,
      );
    if (fail > 0)
      toast.error(
        fail === 1 ? "1 annulation a échoué" : `${fail} annulations ont échoué`,
      );

    await invalidateAll();
  };

  const payManyWithCard = async (items: Booking[], card: PrepaidCard) => {
    if (!items?.length || !card) return;

    if (card.remainingBalance < items.length) {
      toast.error("Solde insuffisant sur la carte");

      return;
    }

    let ok = 0;
    let fail = 0;

    for (const b of items) {
      try {
        await update({
          ...Booking.strapiAPIParams,
          object: new Booking({
            ...b,
            paymentStatus: PaymentStatus.PAID,
            prepaidCard: card,
          }),
          fieldsToUpdate: ["paymentStatus", "prepaidCard"],
        });
        ok += 1;
      } catch {
        fail += 1;
      }
    }

    if (ok > 0)
      toast.success(
        ok === 1 ? "1 réservation payée" : `${ok} réservations payées`,
      );
    if (fail > 0)
      toast.error(
        fail === 1
          ? "Le paiement a échoué pour 1 réservation"
          : `Le paiement a échoué pour ${fail} réservations`,
      );

    await invalidateAll();
  };

  return {
    cancel: (b: Booking) => cancel.mutateAsync(b),
    cancelMany,
    payManyWithCard,
    isCancelling: cancel.isPending,
  };
}
