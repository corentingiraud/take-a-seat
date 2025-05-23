import { useEffect, useState } from "react";
import { Moment } from "moment";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";

export function useFetchBookings(
  serviceId: number,
  startDate: Moment,
  endDate: Moment,
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
            populate: ["user"],
            filters: {
              service: {
                id: {
                  $eq: serviceId,
                },
              },
              startDate: {
                $gte: startDate.toISOString(),
              },
              endDate: {
                $lte: endDate.toISOString(),
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
  }, [serviceId, startDate.valueOf(), endDate.valueOf()]);

  return {
    bookings,
    loading,
    error,
  };
}
