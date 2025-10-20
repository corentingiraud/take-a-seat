"use client";

import { AdminBookingPendingPaymentsList } from "@/components/admin/payments/bookings/list";
import { Section } from "@/components/ui/section";
import { AdminPrepaidCardPendingPaymentsList } from "@/components/admin/payments/prepaid-cards/list";

export default function AdminPaymentsPageClient() {
  return (
    <div className="space-y-6">
      <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Gestion des payments
      </h3>

      <Section title="Réservations impayées">
        <AdminBookingPendingPaymentsList />
      </Section>

      <Section title="Cartes prépayées impayées">
        <AdminPrepaidCardPendingPaymentsList />
      </Section>
    </div>
  );
}
