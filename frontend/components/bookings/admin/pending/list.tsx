"use client";

import { AdminPendingBookingActionMenu } from "./actions";

import { useAdminBookings } from "@/contexts/admin/bookings-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/models/user";

export const AdminPendingBookingsList = () => {
  const { bookings } = useAdminBookings();

  // Grouper les bookings par user.id
  const bookingsGroupedByUser: Record<string, { user: User; count: number }> =
    {};

  bookings.forEach((booking) => {
    const user = booking.user;

    if (!user || !user.id) return;

    if (!bookingsGroupedByUser[user.id]) {
      bookingsGroupedByUser[user.id] = {
        user: new User({
          ...user,
          bookings: [booking],
        }),
        count: 1,
      };
    } else {
      bookingsGroupedByUser[user.id].user.bookings!.push(booking);
      bookingsGroupedByUser[user.id].count += 1;
    }
  });

  const groupedUsers = Object.values(bookingsGroupedByUser);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Coworker</TableHead>
          <TableHead>Nombre de réservation à confirmer</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedUsers.map(({ user, count }) => (
          <TableRow key={user.id}>
            <TableCell>
              {user.firstName} {user.lastName}
            </TableCell>
            <TableCell>{count}</TableCell>
            <TableCell>
              <AdminPendingBookingActionMenu user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
