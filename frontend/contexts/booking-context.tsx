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
import { PaymentStatus } from "@/models/payment-status";
import { PrepaidCard } from "@/models/prepaid-card";

interface BookingContextType {
  bookings: Booking[];
  reload: () => void;
  cancel: (booking: Booking) => Promise<void>;
  cancelMany: (bookings: Booking[]) => Promise<void>;
  payManyWithCard: (items: Booking[], card: PrepaidCard) => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  const reload = () => {
    if (!user) return;

    setIsLoading(true);
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
    })
      .then((bookings) => setBookings(bookings))
      .finally(() => setIsLoading(false));
  };

  useEffect(reload, [user, startDate, endDate]);

  const cancel = async (booking: Booking) => {
    try {
      setIsLoading(true);
      booking.bookingStatus = BookingStatus.CANCELLED;
      await update({
        ...Booking.strapiAPIParams,
        object: booking,
        fieldsToUpdate: ["bookingStatus"],
      });
      toast.success("Votre réservation a été annulée");
      reload();
    } catch {
      toast.error("Annulation impossible");
      setIsLoading(false);
    }
  };

  const cancelMany = async (items: Booking[]) => {
    if (!items?.length) return;

    setIsLoading(true);
    let ok = 0;
    let fail = 0;

    try {
      for (const b of items) {
        try {
          await update({
            ...Booking.strapiAPIParams,
            object: new Booking({
              ...b,
              bookingStatus: BookingStatus.CANCELLED,
            }),
            fieldsToUpdate: ["bookingStatus"],
          });
          ok += 1;
        } catch {
          fail += 1;
        }
      }

      if (ok > 0) {
        toast.success(
          ok === 1 ? "1 réservation annulée" : `${ok} réservations annulées`,
        );
      }
      if (fail > 0) {
        toast.error(
          fail === 1
            ? "1 annulation a échoué"
            : `${fail} annulations ont échoué`,
        );
      }

      reload();
    } finally {
      setIsLoading(false);
    }
  };

  const payManyWithCard = async (items: Booking[], card: PrepaidCard) => {
    if (!items?.length || !card) return;

    if (card.remainingBalance < items.length) {
      toast.error("Solde insuffisant sur la carte");

      return;
    }

    setIsLoading(true);
    let ok = 0;
    let fail = 0;

    try {
      for (const b of items) {
        try {
          await update({
            ...Booking.strapiAPIParams,
            object: new Booking({
              ...b,
              paymentStatus: PaymentStatus.PAID,
              prepaidCard: card,
            }),
            fieldsToUpdate: ["paymentStatus"],
          });
          ok += 1;
        } catch {
          fail += 1;
        }
      }

      if (ok > 0) {
        toast.success(
          ok === 1 ? "1 réservation payée" : `${ok} réservations payées`,
        );
      }
      if (fail > 0) {
        toast.error(
          fail === 1
            ? "Le paiement a échoué pour 1 réservation"
            : `Le paiement a échoué pour ${fail} réservations`,
        );
      }

      reload();
    } finally {
      setIsLoading(false);
    }
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
        cancelMany,
        payManyWithCard,
        isLoading,
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
