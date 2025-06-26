import moment, { Duration } from "moment";

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

  // 1. Past
  if (mDate.isBefore(moment().startOf("day"))) return true;

  // 2. No matching availability at all
  const isCoveredByAvailability = availabilities.some((availability) =>
    availability.getStartTimeFor(mDate),
  );

  if (!isCoveredByAvailability) return true;

  // 3. Overlaps with any unavailability
  for (const { startDate, endDate } of unavailabilities) {
    const endOfSlot = mDate.clone().add(duration);

    if (mDate.isSameOrBefore(endDate) && endOfSlot.isSameOrAfter(startDate)) {
      return true;
    }
  }

  return false;
}
