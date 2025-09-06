import { Moment } from "moment";

import moment from "@/lib/moment";
import { HalfDay } from "@/models/half-day";
import { Unavailability } from "@/models/unavailability";
import { Service } from "@/models/service";
import { AVAILABLE_DURATION } from "@/models/duration";

export function isHalfDayAvailable(
  date: Moment,
  halfDay: HalfDay,
  unavailabilities: Unavailability[],
  service: Service,
): boolean {
  const now = moment();
  const halfDayDuration = AVAILABLE_DURATION.HALF_DAY.getDuration()!;

  // Find availability covering the given date
  const availability = service.findAvailabilityFor(date);

  if (!availability) return false;

  // Define start and end times for morning/afternoon
  let start: Moment;

  if (halfDay === HalfDay.Morning) {
    const opening = availability.getStartTimeFor(date);

    if (!opening) return false;

    start = moment.max(opening, date.clone().hour(0).minute(0)).second(0);

    // Morning must end no later than 13:00
    if (
      start
        .clone()
        .add(halfDayDuration)
        .isAfter(date.clone().hour(13).minute(0))
    )
      return false;
  } else {
    const closingTime = availability.getEndTimeFor(date);

    if (!closingTime) return false;

    const afternoonStart = closingTime.clone().subtract(halfDayDuration);

    // Afternoon must not start before 13:00
    if (afternoonStart.isBefore(date.clone().hour(13).minute(0))) return false;

    start = afternoonStart;
  }

  const end = start.clone().add(halfDayDuration);

  // Rule 1: If the half-day is today and end is past, it's not available
  if (date.isSame(now, "day") && now.isAfter(end)) {
    return false;
  }

  // Rule 2: Must not overlap with unavailabilities
  for (const { startDate, endDate } of unavailabilities) {
    if (start.isBefore(moment(endDate)) && end.isAfter(moment(startDate))) {
      return false;
    }
  }

  // Rule 3: Must be within the defined weekly slots
  return availability.includeSlot(start, halfDayDuration);
}
