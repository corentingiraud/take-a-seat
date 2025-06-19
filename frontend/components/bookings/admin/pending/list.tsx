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

  const users: User[] = [];

  bookings.forEach((booking) => {
    const user = booking.user;

    if (!user || !user.id) return;

    const existingUser = users.find((u) => u.id === user.id);

    if (existingUser) {
      existingUser.bookings?.push(booking);
    } else {
      users.push(
        new User({
          ...user,
          bookings: [booking],
        }),
      );
    }
  });

  const sortedUsers = User.sortAlphabetically(users);

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
        {sortedUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              {user.lastName} {user.firstName}
            </TableCell>
            <TableCell>{user.bookings?.length || 0}</TableCell>
            <TableCell>
              <AdminPendingBookingActionMenu user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
