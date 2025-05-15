import { useMemo } from "react";
import { Moment } from "moment";

import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { User } from "@/models/user";
import { MINIMUM_BOOKING_DURATION } from "@/config/site";

export function useDesiredBookings(
  startDate: Moment,
  endDate: Moment,
  user: User,
  service: Service,
) {
  const desiredBookings = useMemo(() => {
    const bookings: Booking[] = [];
    let currentStart = startDate.clone();

    while (currentStart.isBefore(endDate)) {
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
        currentStart.add(1, "day").hour(service.openingTime.hour).minute(0);
      }

      // Skip Sunday (day 6 is Saturday, day 0 is Sunday)
      if (currentStart.day() === 0) {
        currentStart.add(1, "day").hour(service.openingTime.hour).minute(0);
      }
    }

    return bookings;
  }, [startDate, endDate, user, service]);

  return desiredBookings;
}
