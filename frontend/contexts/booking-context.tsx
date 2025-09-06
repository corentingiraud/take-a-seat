"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { Moment } from "moment";

import { Booking } from "@/models/booking";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { BookingStatus } from "@/models/booking-status";
import { User } from "@/models/user";
import moment from "@/lib/moment";

interface BookingContextType {
  bookings: Booking[];
  reload: () => void;
  cancel: (booking: Booking) => void;
  startDate: Moment;
  endDate: Moment;
  setWeekRange: (start: Moment, end: Moment) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
}

interface BookingProviderProps {
  children: ReactNode;
  user: User;
}

export const BookingContext = createContext<BookingContextType | undefined>(
  undefined,
);

export const BookingProvider: React.FC<BookingProviderProps> = ({
  children,
  user,
}) => {
  const { fetchAll, update } = useStrapiAPI();

  const [startDate, setStartDate] = useState<Moment>(
    moment().startOf("isoWeek"),
  );
  const [endDate, setEndDate] = useState<Moment>(moment().endOf("isoWeek"));
  const [bookings, setBookings] = useState<Booking[]>([]);

  const reload = () => {
    if (!user) return;

    fetchAll({
      ...Booking.strapiAPIParams,
      queryParams: {
        populate: ["service", "service.coworkingSpace"],
        filters: {
          user: { documentId: { $eq: user.documentId } },
          startDate: { $gte: startDate.toDate() },
          endDate: { $lte: endDate.toDate() },
        },
        sort: ["startDate:asc"],
      },
    }).then((bookings) => {
      setBookings(bookings);
    });
  };

  useEffect(reload, [user, startDate, endDate]);

  const cancel = (booking: Booking) => {
    booking.bookingStatus = BookingStatus.CANCELLED;
    update({
      ...Booking.strapiAPIParams,
      object: booking,
      fieldsToUpdate: ["bookingStatus"],
    }).then(() => {
      toast.success("Votre réservation a été annulée");
      reload();
    });
  };

  const setWeekRange = (start: Moment, end: Moment) => {
    setStartDate(start);
    setEndDate(end);
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

  return (
    <BookingContext.Provider
      value={{
        bookings,
        reload,
        cancel,
        startDate,
        endDate,
        setWeekRange,
        goToPreviousWeek,
        goToNextWeek,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBooking must be used within an BookingProvider");
  }

  return context;
};
