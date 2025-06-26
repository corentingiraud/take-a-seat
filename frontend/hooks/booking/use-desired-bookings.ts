import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { User } from "@/models/user";
import { BookingSlot } from "@/types";

export function useDesiredBookings(
  desiredDates: BookingSlot[],
  user: User,
  service: Service,
) {
  const bookings: Booking[] = [];

  for (const dates of desiredDates) {
    let currentStart = dates.start.clone();

    while (currentStart.isBefore(dates.end)) {
      const nextStart = currentStart
        .clone()
        .add(service.bookingDuration, "minutes");

      const booking = new Booking({
        startDate: currentStart.clone(),
        endDate: nextStart.clone(),
        user,
        service,
      });

      bookings.push(booking);

      currentStart = nextStart;
    }
  }

  return bookings;
}
