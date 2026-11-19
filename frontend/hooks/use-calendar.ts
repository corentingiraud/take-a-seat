"use client";

import { Moment } from "moment";
import { useCoworkingSpaceCalendar } from "@/hooks/use-coworking-space-calendar";
import { Time } from "@/models/time";
import { Availability } from "@/models/availability";

type UseCalendarParams = {
  coworkingSpaceId?: string;
  startDate: Moment;
  endDate: Moment;
};

export function useCalendar({ coworkingSpaceId, startDate, endDate }: UseCalendarParams) {
  const query = useCoworkingSpaceCalendar({ coworkingSpaceId, startDate, endDate });

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
        const wd = day.weekday();
        if (wd === 5 || wd === 6) {
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
    if (wd === 5 || wd === 6) {
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
  function findAvailability(day: Moment, time: Time): Availability | null {
    if (!coworkingSpace) return null;

    const slotMoment = day.clone().hour(time.hour).minute(time.minute).add(1, "minute");

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

  // Check if there's availability before AND after a given time slot (same day)
  // This is used to display "Pause" instead of "Fermé"
  function hasAvailabilityBeforeAndAfter(day: Moment, time: Time): boolean {
    if (!coworkingSpace) return false;

    const currentSlotMinutes = time.hour * 60 + time.minute;
    let hasBefore = false;
    let hasAfter = false;

    for (const slotTime of hours) {
      const slotMinutes = slotTime.hour * 60 + slotTime.minute;
      if (slotMinutes === currentSlotMinutes) continue;

      const availability = findAvailability(day, slotTime);
      if (availability) {
        if (slotMinutes < currentSlotMinutes) {
          hasBefore = true;
        } else {
          hasAfter = true;
        }
      }

      if (hasBefore && hasAfter) return true;
    }

    return hasBefore && hasAfter;
  }

  function getBookings(start: Moment, end: Moment) {
    return coworkingSpace?.bookingsOverlapping(start, end) ?? [];
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
    hasAvailabilityBeforeAndAfter,
    getBookings,
    reload: query.refetch,
  };
}
