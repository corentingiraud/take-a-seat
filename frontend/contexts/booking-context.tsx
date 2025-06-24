"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import moment from "moment";

import { useAuth } from "./auth-context";

import { Booking } from "@/models/booking";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { BookingStatus } from "@/models/booking-status";
import { User } from "@/models/user";

interface BookingContextType {
  bookings: Booking[];
  reload: () => void;
  cancel: (booking: Booking) => void;
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
  const [bookings, setBookings] = useState<Booking[]>([]);

  const reload = () => {
    if (!user) return;

    fetchAll({
      ...Booking.strapiAPIParams,
      queryParams: {
        filters: {
          user: {
            id: {
              $eq: user.id,
            },
          },
          endDate: {
            $gt: moment().toDate(),
          },
        },
      },
    }).then((bookings) => {
      setBookings(bookings);
    });
  };

  useEffect(reload, [user]);

  const cancel = (booking: Booking) => {
    booking.bookingStatus = BookingStatus.CANCELLED;
    update({
      ...Booking.strapiAPIParams,
      object: booking,
      fieldsToUpdate: ["bookingStatus"],
    }).then(() => {
      toast.success("Votre réservation a été modifié");
      reload();
    });
  };

  return (
    <BookingContext.Provider value={{ bookings, reload, cancel }}>
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
