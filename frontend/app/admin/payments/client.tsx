"use client";

import { AdminPendingBookingsList } from "@/components/bookings/admin/pending/list";
import { AdminBookingPendingPaymentsList } from "@/components/bookings/admin/pending-payments/list";
import { AdminPaymentProvider } from "@/contexts/admin/payments";

export default function AdminPaymentsPageClient() {
  return (
    <AdminPaymentsProvider>
      <div>
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Réservations à confirmer
        </h3>
        <div className="mt-5">
          <AdminPendingBookingsList />
        </div>
      </div>
      <div className="mt-10">
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Réservations confirmées impayées
        </h3>
        <div className="mt-5">
          <AdminBookingPendingPaymentsList />
        </div>
      </div>
    </AdminPaymentsProvider>
  );
}
