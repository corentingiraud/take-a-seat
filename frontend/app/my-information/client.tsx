"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDetails } from "@/components/users/details";
import { useAuth } from "@/contexts/auth-context";

export default function MyInformation() {
  const { user } = useAuth();

  if (!user) return;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Mes informations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <UserDetails user={user} />
      </CardContent>
    </Card>
  );
}
