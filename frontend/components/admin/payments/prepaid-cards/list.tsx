import { AdminPendingPrepaidCardPaymentsActionMenu } from "./actions";

import { useAdminPrepaidCardPayments } from "@/hooks/admin/payments/prepaid-cards/use-admin-prepaid-card-payments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPreview } from "@/components/users/preview";
import { PrepaidCardBalanceProgressBar } from "@/components/prepaid-cards/balance-progress-bar";

export function AdminPrepaidCardPendingPaymentsList() {
  const { prepaidCardsWithPendingPayments, isLoading, isFetching } =
    useAdminPrepaidCardPayments();

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coworker</TableHead>
            <TableHead>Nom de la carte</TableHead>
            <TableHead>Solde</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Date de début de validité</TableHead>
            <TableHead>Date d&apos;expiration</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 2 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-10 animate-pulse rounded bg-muted" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading &&
            prepaidCardsWithPendingPayments.map((prepaidCard) => (
              <TableRow key={prepaidCard.documentId} aria-busy={isFetching}>
                <TableCell>
                  {prepaidCard.user ? (
                    <UserPreview user={prepaidCard.user} />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{prepaidCard.name}</TableCell>
                <TableCell>
                  <PrepaidCardBalanceProgressBar
                    initial={prepaidCard.initialBalance}
                    remaining={prepaidCard.remainingBalance}
                  />
                </TableCell>
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

      {!isLoading && prepaidCardsWithPendingPayments.length === 0 && (
        <p className="mt-10 text-center">
          Toutes les cartes prépayées sont payées 👌👏
        </p>
      )}

      {isFetching && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Actualisation en cours…
        </p>
      )}
    </div>
  );
}
