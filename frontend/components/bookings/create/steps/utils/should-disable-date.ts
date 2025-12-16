import { Duration } from "moment";

import moment from "@/lib/moment";
import { Availability } from "@/models/availability";
import { Unavailability } from "@/models/unavailability";

interface DisableDateOptions {
  date: Date;
  unavailabilities: Unavailability[];
  availabilities: Availability[];
  duration?: Duration;
  canBookInPast?: boolean;
}

export function shouldDisableDate({
  date,
  unavailabilities,
  availabilities,
  duration,
  canBookInPast,
}: DisableDateOptions): boolean {
  const mDate = moment(date).startOf("day");

  // 1. Disable past dates
  if (!canBookInPast && mDate.isBefore(moment().startOf("day"))) return true;

  // 2. Get all availability start times for that day
  const startTimes = availabilities
    .map(a => a.getStartTimeFor(mDate))
    .filter(Boolean);

  if (startTimes.length === 0) return true;

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
