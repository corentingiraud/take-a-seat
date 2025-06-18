"use client";

import { AdminBookingsFilters } from "@/components/admin/bookings/filters";
import { AdminPendingBookingsList } from "@/components/bookings/admin/pending/list";
import { AdminBookingsProvider } from "@/contexts/admin/bookings-context";

export default function AdminBookingsPageClient() {
  return (
    <AdminBookingsProvider>
      <div>
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Réservations à confirmer
        </h3>
        <div className="mt-5 space-y-8">
          <AdminBookingsFilters />
          <AdminPendingBookingsList />
        </div>
      </div>
    </AdminBookingsProvider>
  );
}
