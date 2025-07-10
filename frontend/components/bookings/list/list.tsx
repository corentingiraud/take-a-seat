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
import { WeekSelector } from "@/components/ui/week-selector";

export function BookingsList() {
  const { bookings, reload, setWeekRange } = useBooking();

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="mt-7">
      <WeekSelector onWeekChange={setWeekRange} />
      <Table className="mt-7">
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
        <p className="mt-10 text-sm text-center text-muted-foreground">
          Aucune réservations ...
        </p>
      )}
    </div>
  );
}
