import moment, { Moment } from "moment";

import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { Unavailability } from "@/models/unavailability";

export function isHalfDayAvailable(
  date: Moment,
  halfDay: HalfDay,
  unavailabilities: Unavailability[],
  openingTime: Time,
  closingTime: Time,
): boolean {
  const now = moment();

  const start = date
    .clone()
    .hour(halfDay === HalfDay.Morning ? openingTime.hour : 13)
    .minute(halfDay === HalfDay.Morning ? openingTime.minute : 0);

  const end = date
    .clone()
    .hour(halfDay === HalfDay.Morning ? 12 : closingTime.hour)
    .minute(halfDay === HalfDay.Morning ? 0 : closingTime.minute);

  // 1. Check if half-day is currently ongoing today
  if (date.isSame(now, "day") && now.isAfter(start)) {
    return false;
  }

  // 2. Check for conflicts with unavailabilities
  for (const { startDate, endDate } of unavailabilities) {
    if (start.isSameOrBefore(endDate) && end.isSameOrAfter(startDate)) {
      return false;
    }
  }

  return true;
}
