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

interface BookingActionMenuProps {
  booking: Booking;
  onPayWithCard?: (booking: Booking) => void;
}

export function BookingActionMenu({ booking, onPayWithCard }: BookingActionMenuProps) {
  const { user: authUser } = useAuth();

  const { cancel, isCancelling } = useBookingActions();
  const confirm = useConfirm();

  const canCancel = booking.isCancelable(authUser?.role);
  const canPay = booking.paymentStatus === "PENDING";
  const hasAnyAction = canCancel || canPay;

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Annuler la réservation ?",
      description: "Cette action est irréversible.",
    });

    if (!confirmed) return;

    await cancel(booking);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-disabled={!hasAnyAction || isCancelling}
          disabled={!hasAnyAction || isCancelling}
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
                disabled={isCancelling}
                onClick={handleCancel}
              >
                Annuler
              </DropdownMenuItem>
            )}

            {canPay && (
              <DropdownMenuItem
                className="text-green-600"
                disabled={isCancelling}
                onClick={() => onPayWithCard?.(booking)}
              >
                Payer avec une carte prépayée
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
