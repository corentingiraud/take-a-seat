import { useEffect } from "react";

import { AdminUnpaidBookingActionMenu } from "./actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBooking } from "@/contexts/admin/admin-booking-context";

export function AdminUnpaidBookingsList() {
  const { usersWithUnpaidBookings, reload } = useAdminBooking();

  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coworker</TableHead>
            <TableHead>Nombre de réservation impayée.s</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithUnpaidBookings.map((user) => (
            <TableRow key={user.documentId}>
              <TableCell>
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.bookings?.length}</TableCell>
              <TableCell>
                <AdminUnpaidBookingActionMenu user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {usersWithUnpaidBookings.length === 0 && (
        <p className="mt-10 text-center">
          Aucune réservations pour le moment...
        </p>
      )}
    </div>
  );
}
