import { useEffect } from "react";
import moment from "moment";

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
import { Badge } from "@/components/ui/badge";
import { PrepaidCard } from "@/models/prepaid-card";

type CardStatus = "Utilisable" | "À venir" | "Expirée";

export function PrepaidCardsList() {
  const { allPrepaidCards: prepaidCards, reload } = usePrepaidCard();

  useEffect(() => {
    reload();
  }, []);

  const today = moment();

  const getCardStatus = (card: PrepaidCard): CardStatus => {
    if (
      moment(card.validFrom).isSameOrBefore(today) &&
      moment(card.expirationDate).isAfter(today)
    ) {
      return "Utilisable";
    } else if (
      moment(card.validFrom).isAfter(today) &&
      moment(card.expirationDate).isAfter(today)
    ) {
      return "À venir";
    } else {
      return "Expirée";
    }
  };

  const getStatusBadge = (status: CardStatus) => {
    switch (status) {
      case "Utilisable":
        return <Badge className="bg-green-200 text-green-800">{status}</Badge>;
      case "À venir":
        return (
          <Badge className="bg-yellow-200 text-yellow-800">{status}</Badge>
        );
      case "Expirée":
        return <Badge className="bg-red-200 text-red-800">{status}</Badge>;
      default:
        return null;
    }
  };

  const sortedCards = [...prepaidCards].sort((a, b) => {
    const getPriority = (card: PrepaidCard) => {
      const isUsable =
        moment(card.validFrom).isSameOrBefore(today) &&
        moment(card.expirationDate).isAfter(today);
      const isUpcoming =
        moment(card.validFrom).isAfter(today) &&
        moment(card.expirationDate).isAfter(today);

      if (isUsable) return 0;
      if (isUpcoming) return 1;

      return 2;
    };

    return getPriority(a) - getPriority(b);
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
            const status = getCardStatus(prepaidCard);

            return (
              <TableRow key={prepaidCard.documentId}>
                <TableCell>{getStatusBadge(status)}</TableCell>
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
                  {getPaymentStatusTranslation(prepaidCard.paymentStatus)}
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
