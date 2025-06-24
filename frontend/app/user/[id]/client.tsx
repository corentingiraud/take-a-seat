"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/hooks/use-user";
import { generateDynamicPageTitle } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetails } from "@/components/users/details";
import { PrepaidCardsList } from "@/components/prepaid-cards/list/list";
import { BookingProvider } from "@/contexts/booking-context";
import { BookingsList } from "@/components/bookings/list/list";
import { Section } from "@/components/ui/section";

export default function UserProfile({ userId }: { userId: string }) {
  const { user, loading } = useUser(userId);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user === null) {
      router.push(siteConfig.path.notFound.href);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.firstName && user?.lastName) {
      document.title = generateDynamicPageTitle(
        `${user.firstName} ${user.lastName}`,
      );
    }
  }, [user?.firstName, user?.lastName]);

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 border-b pb-2">
        {user.firstName} {user.lastName}
      </h3>

      <Section title="Informations">
        <UserDetails user={user} />
      </Section>

      <Section title="Carte prépayées">
        <PrepaidCardsList user={user} />
      </Section>

      <Section title="Réservations">
        <BookingProvider user={user}>
          <BookingsList />
        </BookingProvider>
      </Section>
    </div>
  );
}
