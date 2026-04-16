import { Moment } from "moment";

import moment from "@/lib/moment";
import { Service } from "@/models/service";
import { HalfDay, HalfDaySelection } from "@/models/half-day";
import { AVAILABLE_DURATION, DurationWrapper } from "@/models/duration";
import { Time } from "@/models/time";
import { BookingSlot } from "@/types";

interface UseDesiredDates {
  startDay?: Moment;
  endDay?: Moment;
  multipleDays?: Moment[];
  duration: DurationWrapper;
  times?: Time[];
  halfDaySelections?: HalfDaySelection[];
  service: Service;
}

export function useDesiredDates({
  startDay,
  endDay,
  multipleDays,
  duration,
  times,
  halfDaySelections,
  service,
}: UseDesiredDates): BookingSlot[] {
  const halfDayDuration = AVAILABLE_DURATION.HALF_DAY;

  // Half day with multiple dates
  if (duration.equals(halfDayDuration) && halfDaySelections && halfDaySelections.length > 0) {
    const slots: BookingSlot[] = [];

    for (const { date, halfDay } of halfDaySelections) {
      const availability = service.findAvailabilityForDate(date);

      if (!availability) continue;

      let start: Moment;
      let end: Moment;

      if (halfDay === HalfDay.Morning) {
        start = availability.getStartTimeFor(date)!;
        end = start.clone().add(halfDayDuration.getDuration());
      } else {
        end = availability.getEndTimeFor(date)!;
        start = end.clone().subtract(halfDayDuration.getDuration());
      }

      slots.push({ start, end });
    }

    return slots;
  }

  // Single day (time-based)
  if (duration.isSingleDay && startDay) {
    let start = startDay!.clone();
    let end = moment();

    const halfHour = AVAILABLE_DURATION.HALF_HOUR;
    const oneHour = AVAILABLE_DURATION.ONE_HOUR;

    if (times && times?.length > 0) {
      start.hour(times[0].hour).minute(times[0].minute).second(0);
      end = start
        .clone()
        .hour(times[times.length - 1].hour)
        .minute(times[times.length - 1].minute);

      // Half hour
      if (duration.equals(halfHour)) {
        end.add(halfHour.getDuration());
      }

      // One hour
      if (duration.equals(oneHour)) {
        end.add(oneHour.getDuration());
      }
    }

    return [{ start, end }];
  }

  // Date range
  const desiredDates = [];

  if (duration.equals(AVAILABLE_DURATION.RANGE_OF_DATES) && endDay) {
    const currentDay = startDay!.clone();

    while (currentDay.isSameOrBefore(endDay)) {
      const availability = service.findAvailabilityForDate(currentDay);

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
      const timeSlots = availability.getBookingSlotsFor(currentDay);

      desiredDates.push(...timeSlots);
      currentDay.add(1, "day");
    }
  }

  // Multiple date
  if (duration.equals(AVAILABLE_DURATION.MULTIPLE_DATES) && multipleDays) {
    for (const day of multipleDays) {
      const availability = service.findAvailabilityForDate(day);

      if (!availability) continue;

      const timeSlots = availability.getBookingSlotsFor(day);

      desiredDates.push(...timeSlots);
    }
  }

  return desiredDates;
}
