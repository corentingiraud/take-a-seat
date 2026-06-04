"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Booking } from "@/models/booking";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { useBookingActions } from "@/hooks/bookings/use-booking-actions";
import { useAuth } from "@/contexts/auth-context";
import { useAdminBookingPaymentActions } from "@/hooks/admin/payments/bookings/use-admin-booking-payment-actions";

interface BookingActionMenuProps {
  booking: Booking;
  onPayWithCard?: (booking: Booking) => void;
}

export function BookingActionMenu({ booking, onPayWithCard }: BookingActionMenuProps) {
  const { user: authUser, isSuperAdmin } = useAuth();

  const { cancel, isCancelling } = useBookingActions();
  const { markBookingsAsPaid, isMarkingBookingsAsPaid } =
    useAdminBookingPaymentActions();
  const confirm = useConfirm();

  const canCancel = booking.isCancelable(authUser?.role);
  const canPay = booking.paymentStatus === "PENDING";
  const canMarkExternalPaid = isSuperAdmin && canPay;
  const isBusy = isCancelling || isMarkingBookingsAsPaid;
  const hasAnyAction = canCancel || canPay || canMarkExternalPaid;

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Annuler la réservation ?",
      description: "Cette action est irréversible.",
    });

    if (!confirmed) return;

    await cancel(booking);
  };

  const handleMarkExternalPaid = async () => {
    const confirmed = await confirm({
      title: "Marquer comme payée (CB / espèce) ?",
      description:
        "Cette réservation sera enregistrée comme payée (CB / espèce).",
    });

    if (!confirmed) return;

    await markBookingsAsPaid([booking]);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-disabled={!hasAnyAction || isBusy}
          disabled={!hasAnyAction || isBusy}
          size="icon"
          title={!hasAnyAction ? "Aucune action disponible" : undefined}
          variant="outline"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {hasAnyAction ? (
          <>
            {canCancel && (
              <DropdownMenuItem
                className="text-red-600"
                disabled={isBusy}
                onClick={handleCancel}
              >
                Annuler
              </DropdownMenuItem>
            )}

            {canPay && (
              <DropdownMenuItem
                className="text-green-600"
                disabled={isBusy}
                onClick={() => onPayWithCard?.(booking)}
              >
                Payer avec une carte prépayée
              </DropdownMenuItem>
            )}

            {canMarkExternalPaid && (
              <DropdownMenuItem
                className="text-green-600"
                disabled={isBusy}
                onClick={handleMarkExternalPaid}
              >
                Marquer comme payée (CB / espèce)
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground">
            Aucune action disponible
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
