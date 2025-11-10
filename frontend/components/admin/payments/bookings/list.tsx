"use client";

import { AdminBookingPendingPaymentsActionMenu } from "./actions";

import { useAdminBookingPayments } from "@/hooks/admin/payments/bookings/use-admin-booking-payments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPreview } from "@/components/users/preview";
import { Drawer } from "@/components/ui/drawer";
import { BookingPendingPaymentsDetailsDrawer } from "./details";
import { useState } from "react";
import { User } from "@/models/user";
export function AdminBookingPendingPaymentsList() {
  const { usersWithPendingBookingPayments, isLoading, isFetching } =
    useAdminBookingPayments();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
          {isLoading &&
            Array.from({ length: 2 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-28 animate-pulse rounded bg-muted" />
                </TableCell>
              </TableRow>
            ))}

          {!isFetching &&
            usersWithPendingBookingPayments.map((user) => (
              <TableRow key={user.documentId} aria-busy={isFetching}>
                <TableCell>
                  <UserPreview user={user} />
                </TableCell>
                <TableCell>{user.bookings?.length ?? 0}</TableCell>
                <TableCell>
                  <AdminBookingPendingPaymentsActionMenu user={user} onViewDetails={() => {
                    setSelectedUser(user)
                    setIsDrawerOpen(true)
                  }} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {!isLoading && usersWithPendingBookingPayments.length === 0 && (
        <p className="mt-10 text-center">Vous êtes à jour 👌👏</p>
      )}

      {isFetching && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Actualisation en cours…
        </p>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <BookingPendingPaymentsDetailsDrawer
          user={selectedUser}
        />
      </Drawer>
    </div>
  );
}
