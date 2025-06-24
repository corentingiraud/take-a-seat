import { useEffect } from "react";

import { BookingStatusBadge } from "../badge";

import { BookingActionMenu } from "./actions";

import { useBooking } from "@/contexts/booking-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/payment-badge";

export function BookingsList() {
  const { bookings, reload } = useBooking();

  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.documentId}>
              <TableCell>{booking.toString()}</TableCell>
              <TableCell>
                <BookingStatusBadge booking={booking} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </TableCell>
              <TableCell>
                <BookingActionMenu booking={booking} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {bookings.length === 0 && (
        <p className="mt-10 text-center">
          Aucune réservations pour le moment...
        </p>
      )}
    </div>
  );
}
