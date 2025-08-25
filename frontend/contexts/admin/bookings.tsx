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
  reload: () => Promise<void>;
  confirm: (bookings: Booking[]) => Promise<void>;
  cancel: (bookings: Booking[]) => Promise<void>;

  // Filters
  userFilter: User | null;
  coworkingSpaceFilter: CoworkingSpace | null;
  serviceFilter: Service | null;

  setUserFilter: (user: User | null) => void;
  setCoworkingSpaceFilter: (space: CoworkingSpace | null) => void;
  setServiceFilter: (service: Service | null) => void;

  // UI states
  loading: boolean; // true while reloading or while running actions
  progress: number; // 0..1 during confirm/cancel, 0 when idle
  actionType: "confirm" | "cancel" | null; // optional: to know what’s running
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

  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [actionType, setActionType] = useState<"confirm" | "cancel" | null>(
    null,
  );

  const reload = async () => {
    try {
      setLoading(true);

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
    } catch (err) {
      toast.error(
        "Une erreur est survenue lors du chargement des réservations.",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [userFilter, coworkingSpaceFilter, serviceFilter]);

  // helper to run sequential updates with progress
  const runSequential = async (
    items: Booking[],
    status: BookingStatus,
    successSingular: string,
    successPlural: string,
    type: "confirm" | "cancel",
  ) => {
    if (items.length === 0) return;

    setActionType(type);
    setLoading(true);
    setProgress(0);

    try {
      const total = items.length;
      let done = 0;

      for (const b of items) {
        b.bookingStatus = status;

        await update({
          ...Booking.strapiAPIParams,
          object: b,
          fieldsToUpdate: ["bookingStatus"],
        });

        done += 1;
        setProgress(done / total);
      }

      toast.success(total === 1 ? successSingular : successPlural);
      await reload();
    } catch (err) {
      toast.error(
        "Une erreur est survenue lors de la mise à jour des réservations.",
      );
      throw err;
    } finally {
      setActionType(null);
      setProgress(0);
      setLoading(false);
    }
  };

  const cancel = async (toCancel: Booking[]) =>
    runSequential(
      toCancel,
      BookingStatus.CANCELLED,
      "La réservation a été annulée",
      "Les réservations ont été annulées",
      "cancel",
    );

  const confirm = async (toConfirm: Booking[]) =>
    runSequential(
      toConfirm,
      BookingStatus.CONFIRMED,
      "La réservation a été confirmée",
      "Les réservations ont été confirmées",
      "confirm",
    );

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
        loading,
        progress,
        actionType,
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
