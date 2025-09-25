import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { User } from "@/models/user";
import { BookingSlot } from "@/types";

interface UseDesiredBookingsParams {
  times?: Time[];
  desiredDates: BookingSlot[];
  user: User;
  service: Service;
}

export function useDesiredBookings({
  times,
  desiredDates,
  user,
  service,
}: UseDesiredBookingsParams) {
  const bookings: Booking[] = [];

  // Times
  if (times && times?.length > 0) {
    const date = desiredDates[0].start;

    for (const time of times) {
      const startDate = date.clone().hour(time.hour).minute(time.minute);

      const booking = new Booking({
        startDate: date.clone().hour(time.hour).minute(time.minute),
        endDate: startDate.add(service.bookingDuration, "minutes"),
        user,
        service,
      });

      bookings.push(booking);
    }

    return bookings;
  }

  // Others
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
