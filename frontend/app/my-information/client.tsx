"use client";

import { UserDetails } from "@/components/users/details";
import { useAuth } from "@/contexts/auth-context";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyInformation() {
  const { user, loading } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Mes informations
      </h2>
      <Section>
        {loading || !user ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : (
          <UserDetails user={user} />
        )}
      </Section>
    </div>
  );
}
