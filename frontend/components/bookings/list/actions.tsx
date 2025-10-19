"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Booking } from "@/models/booking";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { UserPrepaidCardDialog } from "@/components/prepaid-cards/user-prepaid-card-dialog";
import { PrepaidCard } from "@/models/prepaid-card";
import { User } from "@/models/user";
import { useBookingActions } from "@/hooks/bookings/use-booking-actions";

interface BookingActionMenuProps {
  user?: User;
  booking: Booking;
}

export function BookingActionMenu({ booking, user }: BookingActionMenuProps) {
  const { cancel, payManyWithCard, isCancelling } = useBookingActions();
  const confirm = useConfirm();

  const [isPrepaidDialogOpen, setIsPrepaidDialogOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const canCancel = booking.isCancelable;
  const canPay = booking.paymentStatus === "PENDING";
  const hasAnyAction = canCancel || canPay;

  const loading = isCancelling || isPaying;

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Annuler la réservation ?",
      description: "Cette action est irréversible.",
    });

    if (!confirmed) return;

    await cancel(booking);
  };

  const handleConfirmPrepaid = async (card: PrepaidCard) => {
    try {
      setIsPaying(true);
      await payManyWithCard([booking], card);
    } finally {
      setIsPaying(false);
      setIsPrepaidDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-disabled={!hasAnyAction || loading}
            disabled={!hasAnyAction || loading}
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
                  disabled={loading}
                  onClick={handleCancel}
                >
                  Annuler
                </DropdownMenuItem>
              )}

              {canPay && (
                <DropdownMenuItem
                  className="text-green-600"
                  disabled={loading}
                  onClick={() => setIsPrepaidDialogOpen(true)}
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

      <UserPrepaidCardDialog
        autoSelectBest
        open={isPrepaidDialogOpen}
        userDocumentId={user?.documentId}
        onConfirm={handleConfirmPrepaid}
        onOpenChange={setIsPrepaidDialogOpen}
      />
    </>
  );
}
