import { MoreHorizontal } from "lucide-react";

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

interface BookingActionMenuProps {
  booking: Booking;
}

export function BookingActionMenu({ booking }: BookingActionMenuProps) {
  const { cancel, isLoading } = useBooking();
  const confirm = useConfirm();

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Annuler la réservation ?",
      description: "Cette action est irréversible.",
    });

    if (confirmed) {
      await cancel(booking);
    }
  };

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
