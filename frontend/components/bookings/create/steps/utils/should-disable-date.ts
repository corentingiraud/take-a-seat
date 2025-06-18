import moment, { Duration, Moment } from "moment";

import { Time } from "@/models/time";

type Unavailability = {
  startDate: Moment;
  endDate: Moment;
};

interface DisableDateOptions {
  date: Date;
  unavailabilities: Unavailability[];
  openingTime?: Time;
  closingTime?: Time;
  duration?: Duration | null;
}

export function shouldDisableDate({
  date,
  unavailabilities,
  openingTime,
  closingTime,
  duration,
}: DisableDateOptions): boolean {
  const mDate = moment(date);

  // Past
  if (mDate.isBefore(moment().startOf("day"))) return true;

  // Weekends
  if (mDate.day() === 0 || mDate.day() === 6) return true;

  // Unavailabilities
  return unavailabilities.some(({ startDate, endDate }) => {
    // If duration + time logic isn't relevant, fallback to simple range check
    if (!duration || !openingTime || !closingTime) {
      return mDate.isBetween(
        startDate.clone().startOf("day"),
        endDate.clone().endOf("day"),
        null,
        "[]",
      );
    }

    if (mDate.isSame(startDate, "d")) {
      const startTime = startDate
        .clone()
        .hour(openingTime.hour)
        .minute(openingTime.minute);

      if (startTime.clone().add(duration).isSameOrBefore(startDate, "minute"))
        return false;
    }

    if (mDate.isSame(endDate, "d")) {
      const endTime = endDate
        .clone()
        .hour(closingTime.hour)
        .minute(closingTime.minute);

      if (endDate.clone().add(duration).isSameOrBefore(endTime, "minute"))
        return false;
    }

    return mDate.isBetween(
      startDate.clone().startOf("day"),
      endDate.clone().endOf("day"),
      null,
      "[]",
    );
  });
}
