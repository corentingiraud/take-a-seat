"use client";

import { AdminBookingPendingPaymentsList } from "@/components/bookings/admin/pending-payments/list";
import { AdminPaymentsProvider } from "@/contexts/admin/payments";
import { Section } from "@/components/ui/section";

export default function AdminPaymentsPageClient() {
  return (
    <AdminPaymentsProvider>
      <div className="space-y-6">
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Réservations confirmées impayées
        </h3>

        <Section>
          <AdminBookingPendingPaymentsList />
        </Section>
      </div>
    </AdminPaymentsProvider>
  );
}
