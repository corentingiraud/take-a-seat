import { useEffect } from "react";

import { PrepaidCardStatusBadge } from "../badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrepaidCard } from "@/hooks/use-prepaid-card";
import { capitalizeFirstLetter } from "@/lib/utils";
import { User } from "@/models/user";
import { PaymentStatusBadge } from "@/components/payment-badge";

export function PrepaidCardsList({ user }: { user: User }) {
  const { allPrepaidCards: prepaidCards, reload } = usePrepaidCard({
    userId: user.id,
  });

  useEffect(() => {
    reload();
  }, []);
  const sortedCards = [...prepaidCards].sort((a, b) => {
    const priority = {
      usable: 0,
      upcoming: 1,
      expired: 2,
    };

    return priority[a.status] - priority[b.status];
  });

  return (
    <div>
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
        <p className="mt-10 text-center">
          Aucune carte pré-payée pour le moment...
        </p>
      )}
    </div>
  );
}
