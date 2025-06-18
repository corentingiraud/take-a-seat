import moment, { Moment } from "moment";

import { Service } from "@/models/service";
import { HalfDay } from "@/models/half-day";
import { AVAILABLE_DURATION, DurationWrapper } from "@/models/duration";
import { Time } from "@/models/time";
import { DesiredBookingDates } from "@/types";

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
}: UseDesiredDates): DesiredBookingDates {
  // Single day
  if (duration.isSingleDay) {
    let startDate = startDay.clone();
    let endDate = moment();

    const oneHour = AVAILABLE_DURATION.ONE_HOUR;
    const halfDayDuration = AVAILABLE_DURATION.HALF_DAY;

    if (duration.equals(oneHour) && startTime) {
      startDate.hour(startTime.hour).minute(0).second(0);
      endDate = startDate.clone().add(oneHour.getDuration());
    }

    if (duration.equals(halfDayDuration)) {
      if (halfDay === HalfDay.Morning) {
        startDate.hour(service.openingTime.hour).minute(0);
        endDate = startDate.clone().add(halfDayDuration.getDuration());
      }

      if (halfDay === HalfDay.Afternoon) {
        startDate.hour(14).minute(0);
        endDate = startDate.clone().hour(service.closingTime.hour).minute(0);
      }
    }

    return [{ startDate, endDate }];
  }

  // Date range
  const desiredDates = [];

  if (duration.equals(AVAILABLE_DURATION.RANGE_OF_DATES) && endDay) {
    let currentDay = startDay.clone();

    while (currentDay.isSameOrBefore(endDay)) {
      let startDate = currentDay
        .clone()
        .hour(service.openingTime.hour)
        .minute(0);
      let endDate = currentDay.clone().hour(service.closingTime.hour).minute(0);

      desiredDates.push({ startDate, endDate });

      currentDay.add(1, "day");
    }
  }

  // Multiple date
  if (duration.equals(AVAILABLE_DURATION.MULTIPLE_DATES) && multipleDays) {
    for (const day of multipleDays) {
      let startDate = day.clone().hour(service.openingTime.hour).minute(0);
      let endDate = day.clone().hour(service.closingTime.hour).minute(0);

      desiredDates.push({ startDate, endDate });
    }
  }

  return desiredDates;
}
