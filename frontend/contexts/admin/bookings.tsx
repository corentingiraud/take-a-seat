// contexts/admin/admin-bookings-context.tsx

"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { BookingStatus } from "@/models/booking-status";
import { User } from "@/models/user";
import { Booking } from "@/models/booking";
import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";

interface AdminBookingsContextType {
  bookings: Booking[];
  reload: () => void;
  confirm: (bookings: Booking[]) => void;
  cancel: (bookings: Booking[]) => void;

  // Filters
  userFilter: User | null;
  coworkingSpaceFilter: CoworkingSpace | null;
  serviceFilter: Service | null;

  setUserFilter: (user: User | null) => void;
  setCoworkingSpaceFilter: (space: CoworkingSpace | null) => void;
  setServiceFilter: (service: Service | null) => void;
}

interface AdminBookingProviderProps {
  children: ReactNode;
}

export const AdminBookingsContext = createContext<
  AdminBookingsContextType | undefined
>(undefined);

export const AdminBookingsProvider = ({
  children,
}: AdminBookingProviderProps) => {
  const { fetchAll, update } = useStrapiAPI();

  const [bookings, setBookings] = useState<Booking[]>([]);

  // Filters
  const [userFilter, setUserFilter] = useState<User | null>(null);
  const [coworkingSpaceFilter, setCoworkingSpaceFilter] =
    useState<CoworkingSpace | null>(null);
  const [serviceFilter, setServiceFilter] = useState<Service | null>(null);

  const reload = async () => {
    const filters: any = {
      bookingStatus: { $eq: BookingStatus.PENDING },
    };

    if (userFilter) {
      filters.user = { documentId: { $eq: userFilter.documentId } };
    }

    if (serviceFilter) {
      filters.service = { documentId: { $eq: serviceFilter.documentId } };
    }

    if (coworkingSpaceFilter) {
      filters.service = {
        ...(filters.service ?? {}),
        coworkingSpace: {
          documentId: { $eq: coworkingSpaceFilter.documentId },
        },
      };
    }

    const data = await fetchAll<Booking>({
      ...Booking.strapiAPIParams,
      queryParams: {
        filters,
        populate: {
          user: true,
          service: {
            populate: ["coworkingSpace"],
          },
        },
        sort: ["startDate:asc"],
      },
    });

    setBookings(data);
  };

  useEffect(() => {
    reload();
  }, [userFilter, coworkingSpaceFilter, serviceFilter]);

  const cancel = (bookings: Booking[]) => {
    const promises = bookings.map((booking) => {
      booking.bookingStatus = BookingStatus.CANCELLED;

      return update({
        ...Booking.strapiAPIParams,
        object: booking,
        fieldsToUpdate: ["bookingStatus"],
      });
    });

    Promise.all(promises).then(() => {
      toast.success(
        bookings.length === 1
          ? "La réservation a été annulée"
          : "Les réservations ont été annulées",
      );
      reload();
    });
  };

  const confirm = (bookings: Booking[]) => {
    if (bookings.length === 0) return;

    const promises = bookings.map((booking) => {
      booking.bookingStatus = BookingStatus.CONFIRMED;

      return update({
        ...Booking.strapiAPIParams,
        object: booking,
        fieldsToUpdate: ["bookingStatus"],
      });
    });

    Promise.all(promises).then(() => {
      toast.success(
        bookings.length === 1
          ? "La réservation a été confirmée"
          : "Les réservations ont été confirmées",
      );
      reload();
    });
  };

  return (
    <AdminBookingsContext.Provider
      value={{
        reload,
        confirm,
        cancel,
        userFilter,
        coworkingSpaceFilter,
        serviceFilter,
        bookings,
        setUserFilter,
        setCoworkingSpaceFilter,
        setServiceFilter,
      }}
    >
      {children}
    </AdminBookingsContext.Provider>
  );
};

export const useAdminBookings = (): AdminBookingsContextType => {
  const context = useContext(AdminBookingsContext);

  if (!context) {
    throw new Error(
      "useAdminBookings must be used within an AdminBookingsProvider",
    );
  }

  return context;
};
