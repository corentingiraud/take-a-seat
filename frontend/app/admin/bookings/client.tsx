"use client";

import { AdminBookingsFilters } from "@/components/admin/bookings/filters";
import { AdminPendingBookingsList } from "@/components/bookings/admin/pending/list";
import { AdminBookingsProvider } from "@/contexts/admin/bookings";
import { Section } from "@/components/ui/section";

export default function AdminBookingsPageClient() {
  return (
    <AdminBookingsProvider>
      <div className="space-y-6">
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Réservations à confirmer
        </h3>

        <Section title="Filtres">
          <AdminBookingsFilters />
        </Section>

        <Section title="Liste des réservations en attente">
          <AdminPendingBookingsList />
        </Section>
      </div>
    </AdminBookingsProvider>
  );
}
