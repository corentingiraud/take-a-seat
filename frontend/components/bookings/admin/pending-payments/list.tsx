import { useEffect } from "react";

import { AdminBookingPendingPaymentsActionMenu } from "./actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBookings } from "@/contexts/admin/bookings";

export function AdminBookingPendingPaymentsList() {
  const { usersWithPendingPayments: usersWithPendingPayments, reload } = useAdminBookings();

  useEffect(() => {
    reload();
  }, []);

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
          {usersWithPendingPayments.map((user) => (
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
      {usersWithPendingPayments.length === 0 && (
        <p className="mt-10 text-center">
          Aucune réservations pour le moment...
        </p>
      )}
    </div>
  );
}
