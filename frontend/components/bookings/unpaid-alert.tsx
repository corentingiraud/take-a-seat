"use client";

import { AlertTriangle } from "lucide-react";

import { useUnpaidBookings } from "@/hooks/bookings/use-unpaid-bookings";
import { User } from "@/models/user";

type Props = {
  user?: User | null;
};

export function UnpaidBookingsAlert({ user }: Props) {
  const { hasUnpaidBookings } = useUnpaidBookings({ user });

  if (!hasUnpaidBookings) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="text-sm">
        Une ou plusieurs de vos réservations sont impayées, veuillez vous
        rapprocher du gestionnaire de l&apos;espace de coworking pour
        régulariser votre situation.
      </p>
    </div>
  );
}
