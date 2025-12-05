import { Duration } from "moment";

import moment from "@/lib/moment";
import { Availability } from "@/models/availability";
import { Unavailability } from "@/models/unavailability";

interface DisableDateOptions {
  date: Date;
  unavailabilities: Unavailability[];
  availabilities: Availability[];
  duration?: Duration;
}

export function shouldDisableDate({
  date,
  unavailabilities,
  availabilities,
  duration,
}: DisableDateOptions): boolean {
  const mDate = moment(date).startOf("day");

  // 1. Disable past dates
  if (mDate.isBefore(moment().startOf("day"))) return true;

  // 2. Get all availability start times for that day
  const startTimes = availabilities
    .map(a => a.getStartTimeFor(mDate))
    .filter(Boolean);

  if (startTimes.length === 0) return true;

  // 2.5 Full-day case: any unavailability blocks the whole day
  if (!duration) {
    const dayStart = mDate.clone();
    const dayEnd = mDate.clone().endOf("day");

    const hasUnavailability = unavailabilities.some(u =>
      dayStart.isBefore(u.endDate) && dayEnd.isAfter(u.startDate)
    );

    return hasUnavailability;
  }

  // 3. Duration defined → check time slots
  for (const startTime of startTimes) {
    const slotStart = moment(startTime);
    const slotEnd = slotStart.clone().add(duration);

    const overlaps = unavailabilities.some(({ startDate, endDate }) =>
      slotStart.isBefore(endDate) && slotEnd.isAfter(startDate)
    );

    if (!overlaps) return false;
  }

  return true;
}
