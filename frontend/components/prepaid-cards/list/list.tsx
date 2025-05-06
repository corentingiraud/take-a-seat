import { useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrepaidCard } from "@/hooks/use-prepaid-card";
import { getPaymentStatusTranslation } from "@/models/payment-status";
import { capitalizeFirstLetter } from "@/lib/utils";

export function PrepaidCardsList() {
  const { prepaidCards, reload } = usePrepaidCard();

  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date d&apos;expiration</TableHead>
            <TableHead>Solde</TableHead>
            <TableHead>Paiement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prepaidCards.map((prepaidCard) => (
            <TableRow key={prepaidCard.documentId}>
              <TableCell>
                {capitalizeFirstLetter(
                  prepaidCard.expirationDate?.format("dddd D MMM YYYY"),
                )}
              </TableCell>
              <TableCell>{prepaidCard.remainingBalance}</TableCell>
              <TableCell>
                {getPaymentStatusTranslation(prepaidCard.paymentStatus)}
              </TableCell>
            </TableRow>
          ))}
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
