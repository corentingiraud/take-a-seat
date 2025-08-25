"use client";

import { useMemo } from "react";

import { AdminPendingBookingActionMenu } from "./actions";

import { useAdminBookings } from "@/contexts/admin/bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/models/user";
import { UserPreview } from "@/components/users/preview";
import { Progress } from "@/components/ui/progress";

export const AdminPendingBookingsList = () => {
  const { bookings, loading, actionType, progress } = useAdminBookings();

  const users: User[] = useMemo(() => {
    const map = new Map<number, User>();

    bookings.forEach((booking) => {
      const user = booking.user;

      if (!user || !user.id) return;
      const existing = map.get(user.id);

      if (existing) {
        existing.bookings?.push(booking);
      } else {
        map.set(
          user.id,
          new User({
            ...user,
            bookings: [booking],
          }),
        );
      }
    });

    // turn into array + sort
    return User.sortAlphabetically(Array.from(map.values()));
  }, [bookings]);

  const showActionProgress = loading && actionType !== null;

  return (
    <div className="space-y-3">
      {showActionProgress && (
        <div className="rounded-md border p-3">
          <div className="mb-2 text-sm">
            {actionType === "confirm"
              ? "Confirmation en cours…"
              : "Annulation en cours…"}
          </div>
          <Progress value={progress * 100} />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coworker</TableHead>
            <TableHead>Nombre de réservation à confirmer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <UserPreview user={user} />
              </TableCell>
              <TableCell>{user.bookings?.length || 0}</TableCell>
              <TableCell>
                <AdminPendingBookingActionMenu user={user} />
              </TableCell>
            </TableRow>
          ))}

          {users.length === 0 && (
            <TableRow>
              <TableCell className="text-sm text-muted-foreground" colSpan={3}>
                {loading
                  ? "Chargement des réservations…"
                  : "Aucune réservation en attente."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
