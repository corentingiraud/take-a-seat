import { AdminPendingPrepaidCardPaymentsActionMenu } from "./actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminPayments } from "@/contexts/admin/payments";

export function AdminPrepaidCardPendingPaymentsList() {
  const { prepaidCardsWithPendingPayments } = useAdminPayments();

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coworker</TableHead>
            <TableHead>Nom de la carte</TableHead>
            <TableHead>Solde actuel</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Date de début de validité</TableHead>
            <TableHead>Date d&apos;expiration</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prepaidCardsWithPendingPayments.map((prepaidCard) => (
            <TableRow key={prepaidCard.documentId}>
              <TableCell>
                {prepaidCard.user?.firstName} {prepaidCard.user?.lastName}
              </TableCell>
              <TableCell>{prepaidCard.name}</TableCell>
              <TableCell>{prepaidCard.remainingBalance}h</TableCell>
              <TableCell>
                {prepaidCard.createdAt
                  ? prepaidCard.createdAt.format("DD/MM/YYYY")
                  : "—"}
              </TableCell>
              <TableCell>
                {prepaidCard.validFrom
                  ? prepaidCard.validFrom.format("DD/MM/YYYY")
                  : "—"}
              </TableCell>
              <TableCell>
                {prepaidCard.expirationDate
                  ? prepaidCard.expirationDate.format("DD/MM/YYYY")
                  : "—"}
              </TableCell>
              <TableCell>
                <AdminPendingPrepaidCardPaymentsActionMenu
                  prepaidCard={prepaidCard}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {prepaidCardsWithPendingPayments.length === 0 && (
        <p className="mt-10 text-center">
          Toutes les cartes pré-payées sont payées 👌👏
        </p>
      )}
    </div>
  );
}
