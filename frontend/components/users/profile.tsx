"use client";

import { useEffect } from "react";

import { generateDynamicPageTitle } from "@/lib/utils";
import { UserDetails } from "@/components/users/details";
import { PrepaidCardsList } from "@/components/prepaid-cards/list/list";
import { BookingProvider } from "@/contexts/booking-context";
import { BookingsList } from "@/components/bookings/list/list";
import { Section } from "@/components/ui/section";
import { User } from "@/models/user";

export default function UserProfile({ user }: { user: User }) {
  useEffect(() => {
    if (user.firstName && user.lastName) {
      document.title = generateDynamicPageTitle(
        `${user.firstName} ${user.lastName}`,
      );
    }
  }, [user.firstName, user.lastName]);

  return (
    <div className="space-y-6">
      <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 border-b pb-2">
        {user.firstName} {user.lastName}
      </h3>

      <Section title="User information">
        <UserDetails user={user} />
      </Section>

      <Section title="Prepaid cards">
        <PrepaidCardsList user={user} />
      </Section>

      <Section title="Bookings">
        <BookingProvider user={user}>
          <BookingsList />
        </BookingProvider>
      </Section>
    </div>
  );
}
