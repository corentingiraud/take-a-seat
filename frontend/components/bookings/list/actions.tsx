import { Button } from "@/components/ui/button";
import { Booking } from "@/models/booking";
import { useBooking } from "@/contexts/booking-context";
import { BookingStatus } from "@/models/booking-status";

interface BookingActionMenuProps {
  booking: Booking;
}

export function BookingActionMenu({ booking }: BookingActionMenuProps) {
  const { cancel } = useBooking();

  return (
    booking.bookingStatus === BookingStatus.PENDING && (
      <Button variant="destructive" onClick={() => cancel(booking)}>
        Annuler
      </Button>
    )
  );
}
