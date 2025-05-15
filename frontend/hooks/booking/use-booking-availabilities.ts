import { Moment } from "moment";
import { Duration } from "moment";

import { useDateRange } from "./use-date-range";
import { useDesiredBookings } from "./use-desired-bookings";
import { useFetchBookings } from "./use-fetch-bookings";
import { useBookingAvailability } from "./use-booking-availability";
import { useBulkCreateBookings } from "./use-bulk-create-bookings";

import { Service } from "@/models/service";
import { HalfDay } from "@/models/half-day";
import { Time } from "@/models/time";
import { useAuth } from "@/contexts/auth-context";

interface UseBookingAvailabilitiesParams {
  service: Service;
  startDay: Moment;
  endDay?: Moment;
  duration: Duration;
  startTime?: Time;
  halfDay?: HalfDay;
}

export function useBookingAvailabilities({
  service,
  startDay,
  endDay,
  duration,
  startTime,
  halfDay,
}: UseBookingAvailabilitiesParams) {
  const { user } = useAuth();

  // Step 1: Get start and end date range
  const { startDate, endDate } = useDateRange({
    service,
    startDay,
    endDay,
    duration,
    startTime,
    halfDay,
  });

  // Step 2: Generate desired booking slots
  const desiredBookings = useDesiredBookings(
    startDate,
    endDate,
    user!,
    service,
  );

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
