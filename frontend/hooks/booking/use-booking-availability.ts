import { useMemo } from "react";

import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { User } from "@/models/user";

type UnavailableBooking = {
  booking: Booking;
  cause: string;
};

interface UseBookingAvailabilityParams {
  desiredBookings: Booking[];
  existingBookings: Booking[];
  service: Service;
  user: User;
}

export function useBookingAvailability({
  desiredBookings,
  existingBookings,
  service,
  user,
}: UseBookingAvailabilityParams) {
  const { availableBookings, unavailableBookings } = useMemo(() => {
    const availableBookings: Booking[] = [];
    const unavailableBookings: UnavailableBooking[] = [];

    for (const desired of desiredBookings) {
      // Skip if in the past
      if (desired.endDate.isBefore()) continue;

      const overlapping = existingBookings.filter(
        (existing) =>
          desired.startDate.isSameOrAfter(existing.startDate) &&
          desired.endDate.isSameOrBefore(existing.endDate),
      );

      const maxReached =
        overlapping.length >=
        service.findAvailabilityFor(desired.startDate)!.numberOfSeats;

      const userAlreadyBooked = overlapping.some(
        (booking) => booking.user?.id === user.id,
      );

      if (userAlreadyBooked) {
        unavailableBookings.push({
          booking: desired,
          cause: "Vous avez déjà réservé ce créneau",
        });
        continue;
      }

      if (maxReached) {
        unavailableBookings.push({
          booking: desired,
          cause: "Plus de places disponibles",
        });
        continue;
      }

      availableBookings.push(desired);
    }

    return { availableBookings, unavailableBookings };
  }, [desiredBookings, existingBookings, service, user]);

  return { availableBookings, unavailableBookings };
}
