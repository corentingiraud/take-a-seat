"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import moment from "@/lib/moment";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { User } from "@/models/user";
import { Booking } from "@/models/booking";
import { BookingStatus } from "@/models/booking-status";
import { PaymentStatus } from "@/models/payment-status";
import { PrepaidCard } from "@/models/prepaid-card";

interface AdminPaymentsContextType {
  usersWithPendingBookingPayments: User[];
  prepaidCardsWithPendingPayments: PrepaidCard[];
  reload: () => void;
  markBookingsAsPaid: (bookings: Booking[], prepaidCard?: PrepaidCard) => void;
  markPrepaidCardAsPaid: (prepaidCard: PrepaidCard) => void;
}

interface AdminPaymentsProviderProps {
  children: ReactNode;
}

export const AdminPaymentsContext = createContext<
  AdminPaymentsContextType | undefined
>(undefined);

export const AdminPaymentsProvider: React.FC<AdminPaymentsProviderProps> = ({
  children,
}) => {
  const { fetchAll, update } = useStrapiAPI();
  const [usersWithPendingBookingPayments, setUsersWithPendingBookingPayments] =
    useState<User[]>([]);
  const [prepaidCardsWithPendingPayments, setPrepaidCardsWithPendingPayments] =
    useState<PrepaidCard[]>([]);

  const reload = () => {
    const now = moment().toDate();

    // Pending booking payments
    const bookingQueryParams = {
      populate: {
        [Booking.contentType]: {
          filters: {
            $and: [
              { bookingStatus: { $eq: BookingStatus.CONFIRMED } },
              { paymentStatus: { $eq: PaymentStatus.PENDING } },
            ],
          },
        },
      },
      filters: {
        [Booking.contentType]: {
          $and: [
            { bookingStatus: { $eq: BookingStatus.CONFIRMED } },
            { paymentStatus: { $eq: PaymentStatus.PENDING } },
            { endDate: { $gt: now } },
          ],
        },
      },
    };

    fetchAll({
      ...User.strapiAPIParams,
      queryParams: bookingQueryParams,
    }).then(setUsersWithPendingBookingPayments);

    // Pending prepaid card payments
    const prepaidQueryParams = {
      populate: {
        user: true,
      },
      filters: {
        paymentStatus: { $eq: PaymentStatus.PENDING },
      },
    };

    fetchAll({
      ...PrepaidCard.strapiAPIParams,
      queryParams: prepaidQueryParams,
    }).then(setPrepaidCardsWithPendingPayments);
  };

  useEffect(reload, []);

  const markBookingsAsPaid = async (
    bookings: Booking[],
    prepaidCard?: PrepaidCard,
  ) => {
    for (const booking of bookings) {
      try {
        booking.paymentStatus = PaymentStatus.PAID;

        if (prepaidCard) {
          booking.prepaidCard = prepaidCard;
        }

        await update({
          ...Booking.strapiAPIParams,
          object: booking,
          fieldsToUpdate: prepaidCard
            ? ["paymentStatus", "prepaidCard"]
            : ["paymentStatus"],
        });
      } catch (e) {
        console.error(
          `Erreur lors de la mise à jour de la réservation ${booking.id}:`,
          e,
        );
        toast.error(`Échec de la mise à jour de la réservation ${booking.id}.`);
      }
    }

    let notificationMessage: string;

    if (prepaidCard) {
      notificationMessage =
        bookings.length === 1
          ? "La réservation a été marquée comme payée (carte prépayée)"
          : "Les réservations ont été marquées comme payées (carte prépayée)";
    } else {
      notificationMessage =
        bookings.length === 1
          ? "La réservation a été marquée comme payée (CB / espèce)"
          : "Les réservations ont été marquées comme payées (CB / espèce)";
    }

    toast.success(notificationMessage);
    reload();
  };

  const markPrepaidCardAsPaid = (prepaidCard: PrepaidCard) => {
    prepaidCard.paymentStatus = PaymentStatus.PAID;

    update({
      ...PrepaidCard.strapiAPIParams,
      object: prepaidCard,
      fieldsToUpdate: ["paymentStatus"],
    }).then(() => {
      toast.success("La carte prépayée a été marquée comme payée");
      reload();
    });
  };

  return (
    <AdminPaymentsContext.Provider
      value={{
        usersWithPendingBookingPayments,
        prepaidCardsWithPendingPayments,
        reload,
        markBookingsAsPaid,
        markPrepaidCardAsPaid,
      }}
    >
      {children}
    </AdminPaymentsContext.Provider>
  );
};

export const useAdminPayments = (): AdminPaymentsContextType => {
  const context = useContext(AdminPaymentsContext);

  if (!context) {
    throw new Error(
      "useAdminPayments must be used within an AdminPaymentsProvider",
    );
  }

  return context;
};
