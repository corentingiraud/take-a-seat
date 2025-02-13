"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function MyBookings() {
  const router = useRouter();

  return (
    <>
      <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Mes réservations
      </h3>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Retrouvez ici toutes vos réservations.
      </p>
      <Button onClick={() => router.push("/book")}>Nouvelle réservation</Button>
    </>
  );
}
