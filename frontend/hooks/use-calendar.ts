"use client";

import { Moment } from "moment";
import moment from '@/lib/moment';
import { useQuery } from "@tanstack/react-query";
import { CoworkingSpace } from "@/models/coworking-space";
import { API_URL } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { Time } from "@/models/time";
import { Booking } from "@/models/booking";

type UseCalendarParams = {
  coworkingSpaceId?: string;
  startDate: Moment;
  endDate: Moment;
};

export function useCalendar({ coworkingSpaceId, startDate, endDate }: UseCalendarParams) {
  const { getJWT } = useAuth();

  const query = useQuery({
    queryKey: [
      "calendar",
      coworkingSpaceId,
      startDate.format("YYYY-MM-DD"),
      endDate.format("YYYY-MM-DD"),
    ],
    enabled: !!coworkingSpaceId,
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }).toString();

      const token = getJWT();

      const response = await fetch(
        `${API_URL}/coworking-spaces/${coworkingSpaceId}/calendar?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      const json = await response.json();
      return CoworkingSpace.fromJson(json);
    },
  });

  const coworkingSpace = query.data;

  // All unavailabilities in the displayed date range
  const unavailabilities =
    coworkingSpace?.findUnavailabilitiesForDateRange(startDate, endDate) || [];

  // Compute minHour / maxHour / slotDuration / whether weekend is displayed
  let minHour = new Time(9, 0);
  let maxHour = new Time(18, 0);
  let slotDuration = 60;
  let displayWeekend = false;

  for (const service of coworkingSpace?.services || []) {
    // Use the smallest booking duration as slot duration
    if (service.bookingDuration < slotDuration) {
      slotDuration = service.bookingDuration;
    }

    const availabilities = service.findAvailabilitiesForDateRange(startDate, endDate);

    for (const availability of availabilities) {
      const earliest = availability.earliestOpeningOfWeek;
      const latest = availability.latestClosingOfTheWeek;

      if (earliest && earliest.isBefore(minHour)) {
        minHour = earliest;
      }

      if (latest && latest.isAfter(maxHour)) {
        maxHour = latest;
      }

      // If any availability contains a weekend day, we allow weekend display
      for (const day of availability.getAvailableDaysOfWeek(startDate)) {
        const wd = day.weekday(); // 0 = Sunday, 6 = Saturday
        if (wd === 0 || wd === 6) {
          displayWeekend = true;
        }
      }
    }
  }

  // Build the list of displayed days (weekdays + optional weekend)
  const weekdays: Moment[] = [];
  const d = startDate.clone();
  while (d.isSameOrBefore(endDate, "day")) {
    const wd = d.weekday();

    // If it's Saturday or Sunday, only include if displayWeekend is true
    if (wd === 0 || wd === 6) {
      if (displayWeekend) {
        weekdays.push(d.clone());
      }
    } else {
      weekdays.push(d.clone());
    }

    d.add(1, "day");
  }

  // Compute time slots as Time instances
  const hours: Time[] = [];
  // Work in minutes to avoid relying on unknown methods in Time
  const minTotalMinutes = minHour.hour * 60 + minHour.minute;
  const maxTotalMinutes = maxHour.hour * 60 + maxHour.minute;

  for (let m = minTotalMinutes; m < maxTotalMinutes; m += slotDuration) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    hours.push(new Time(h, mm));
  }

  // Check if a specific slot is unavailable
  function isUnavailable(day: Moment, time: Time) {
    const slotMoment = day.clone().hour(time.hour).minute(time.minute);
    return unavailabilities.some((u) => u.contains(slotMoment));
  }

  // Find availability object for a specific slot
  function findAvailability(day: Moment, time: Time) {
    if (!coworkingSpace) return null;

    const slotMoment = day.clone().hour(time.hour).minute(time.minute);

    for (const s of coworkingSpace.services) {
      const avs = s.findAvailabilitiesForDateRange(startDate, endDate);
      for (const av of avs) {
        if (av.contains(slotMoment)) {
          return av;
        }
      }
    }

    return null;
  }

  function getBookings(start: Moment, end: Moment) {
    if (!coworkingSpace) return [];

    const out: Booking[] = [];

    for (const service of coworkingSpace.services) {
      for (const booking of service.bookings) {
        const bStart = moment(booking.startDate);
        const bEnd = moment(booking.endDate);

        const overlap =
          bStart.isBefore(end) && bEnd.isAfter(start);

        if (overlap) {
          out.push(booking);
        }
      }
    }

    return out;
  }

  const COLOR_LIST = ["blue", "green", "yellow", "purple", "red"];
  const serviceColorMap: Record<string, string> = {};

  if (coworkingSpace) {
    const services = coworkingSpace.services || [];

    services.forEach((service, index) => {
      const color = COLOR_LIST[index % COLOR_LIST.length];
      serviceColorMap[service.documentId] = color;
    });
  }

  return {
    isLoading: query.isLoading,
    coworkingSpace,
    unavailabilities,
    weekdays,
    minHour,
    maxHour,
    slotDuration,
    hours,
    serviceColorMap,
    isUnavailable,
    findAvailability,
    getBookings,
    reload: query.refetch,
  };
}
