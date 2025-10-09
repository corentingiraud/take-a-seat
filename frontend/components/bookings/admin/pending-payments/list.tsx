import { AdminBookingPendingPaymentsActionMenu } from "./actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminPayments } from "@/contexts/admin/payments";

export function AdminBookingPendingPaymentsList() {
  const { usersWithPendingBookingPayments } = useAdminPayments();

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coworker</TableHead>
            <TableHead>Nombre de réservations impayées</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithPendingBookingPayments.map((user) => (
            <TableRow key={user.documentId}>
              <TableCell>
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.bookings?.length}</TableCell>
              <TableCell>
                <AdminBookingPendingPaymentsActionMenu user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {usersWithPendingBookingPayments.length === 0 && (
        <p className="mt-10 text-center">Vous êtes à jour 👌👏</p>
      )}
    </div>
  );
}
