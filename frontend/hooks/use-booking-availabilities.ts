import { useEffect, useState } from "react";
import moment, { Duration, Moment } from "moment";
import { toast } from "sonner";

import { useStrapiAPI } from "./use-strapi-api";

import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { HalfDay } from "@/models/half-day";
import { Time } from "@/models/time";
import { API_URL, MINIMUM_BOOKING_DURATION } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { AVAILABLE_DURATION } from "@/models/duration";
import { DEFAULT_DATE_FORMAT } from "@/models/utils/strapi-data";

interface UseBookingAvailabilitiesParams {
  service: Service;
  startDay: Moment;
  endDay?: Moment;
  duration: Duration;
  startTime?: Time;
  halfDay?: HalfDay;
}

type UnavailableBooking = { cause: string; booking: Booking };

export function useBookingAvailabilities({
  service,
  startDay,
  endDay,
  startTime,
  halfDay,
  duration,
}: UseBookingAvailabilitiesParams) {
  const { fetchAll } = useStrapiAPI();
  const { user, getJWT } = useAuth();

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

  async function bulkCreateAvailableBookings() {
    try {
      const url = `${API_URL}/${Booking.contentType}/bulk-create`;
      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const body = availableBookings.map((booking) => ({
        startDate: booking.startDate.format(),
        endDate: booking.endDate.format(),
        service: booking.service?.documentId,
      }));

      const token = getJWT();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const jsonResponse = await response.json();

      let message =
        "Votre réservation a bien été enregistrée. Elle doit néanmoins être validée par un administrateur.";

      if (availableBookings.length > 1) {
        message =
          "Vos réservations ont bien été enregistrées. Elles doivent néanmoins être validées par un administrateur.";
      }
      toast.success(message);
    } catch (error) {
      toast.error("Une erreur est survennue, merci d'éssayer à nouveau");
      throw error;
    }
  }

  function computeDateRange(): { startDate: Moment; endDate: Moment } {
    let startDate = startDay.clone();
    let endDate = moment();

    if (duration === AVAILABLE_DURATION.ONE_HOUR.getDuration() && startTime) {
      startDate.hour(startTime.hour);
      endDate = startDate
        .clone()
        .add(AVAILABLE_DURATION.ONE_HOUR.getDuration());
    }

    if (duration === AVAILABLE_DURATION.HALF_DAY.getDuration()) {
      if (halfDay === HalfDay.Morning) {
        startDate.hour(service.openingTime.hour);
        endDate = startDate
          .clone()
          .add(AVAILABLE_DURATION.HALF_DAY.getDuration());
      }

      if (halfDay === HalfDay.Afternoon) {
        startDate.hour(14);
        endDate = startDate.clone().hour(service.closingTime.hour);
      }
    }

    if (duration === null && endDay) {
      startDate.hour(service.openingTime.hour);
      endDate = endDay.clone().hour(service.closingTime.hour);
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
    bulkCreateAvailableBookings,
  };
}
