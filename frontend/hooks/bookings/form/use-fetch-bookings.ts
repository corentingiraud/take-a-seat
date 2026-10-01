import { useEffect, useState } from "react";
import { Moment } from "moment";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";

// Non-cancelled bookings inside [startDate, endDate] that match `filters`.
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
                $gte: startDate.toDate(),
              },
              endDate: {
                $lte: endDate.toDate(),
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
