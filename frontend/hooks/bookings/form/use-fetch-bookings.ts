import { useEffect, useState } from "react";
import { Moment } from "moment";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";

// Non-cancelled bookings overlapping [startDate, endDate] that match `filters`. Overlap, not
// containment: services have different slot lengths, so a 1h open-space seat must still be
// found when booking a 30 min room inside it.
export function useFetchBookings(
  filters: object,
  startDate: Moment,
  endDate: Moment,
  populate: string[] = ["user"],
) {
  const { fetchAll } = useStrapiAPI();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAll({
          ...Booking.strapiAPIParams,
          queryParams: {
            populate,
            filters: {
              ...filters,
              startDate: {
                $lt: endDate.toDate(),
              },
              endDate: {
                $gt: startDate.toDate(),
              },
              bookingStatus: {
                $ne: "CANCELLED",
              },
            },
          },
        });

        if (!isCancelled) {
          setBookings(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [JSON.stringify([filters, populate]), startDate.valueOf(), endDate.valueOf()]);

  return {
    bookings,
    loading,
    error,
  };
}
