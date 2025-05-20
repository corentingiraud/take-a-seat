"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { BookingsList } from "@/components/bookings/list/list";
import { BookingProvider } from "@/contexts/booking-context";

export default function MyBookings() {
  const router = useRouter();

  return (
    <BookingProvider>
      <div className="mt-5 flex justify-end">
        <Button onClick={() => router.push("/book")}>
          Nouvelle réservation
        </Button>
      </div>
      <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Mes réservations
      </h3>
      <div className="mt-5">
        <BookingsList />
      </div>
    </BookingProvider>
  );
}
