import { useEffect, useState } from "react";
import moment, { Duration, Moment } from "moment";

import { useStrapiAPI } from "./use-strapi-api";

import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { HalfDay } from "@/models/half-day";
import { Time } from "@/models/time";
import { MINIMUM_BOOKING_DURATION } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { AVAILABLE_DURATION } from "@/models/duration";

interface UseBookingAvailabilitiesParams {
  service: Service;
  startDay: Moment;
  duration: Duration;
  startTime?: Time;
  halfDay?: HalfDay;
}

type UnavailableBooking = { cause: string; booking: Booking };

export function useBookingAvailabilities({
  service,
  startDay,
  startTime,
  halfDay,
  duration,
}: UseBookingAvailabilitiesParams) {
  const { fetchAll } = useStrapiAPI();
  const { user } = useAuth();

  const { startDate, endDate } = computeDateRange();
  const desiredBookings = computeDesiredBookings();

  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);
  const [unavailableBookings, setUnavailableBookings] = useState<
    UnavailableBooking[]
  >([]);

  useEffect(() => {
    fetchAll({
      ...Booking.strapiAPIParams,
      queryParams: {
        populate: ["user"],
        filters: {
          service: {
            id: {
              $eq: service.id,
            },
          },
          startDate: {
            $gte: startDate.toDate(),
          },
          endDate: {
            $lte: endDate.toDate(),
          },
        },
      },
    }).then((bookings) => {
      computeAvailableBooking(bookings);
    });
  }, [service, startDay, startTime, halfDay]);

  function computeDateRange(): { startDate: Moment; endDate: Moment } {
    let startDate = startDay.clone();
    let endDate = moment();

    if (duration === AVAILABLE_DURATION.ONE_HOUR && startTime) {
      startDate.hour(startTime.hour);
      endDate = startDate.clone().add(AVAILABLE_DURATION.ONE_HOUR);
    }

    if (duration === AVAILABLE_DURATION.HALF_DAY) {
      if (halfDay === HalfDay.Morning) {
        startDate.hour(service.openingTime.hour);
        endDate = startDate.clone().add(AVAILABLE_DURATION.HALF_DAY);
      }

      if (halfDay === HalfDay.Afternoon) {
        startDate.hour(14);
        endDate = startDate.clone().hour(service.closingTime.hour);
      }
    }

    if (duration === AVAILABLE_DURATION.DAY) {
      startDate.hour(service.openingTime.hour);
      endDate = startDate.clone().hour(service.closingTime.hour);
    }

    return { startDate, endDate };
  }

  function computeDesiredBookings() {
    const desiredBookings: Booking[] = [];

    let currentStartDate = startDate.clone();

    while (currentStartDate < endDate) {
      const nextStartDate = currentStartDate
        .clone()
        .add(MINIMUM_BOOKING_DURATION);

      desiredBookings.push(
        new Booking({
          startDate: currentStartDate.clone(),
          endDate: nextStartDate.clone(),
          user: user!,
          service,
        }),
      );
      currentStartDate = nextStartDate;

      if (currentStartDate.hour() >= service.closingTime.hour) {
        currentStartDate.add(1, "day").hour(service.openingTime.hour);
      }

      if (currentStartDate.day() === 6) {
        currentStartDate.add(2, "day");
      }
    }

    return desiredBookings;
  }

  function computeAvailableBooking(existingBookings: Booking[]) {
    const availableBookings: Booking[] = [];
    const unavailableBookings: UnavailableBooking[] = [];

    for (const desiredBooking of desiredBookings) {
      if (desiredBooking.endDate.isBefore(moment())) continue;

      const existingBookingsAtSameTime = existingBookings.filter(
        (booking) =>
          desiredBooking.startDate.isSameOrAfter(booking.startDate) &&
          desiredBooking.endDate.isSameOrBefore(booking.endDate),
      );

      if (existingBookingsAtSameTime.length >= service.maximumBookingsPerHour) {
        unavailableBookings.push({
          booking: desiredBooking,
          cause: "Plus de place disponible",
        });
        break;
      }

      const maybeExistingBookingForUser = existingBookingsAtSameTime.find(
        (booking) => booking.user?.id === user?.id,
      );

      if (maybeExistingBookingForUser) {
        unavailableBookings.push({
          booking: desiredBooking,
          cause: "Vous avez déjà réserver ce créneau",
        });
        break;
      }

      availableBookings.push(desiredBooking);
    }

    setAvailableBookings(availableBookings);
    setUnavailableBookings(unavailableBookings);
  }

  return {
    availableBookings,
    unavailableBookings,
  };
}
