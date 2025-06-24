import { Metadata } from "next";

import { CreateBookingForm } from "@/components/bookings/create/form";
import { Section } from "@/components/ui/section"; // importe Section

export const metadata: Metadata = {
  title: "Nouvelle réservation",
};

export default function BookPage() {
  return (
    <div className="space-y-6">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Nouvelle réservation
      </h2>

      <Section>
        <CreateBookingForm />
      </Section>
    </div>
  );
}
