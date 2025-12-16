import { useMemo } from "react";

import moment from "@/lib/moment";
import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { User } from "@/models/user";
import { useAuth } from "@/contexts/auth-context";

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
  const { isSuperAdmin } = useAuth();

  const { availableBookings, unavailableBookings } = useMemo(() => {
    const availableBookings: Booking[] = [];
    const unavailableBookings: UnavailableBooking[] = [];

    for (const desired of desiredBookings) {
      // Skip if before start of day
      if (!isSuperAdmin && desired.endDate.isBefore(moment().startOf("day"))) continue;

      const coworkingSpace = service.coworkingSpace;

      // ⛔ coworking space unavailable (priorité absolue)
      if (coworkingSpace) {
        const isSpaceUnavailable = coworkingSpace.unavailabilities.some(
          (u) => u.overlaps(desired.startDate, desired.endDate),
        );

        if (isSpaceUnavailable) {
          unavailableBookings.push({
            booking: desired,
            cause: "Espace de coworking fermé sur ce créneau",
          });
          continue;
        }
      }

      const overlapping = existingBookings.filter(
        (existing) =>
          desired.startDate.isSameOrAfter(existing.startDate) &&
          desired.endDate.isSameOrBefore(existing.endDate),
      );

      const maxReached =
        overlapping.length >=
        service.findAvailabilityForDate(desired.startDate)!.numberOfSeats;

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
  }, [desiredBookings, existingBookings, service, user, isSuperAdmin]);

  return { availableBookings, unavailableBookings };
}
