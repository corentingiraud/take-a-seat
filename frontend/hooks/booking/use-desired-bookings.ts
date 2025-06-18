import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { User } from "@/models/user";
import { MINIMUM_BOOKING_DURATION } from "@/config/site";
import { DesiredBookingDates } from "@/types";

export function useDesiredBookings(
  desiredDates: DesiredBookingDates,
  user: User,
  service: Service,
) {
  const bookings: Booking[] = [];

  for (const dates of desiredDates) {
    let currentStart = dates.startDate.clone();

    if (currentStart.hour() < service.openingTime.hour) {
      currentStart.hour(service.openingTime.hour);
    }

    // Skip Saturday & Sunday
    if (currentStart.day() === 6 || currentStart.day() === 0) {
      continue;
    }

    while (currentStart.isBefore(dates.endDate)) {
      const nextStart = currentStart.clone().add(MINIMUM_BOOKING_DURATION);

      const booking = new Booking({
        startDate: currentStart.clone(),
        endDate: nextStart.clone(),
        user,
        service,
      });

      bookings.push(booking);

      currentStart = nextStart;

      // Skip if we go past the closing time
      if (currentStart.hour() >= service.closingTime.hour) {
        break;
      }
    }
  }

  return bookings;
}
