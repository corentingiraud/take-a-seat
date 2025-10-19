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
import { useBooking } from "@/contexts/booking-context";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { UserPrepaidCardDialog } from "@/components/prepaid-cards/user-prepaid-card-dialog";
import { PrepaidCard } from "@/models/prepaid-card";
import { User } from "@/models/user";

interface BookingActionMenuProps {
  user?: User;
  booking: Booking;
}

export function BookingActionMenu({ booking, user }: BookingActionMenuProps) {
  const { cancel, isLoading, payManyWithCard } = useBooking();
  const confirm = useConfirm();
  const [isPrepaidDialogOpen, setIsPrepaidDialogOpen] = useState(false);

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Annuler la réservation ?",
      description: "Cette action est irréversible.",
    });

    if (confirmed) {
      await cancel(booking);
    }
  };

  const handleConfirmPrepaid = async (card: PrepaidCard) => {
    await payManyWithCard([booking], card);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button disabled={isLoading} size="icon" variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {booking.isCancelable && (
            <DropdownMenuItem
              className="text-red-600"
              disabled={isLoading}
              onClick={handleCancel}
            >
              Annuler
            </DropdownMenuItem>
          )}

          {booking.paymentStatus === "PENDING" && (
            <DropdownMenuItem
              className="text-green-600"
              disabled={isLoading}
              onClick={() => setIsPrepaidDialogOpen(true)}
            >
              Payer avec une carte prépayée
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
