import { Moment } from "moment";

import moment from "@/lib/moment";
import { Service } from "@/models/service";
import { HalfDay } from "@/models/half-day";
import { AVAILABLE_DURATION, DurationWrapper } from "@/models/duration";
import { Time } from "@/models/time";
import { BookingSlot } from "@/types";

interface UseDesiredDates {
  startDay: Moment;
  endDay?: Moment;
  multipleDays?: Moment[];
  duration: DurationWrapper;
  startTime?: Time;
  halfDay?: HalfDay;
  service: Service;
}

export function useDesiredDates({
  startDay,
  endDay,
  multipleDays,
  duration,
  startTime,
  halfDay,
  service,
}: UseDesiredDates): BookingSlot[] {
  // Single day
  if (duration.isSingleDay) {
    let start = startDay.clone();
    let end = moment();

    const oneHour = AVAILABLE_DURATION.ONE_HOUR;
    const halfDayDuration = AVAILABLE_DURATION.HALF_DAY;

    // One hour
    if (duration.equals(oneHour) && startTime) {
      start.hour(startTime.hour).minute(0).second(0);
      end = start.clone().add(oneHour.getDuration());
    }

    // Half day
    if (duration.equals(halfDayDuration)) {
      // Morning
      if (halfDay === HalfDay.Morning) {
        start = service.findAvailabilityFor(start)!.getStartTimeFor(start)!;
        end = start.clone().add(halfDayDuration.getDuration());
      }

      // Afternoon
      if (halfDay === HalfDay.Afternoon) {
        end = service.findAvailabilityFor(start)!.getEndTimeFor(start)!;
        start = end.clone().subtract(halfDayDuration.getDuration());
      }
    }

    return [{ start, end }];
  }

  // Date range
  const desiredDates = [];

  if (duration.equals(AVAILABLE_DURATION.RANGE_OF_DATES) && endDay) {
    let currentDay = startDay.clone();

    while (currentDay.isSameOrBefore(endDay)) {
      const availability = service.findAvailabilityFor(currentDay);

      if (!availability) continue;

      // Check if unavailabilities
      for (const { startDate, endDate } of service.coworkingSpace
        ?.unavailabilities || []) {
        if (
          currentDay.isSameOrBefore(endDate) &&
          currentDay.isSameOrAfter(startDate)
        ) {
          continue;
        }
      }
      let timeSlots = availability.getBookingSlotsFor(currentDay);

      desiredDates.push(...timeSlots);
      currentDay.add(1, "day");
    }
  }

  // Multiple date
  if (duration.equals(AVAILABLE_DURATION.MULTIPLE_DATES) && multipleDays) {
    for (const day of multipleDays) {
      const availability = service.findAvailabilityFor(day);

      if (!availability) continue;

      let timeSlots = availability.getBookingSlotsFor(day);

      desiredDates.push(...timeSlots);
    }
  }

  return desiredDates;
}
