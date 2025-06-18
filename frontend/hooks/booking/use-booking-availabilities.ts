import moment, { Moment } from "moment";

import { useDesiredDates } from "./use-desired-date";
import { useDesiredBookings } from "./use-desired-bookings";
import { useFetchBookings } from "./use-fetch-bookings";
import { useBookingAvailability } from "./use-booking-availability";
import { useBulkCreateBookings } from "./use-bulk-create-bookings";

import { Service } from "@/models/service";
import { HalfDay } from "@/models/half-day";
import { Time } from "@/models/time";
import { useAuth } from "@/contexts/auth-context";
import { DurationWrapper } from "@/models/duration";

interface UseBookingAvailabilitiesParams {
  service: Service;
  startDay: Moment;
  endDay?: Moment;
  multipleDays?: Moment[];
  duration: DurationWrapper;
  startTime?: Time;
  halfDay?: HalfDay;
}

export function useBookingAvailabilities({
  service,
  startDay,
  endDay,
  multipleDays,
  duration,
  startTime,
  halfDay,
}: UseBookingAvailabilitiesParams) {
  const { user } = useAuth();

  // Step 1: Get array of desired dates
  const desiredDates = useDesiredDates({
    service,
    startDay,
    endDay,
    multipleDays,
    duration,
    startTime,
    halfDay,
  });

  // Step 2: Generate desired booking slots
  const desiredBookings = useDesiredBookings(desiredDates, user!, service);

  let startDate = desiredBookings.length
    ? desiredBookings[0].startDate
    : moment();
  let endDate = desiredBookings.length
    ? desiredBookings[desiredBookings.length - 1].endDate
    : moment();

  // Step 3: Fetch existing bookings from API
  const {
    bookings: existingBookings,
    loading,
    error,
  } = useFetchBookings(service.id, startDate, endDate);

  // Step 4: Determine which desired slots are available
  const { availableBookings, unavailableBookings } = useBookingAvailability({
    desiredBookings,
    existingBookings,
    service,
    user: user!,
  });

  // Step 5: Hook to trigger bulk creation of bookings
  const bulkCreateAvailableBookings = useBulkCreateBookings(availableBookings);

  return {
    availableBookings,
    unavailableBookings,
    bulkCreateAvailableBookings,
    loading,
    error,
  };
}
