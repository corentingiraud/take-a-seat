import { useEffect } from "react";

import { AdminUnconfirmedBookingActionMenu } from "./actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBooking } from "@/contexts/admin/admin-booking-context";

export function AdminUnconfirmedBookingsList() {
  const { usersWithUnconfirmedBookings, reload } = useAdminBooking();

  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coworker</TableHead>
            <TableHead>Nombre de réservation à confirmer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithUnconfirmedBookings.map((user) => (
            <TableRow key={user.documentId}>
              <TableCell>
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell>{user.bookings?.length}</TableCell>
              <TableCell>
                <AdminUnconfirmedBookingActionMenu user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {usersWithUnconfirmedBookings.length === 0 && (
        <p className="mt-10 text-center">
          Aucune réservations pour le moment...
        </p>
      )}
    </div>
  );
}
