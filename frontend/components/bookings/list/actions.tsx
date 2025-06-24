import { Button } from "@/components/ui/button";
import { Booking } from "@/models/booking";
import { useBooking } from "@/contexts/booking-context";
import { BookingStatus } from "@/models/booking-status";
import { useConfirm } from "@/contexts/confirm-dialog-context";

interface BookingActionMenuProps {
  booking: Booking;
}

export function BookingActionMenu({ booking }: BookingActionMenuProps) {
  const { cancel } = useBooking();
  const confirm = useConfirm();

  const handleCancel = async (booking: Booking) => {
    const confirmed = await confirm({
      title: "Annuler la réservation ?",
      description:
        "Es-tu sûr de vouloir annuler cette réservation ? Cette action est irréversible.",
      confirmText: "Oui",
      cancelText: "Non",
    });

    if (confirmed) {
      cancel(booking);
    }
  };

  return (
    booking.bookingStatus === BookingStatus.PENDING ||
    (booking.bookingStatus === BookingStatus.CONFIRMED && (
      <Button variant="destructive" onClick={() => handleCancel(booking)}>
        Annuler
      </Button>
    ))
  );
}
