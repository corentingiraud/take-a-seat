"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { User } from "@/models/user";

interface UserDetailsProps {
  user: User;
}

const PrinterCode = ({ code }: { code: string }) => {
  const [visible, setVisible] = useState(false);

  return (
    <p className="flex items-center gap-1">
      <span className="font-medium">Code personnel imprimante :</span>{" "}
      <span className="font-mono">{visible ? code : "••••"}</span>
      <Button
        className="h-6 w-6"
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? (
          <EyeOffIcon aria-hidden="true" className="h-4 w-4" />
        ) : (
          <EyeIcon aria-hidden="true" className="h-4 w-4" />
        )}
        <span className="sr-only">
          {visible ? "Masquer le code" : "Afficher le code"}
        </span>
      </Button>
    </p>
  );
};

export const UserDetails = ({ user }: UserDetailsProps) => {
  return (
    <>
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
      {user?.printerCode && (
        // Keyed so the admin page re-masks when switching users.
        <PrinterCode key={user.id} code={user.printerCode} />
      )}
      <p>
        <span className="font-medium">Compte confirmé :</span>{" "}
        {user?.confirmed ? "Oui" : "Non"}
      </p>
    </>
  );
};
