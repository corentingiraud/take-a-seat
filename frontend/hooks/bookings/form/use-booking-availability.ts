import { useMemo } from "react";

import moment from "@/lib/moment";
import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { User } from "@/models/user";
import { useAuth } from "@/contexts/auth-context";
import { usePrepaidCard } from "@/hooks/use-prepaid-cards";

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

  // Same react-query key as the booking dialog, so this is a deduplicated read.
  const { usablePrepaidCards } = usePrepaidCard({
    userDocumentId: user?.documentId,
    // The whole batch is paid with one card, so it must cover every desired date —
    // same reason restrictedHours below is computed on desiredBookings.
    bookingDates: desiredBookings.map((booking) => booking.startDate),
  });

  const hasUsableCard = usablePrepaidCards.length > 0;
  const maxUsableBalance = usablePrepaidCards.reduce(
    (max, card) => Math.max(max, card.remainingBalance),
    0,
  );

  const { availableBookings, unavailableBookings } = useMemo(() => {
    const availableBookings: Booking[] = [];
    const unavailableBookings: UnavailableBooking[] = [];

    // Hours needed to cover every restricted slot of the selection. Computed on the
    // desired slots so the requirement does not depend on the filtering below.
    const restrictedHours = service.hoursFor(
      desiredBookings.filter(
        (booking) =>
          service.findAvailabilityForDate(booking.startDate)?.prepaidCardOnly,
      ).length,
    );

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

      const availability = service.findAvailabilityForDate(desired.startDate)!;

      const overlapping = existingBookings.filter(
        (existing) =>
          desired.startDate.isSameOrAfter(existing.startDate) &&
          desired.endDate.isSameOrBefore(existing.endDate),
      );

      const maxReached = overlapping.length >= availability.numberOfSeats;

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

      if (availability.prepaidCardOnly && !isSuperAdmin) {
        if (!hasUsableCard) {
          unavailableBookings.push({
            booking: desired,
            cause: "Créneau réservé aux détenteurs d'une carte pré-payée",
          });
          continue;
        }

        if (maxUsableBalance < restrictedHours) {
          unavailableBookings.push({
            booking: desired,
            cause: "Solde de carte pré-payée insuffisant pour ce créneau",
          });
          continue;
        }
      }

      availableBookings.push(desired);
    }

    return { availableBookings, unavailableBookings };
  }, [
    desiredBookings,
    existingBookings,
    service,
    user,
    isSuperAdmin,
    hasUsableCard,
    maxUsableBalance,
  ]);

  // A restricted slot can only be booked with the card that grants access to it.
  const prepaidCardRequired =
    !isSuperAdmin &&
    availableBookings.some(
      (booking) =>
        service.findAvailabilityForDate(booking.startDate)?.prepaidCardOnly,
    );

  return { availableBookings, unavailableBookings, prepaidCardRequired };
}
