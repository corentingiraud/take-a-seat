"use client";

import { AdminPrepaidCardsCreate } from "@/components/prepaid-cards/admin/create";
import { AdminPrepaidCardsProvider } from "@/contexts/admin/prepaid-card";

export default function AdminPrepaidCardsCreatePageClient() {
  return (
    <AdminPrepaidCardsProvider>
      <div>
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Création des cartes prépayées
        </h3>
        <div className="mt-5 space-y-8">
          <AdminPrepaidCardsCreate />
        </div>
      </div>
    </AdminPrepaidCardsProvider>
  );
}
