"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { BookingsList } from "@/components/bookings/list/list";
import { PrepaidCardsList } from "@/components/prepaid-cards/list/list";
import { UnpaidBookingsAlert } from "@/components/bookings/unpaid-alert";
import { Section } from "@/components/ui/section";
import { TodayPlanning } from "@/components/dashboard/today/today-planning";
import { Button } from "@/components/ui/button";

export default function HomePageClient() {
  const { loading, user } = useAuth();
  const router = useRouter();

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

      <TodayPlanning />

      <div id="prepaid-cards">
        <Section title="Mes cartes prépayées">
          <PrepaidCardsList user={user} />
        </Section>
      </div>

      <Section
        action={
          <Button onClick={() => router.push(siteConfig.path.book.href)}>
            Nouvelle réservation
          </Button>
        }
        title="Mes réservations"
      >
        <UnpaidBookingsAlert />
        <BookingsList />
      </Section>
    </div>
  );
}
