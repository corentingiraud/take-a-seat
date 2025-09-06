import { Badge } from "@/components/ui/badge";
import { Booking } from "@/models/booking";
import { BookingStatus } from "@/models/booking-status";

interface BookingStatusBadgeProps {
  booking: Booking;
}

export function BookingStatusBadge({ booking }: BookingStatusBadgeProps) {
  if (booking.isPast) {
    return (
      <Badge className="bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700">
        Passée
      </Badge>
    );
  }

  switch (booking.bookingStatus) {
    case BookingStatus.PENDING:
      return (
        <Badge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800">
          En cours de validation
        </Badge>
      );
    case BookingStatus.CONFIRMED:
      return (
        <Badge className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800">
          Confirmée
        </Badge>
      );
    case BookingStatus.CANCELLED:
      return (
        <Badge className="bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800">
          Annulée
        </Badge>
      );
    default:
      return null;
  }
}
