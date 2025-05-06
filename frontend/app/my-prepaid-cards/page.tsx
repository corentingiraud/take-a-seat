"use client";

import { PrepaidCardsList } from "@/components/prepaid-cards/list/list";

export default function MyBookings() {
  return (
    <>
      <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Mes cartes pré-payées
      </h3>
      <div className="mt-5">
        <PrepaidCardsList />
      </div>
    </>
  );
}
