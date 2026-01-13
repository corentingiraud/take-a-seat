"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { BookingsList } from "@/components/bookings/list/list";
import { PrepaidCardsList } from "@/components/prepaid-cards/list/list";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useUnpaidBookings } from "@/hooks/bookings/use-unpaid-bookings";

export default function HomePageClient() {
  const { loading, user } = useAuth();
  const router = useRouter();
  const { hasUnpaidBookings } = useUnpaidBookings();

  useEffect(() => {
    if (!loading && !user) {
      router.push(siteConfig.path.login.href);
    }
  }, [loading, user, router]);

  if (!user) return "";

  return (
    <div className="space-y-6">
      <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 border-b pb-2">
        Tableau de bord
      </h3>

      <Section title="Mes cartes prépayées">
        <PrepaidCardsList user={user} />
      </Section>

      <Section
        action={
          <Button onClick={() => router.push(siteConfig.path.book.href)}>
            Nouvelle réservation
          </Button>
        }
        title="Mes réservations"
      >
        {hasUnpaidBookings && (
          <div className="mb-4 flex items-start gap-3 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              Une ou plusieurs de vos réservations sont impayées, veuillez vous
              rapprocher du gestionnaire de l&apos;espace de coworking pour
              régulariser votre situation.
            </p>
          </div>
        )}
        <BookingsList />
      </Section>
    </div>
  );
}
