"use client";

import { AdminUnconfirmedBookingsList } from "@/components/bookings/admin/unconfirmed/list";
import { AdminUnpaidBookingsList } from "@/components/bookings/admin/unpaid/list";
import { AdminBookingProvider } from "@/contexts/admin/admin-booking-context";

export default function BookPage() {
  return (
    <AdminBookingProvider>
      <div>
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Réservations à confirmer
        </h3>
        <div className="mt-5">
          <AdminUnconfirmedBookingsList />
        </div>
      </div>
      <div className="mt-10">
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Réservations confirmées impayées
        </h3>
        <div className="mt-5">
          <AdminUnpaidBookingsList />
        </div>
      </div>
    </AdminBookingProvider>
  );
}
