"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { Moment } from "moment";

import moment from "@/lib/moment";
import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { API_URL } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { CoworkingSpace } from "@/models/coworking-space";
import { useStrapiAPI } from "@/hooks/use-strapi-api";

interface ServiceCalendarContextType {
  bookings: Booking[];
  startDate: Moment;
  endDate: Moment;
  service: Service | null;
  coworkingSpace: CoworkingSpace | null;
  setService: (service: Service | null) => void;
  setCoworkingSpace: (space: CoworkingSpace | null) => void;
  setWeekRange: (start: Moment, end: Moment) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;

  reload: () => void;
}

interface ServiceCalendarProviderProps {
  children: ReactNode;
}

const ServiceCalendarContext = createContext<
  ServiceCalendarContextType | undefined
>(undefined);

export const ServiceCalendarProvider: React.FC<
  ServiceCalendarProviderProps
> = ({ children }) => {
  const { getJWT } = useAuth();
  const searchParams = useSearchParams();
  const { fetchOne } = useStrapiAPI();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDateState] = useState<Moment>(
    moment().startOf("isoWeek"),
  );
  const [endDate, setEndDateState] = useState<Moment>(
    moment().endOf("isoWeek"),
  );
  const [service, setServiceState] = useState<Service | null>(null);
  const [coworkingSpace, setCoworkingSpaceState] =
    useState<CoworkingSpace | null>(null);

  const updateURL = () => {
    const current = new URLSearchParams(searchParams.toString());

    current.set("startDate", startDate.toISOString());
    current.set("endDate", endDate.toISOString());
    if (service?.documentId) current.set("serviceId", service.documentId);
    if (coworkingSpace?.documentId)
      current.set("coworkingSpaceId", coworkingSpace.documentId);

    const next = `?${current.toString()}`;

    if (window.location.search !== next) {
      window.history.replaceState(null, "", next);
    }
  };

  const setService = (service: Service | null) => setServiceState(service);
  const setCoworkingSpace = (space: CoworkingSpace | null) =>
    setCoworkingSpaceState(space);

  const setWeekRange = (start: Moment, end: Moment) => {
    setStartDateState(start);
    setEndDateState(end);
  };

  const goToPreviousWeek = () => {
    const newStart = startDate.clone().subtract(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    setWeekRange(newStart, newEnd);
  };

  const goToNextWeek = () => {
    const newStart = startDate.clone().add(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    setWeekRange(newStart, newEnd);
  };

  const reload = async () => {
    if (!service) return;
    try {
      const token = getJWT();
      const query = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }).toString();

      const response = await fetch(
        `${API_URL}/services/${service.documentId}/calendar?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) throw new Error();

      const json = await response.json();
      const bookings = json.map(Booking.fromJson);

      setBookings(bookings);
    } catch {
      toast.error("Impossible de charger les réservations.");
    }
  };

  useEffect(() => {
    const initFromURL = async () => {
      const urlStart = searchParams.get("startDate");
      const urlEnd = searchParams.get("endDate");
      const urlCoworkingSpaceId = searchParams.get("coworkingSpaceId");
      const urlServiceId = searchParams.get("serviceId");

      if (urlStart) setStartDateState(moment(urlStart));
      if (urlEnd) setEndDateState(moment(urlEnd));

      if (urlCoworkingSpaceId) {
        const coworkingSpace = await fetchOne({
          ...CoworkingSpace.strapiAPIParams,
          id: urlCoworkingSpaceId,
        });

        setCoworkingSpaceState(coworkingSpace);
      }

      if (urlServiceId) {
        const service = await fetchOne({
          ...Service.strapiAPIParams,
          id: urlServiceId,
          queryParams: { populate: ["availabilities"] },
        });

        setServiceState(service);
      }
    };

    initFromURL();
  }, []);

  useEffect(() => {
    reload();
  }, [startDate, endDate, service]);

  useEffect(() => {
    updateURL();
  }, [startDate, endDate, service, coworkingSpace]);

  return (
    <ServiceCalendarContext.Provider
      value={{
        bookings,
        startDate,
        endDate,
        service,
        coworkingSpace,
        setService,
        setCoworkingSpace,
        setWeekRange,
        goToPreviousWeek,
        goToNextWeek,
        reload,
      }}
    >
      {children}
    </ServiceCalendarContext.Provider>
  );
};

export const useServiceCalendar = (): ServiceCalendarContextType => {
  const context = useContext(ServiceCalendarContext);

  if (!context) {
    throw new Error(
      "useServiceCalendar must be used within a ServiceCalendarProvider",
    );
  }

  return context;
};
