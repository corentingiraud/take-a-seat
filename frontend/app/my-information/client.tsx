"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export default function MyInformation() {
  const { user } = useAuth();

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Mes informations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <span className="font-medium">Nom :</span> {user?.lastName}
        </p>
        <p>
          <span className="font-medium">Prénom :</span> {user?.firstName}
        </p>
        <p>
          <span className="font-medium">Nom d&apos;utilisateur :</span>{" "}
          {user?.username}
        </p>
        <p>
          <span className="font-medium">Email :</span> {user?.email}
        </p>
        <p>
          <span className="font-medium">Téléphone :</span> {user?.phone}
        </p>
        <p>
          <span className="font-medium">Compte confirmé :</span>{" "}
          {user?.confirmed ? "Oui" : "Non"}
        </p>
      </CardContent>
    </Card>
  );
}
