import { useMemo } from "react";
import moment, { Duration, Moment } from "moment";

import { Service } from "@/models/service";
import { HalfDay } from "@/models/half-day";
import { AVAILABLE_DURATION } from "@/models/duration";

interface UseDateRangeParams {
  startDay: Moment;
  endDay?: Moment;
  duration: Duration;
  startTime?: { hour: number }; // You can change this to Time model if needed
  halfDay?: HalfDay;
  service: Service;
}

export function useDateRange({
  startDay,
  endDay,
  duration,
  startTime,
  halfDay,
  service,
}: UseDateRangeParams) {
  const { startDate, endDate } = useMemo(() => {
    let startDate = startDay.clone();
    let endDate = moment();

    const oneHour = AVAILABLE_DURATION.ONE_HOUR.getDuration();
    const halfDayDuration = AVAILABLE_DURATION.HALF_DAY.getDuration();

    if (duration === oneHour && startTime) {
      startDate.hour(startTime.hour).minute(0).second(0);
      endDate = startDate.clone().add(oneHour);
    }

    if (duration === halfDayDuration) {
      if (halfDay === HalfDay.Morning) {
        startDate.hour(service.openingTime.hour).minute(0);
        endDate = startDate.clone().add(halfDayDuration);
      }

      if (halfDay === HalfDay.Afternoon) {
        startDate.hour(14).minute(0);
        endDate = startDate.clone().hour(service.closingTime.hour).minute(0);
      }
    }

    // Full-day or multi-day case
    if (duration === null && endDay) {
      startDate.hour(service.openingTime.hour).minute(0);
      endDate = endDay.clone().hour(service.closingTime.hour).minute(0);
    }

    return { startDate, endDate };
  }, [
    startDay?.valueOf(),
    endDay?.valueOf(),
    duration?.toISOString?.(),
    startTime?.hour,
    halfDay,
    service?.id,
    service?.openingTime?.hour,
    service?.closingTime?.hour,
  ]);

  return { startDate, endDate };
}
