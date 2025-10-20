import { useEffect, useState } from "react";

import { PrepaidCardStatusBadge } from "../badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrepaidCard } from "@/hooks/use-prepaid-cards";
import { capitalizeFirstLetter } from "@/lib/utils";
import { User } from "@/models/user";
import { PaymentStatusBadge } from "@/components/payment-badge";
import { Switch } from "@/components/ui/switch";

export function PrepaidCardsList({ user }: { user: User }) {
  const { allPrepaidCards: prepaidCards, reload } = usePrepaidCard({
    userDocumentId: user.documentId,
  });

  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    reload();
  }, []);

  const filteredCards = showExpired
    ? prepaidCards
    : prepaidCards.filter((card) => card.status !== "expired");

  const sortedCards = [...filteredCards].sort((a, b) => {
    const priority = {
      usable: 0,
      unusable: 1,
      upcoming: 2,
      expired: 3,
    };

    return priority[a.status] - priority[b.status];
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-end space-x-2">
        <Switch
          checked={showExpired}
          id="show-expired-switch"
          onCheckedChange={(checked) => setShowExpired(checked)}
        />
        <label
          className="select-none cursor-pointer"
          htmlFor="show-expired-switch"
        >
          Afficher les cartes expirées
        </label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Statut</TableHead>
            <TableHead>Numéro</TableHead>
            <TableHead>Date d&apos;activation</TableHead>
            <TableHead>Date d&apos;expiration</TableHead>
            <TableHead>Solde</TableHead>
            <TableHead>Paiement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCards.map((prepaidCard) => {
            return (
              <TableRow key={prepaidCard.documentId}>
                <TableCell>
                  <PrepaidCardStatusBadge status={prepaidCard.status} />
                </TableCell>
                <TableCell>{prepaidCard.id}</TableCell>
                <TableCell>
                  {capitalizeFirstLetter(
                    prepaidCard.validFrom?.format("dddd D MMM YYYY"),
                  )}
                </TableCell>
                <TableCell>
                  {capitalizeFirstLetter(
                    prepaidCard.expirationDate?.format("dddd D MMM YYYY"),
                  )}
                </TableCell>
                <TableCell>{prepaidCard.remainingBalance}</TableCell>
                <TableCell>
                  <PaymentStatusBadge status={prepaidCard.paymentStatus} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {prepaidCards.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">
          Aucune carte pré-payée pour le moment...
        </p>
      )}
    </div>
  );
}
