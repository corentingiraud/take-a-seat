"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import moment, { Moment } from "moment";
import { toast } from "sonner";

import { Booking } from "@/models/booking";
import { Service } from "@/models/service";
import { API_URL } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";

interface ServiceCalendarContextType {
  bookings: Booking[];
  startDate: Moment;
  endDate: Moment;
  service: Service | null;
  setStartDate: (date: Moment) => void;
  setEndDate: (date: Moment) => void;
  setService: (service: Service | null) => void;
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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<Moment>(moment().startOf("week"));
  const [endDate, setEndDate] = useState<Moment>(moment().endOf("week"));
  const [service, setService] = useState<Service | null>(null);

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

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des réservations");
      }

      const json = await response.json();
      const bookings = json.map(Booking.fromJson);

      setBookings(bookings);
    } catch {
      toast.error("Impossible de charger les réservations.");
    }
  };

  useEffect(() => {
    reload();
  }, [startDate, endDate, service]);

  return (
    <ServiceCalendarContext.Provider
      value={{
        bookings,
        startDate,
        endDate,
        service,
        setStartDate,
        setEndDate,
        setService,
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
