"use client";

import { AdminPrepaidCardsCreate } from "@/components/admin/prepaid-cards/create";
import { AdminPrepaidCardsProvider } from "@/contexts/admin/prepaid-card";
import { Section } from "@/components/ui/section";

export default function AdminPrepaidCardsCreatePageClient() {
  return (
    <AdminPrepaidCardsProvider>
      <div className="space-y-6">
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Création des cartes prépayées
        </h3>

        <Section>
          <AdminPrepaidCardsCreate />
        </Section>
      </div>
    </AdminPrepaidCardsProvider>
  );
}
