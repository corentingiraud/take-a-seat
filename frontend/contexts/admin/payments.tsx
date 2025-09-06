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

interface AdminPaymentsContextType {
  usersWithPendingPayments: User[];
  reload: () => void;
  markAsPaid: (bookings: Booking[]) => void;
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
  const [usersWithPendingPayments, setUsersWithPendingPayments] = useState<
    User[]
  >([]);

  const reload = () => {
    const now = moment().toDate();

    const queryParams = {
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
      queryParams,
    }).then(setUsersWithPendingPayments);
  };

  useEffect(reload, []);

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

  return (
    <AdminPaymentsContext.Provider
      value={{
        usersWithPendingPayments,
        reload,
        markAsPaid,
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
