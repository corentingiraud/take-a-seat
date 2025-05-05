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

import { useAuth } from "../auth-context";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { BookingStatus } from "@/models/booking-status";
import { User } from "@/models/user";
import { Booking } from "@/models/booking";
import { PaymentStatus } from "@/models/payment-status";

interface AdminBookingContextType {
  usersWithUnconfirmedBookings: User[];
  usersWithUnpaidBookings: User[];
  reload: () => void;
  cancel: (bookings: Booking[]) => void;
  markAsPaid: (bookings: Booking[]) => void;
  confirm: (bookings: Booking[]) => void;
}

interface AdminBookingProviderProps {
  children: ReactNode;
}

export const AdminBookingContext = createContext<
  AdminBookingContextType | undefined
>(undefined);

export const AdminBookingProvider: React.FC<AdminBookingProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const { fetchAll, update } = useStrapiAPI();
  const [usersWithUnconfirmedBookings, setUsersWithUnconfirmedBookings] =
    useState<User[]>([]);
  const [usersWithUnpaidBookings, setUsersWithUnpaidBookings] = useState<
    User[]
  >([]);

  const reload = () => {
    if (!user) return;

    const now = moment().toDate();

    const makeQueryParams = (
      bookingStatus: BookingStatus,
      additionalFilters = {},
    ) => ({
      populate: {
        [Booking.contentType]: {
          filters: {
            $and: [
              { bookingStatus: { $eq: bookingStatus } },
              { endDate: { $gt: now } },
              ...Object.entries(additionalFilters).map(([key, value]) => ({
                [key]: { $eq: value },
              })),
            ],
          },
        },
      },
      filters: {
        [Booking.contentType]: {
          $and: [
            { bookingStatus: { $eq: bookingStatus } },
            { endDate: { $gt: now } },
            ...Object.entries(additionalFilters).map(([key, value]) => ({
              [key]: { $eq: value },
            })),
          ],
        },
      },
    });

    fetchAll({
      ...User.strapiAPIParams,
      queryParams: makeQueryParams(BookingStatus.PENDING),
    }).then(setUsersWithUnconfirmedBookings);

    fetchAll({
      ...User.strapiAPIParams,
      queryParams: makeQueryParams(BookingStatus.CONFIRMED, {
        paymentStatus: PaymentStatus.PENDING,
      }),
    }).then(setUsersWithUnpaidBookings);
  };

  useEffect(reload, [user]);

  const cancel = (bookings: Booking[]) => {
    const promises = [];

    for (const booking of bookings) {
      booking.paymentStatus;
      booking.bookingStatus = BookingStatus.CANCELLED;
      promises.push(
        update({
          ...Booking.strapiAPIParams,
          object: booking,
          fieldsToUpdate: ["bookingStatus"],
        }),
      );
    }
    Promise.all(promises).then(() => {
      let notificationMessage = "Les réservations ont été annulées";

      if (bookings.length === 1) {
        notificationMessage = "La réservation a été confirmée";
      }
      toast.success(notificationMessage);
      reload();
    });
  };

  const markAsPaid = (bookings: Booking[]) => {
    const promises = [];

    for (const booking of bookings) {
      booking.paymentStatus = PaymentStatus.PAID;
      promises.push(
        update({
          ...Booking.strapiAPIParams,
          object: booking,
          fieldsToUpdate: ["paymentStatus"],
        }),
      );
    }

    Promise.all(promises).then(() => {
      let notificationMessage =
        "Les réservations ont été marquées comme payées";

      if (bookings.length === 1) {
        notificationMessage = "La réservation a été marquée comme payée";
      }
      toast.success(notificationMessage);
      reload();
    });
  };

  const confirm = (bookings: Booking[]) => {
    if (bookings.length === 0) return;

    const promises = [];

    for (const booking of bookings) {
      booking.bookingStatus = BookingStatus.CONFIRMED;
      promises.push(
        update({
          ...Booking.strapiAPIParams,
          object: booking,
          fieldsToUpdate: ["bookingStatus"],
        }),
      );
    }

    Promise.all(promises).then(() => {
      let notificationMessage = "Les réservations ont été confirmées";

      if (bookings.length === 1) {
        notificationMessage = "La réservation a été confirmée";
      }

      toast.success(notificationMessage);
      reload();
    });
  };

  return (
    <AdminBookingContext.Provider
      value={{
        usersWithUnconfirmedBookings,
        usersWithUnpaidBookings,
        reload,
        cancel,
        markAsPaid,
        confirm,
      }}
    >
      {children}
    </AdminBookingContext.Provider>
  );
};

export const useAdminBooking = (): AdminBookingContextType => {
  const context = useContext(AdminBookingContext);

  if (!context) {
    throw new Error(
      "useAdminBooking must be used within an AdminBookingProvider",
    );
  }

  return context;
};
