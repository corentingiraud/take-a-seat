"use client";

import { useEffect } from "react";
import { ChevronRight } from "lucide-react";

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
  TableFooter,
} from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/payment-badge";
import { WeekSelector } from "@/components/ui/week-selector";
import { Button } from "@/components/ui/button";
import { capitalizeFirstLetter } from "@/lib/utils";

export function BookingsList() {
  const { bookings, reload, setWeekRange, startDate, endDate, goToNextWeek } =
    useBooking();

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="mt-7">
      <WeekSelector
        endDate={endDate}
        startDate={startDate}
        onChange={setWeekRange}
      />

      <Table
        className="mt-7"
        style={bookings.length > 0 ? { minWidth: "900px" } : {}}
      >
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Espace</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow key={booking.documentId}>
                <TableCell>
                  {capitalizeFirstLetter(
                    booking.startDate.format("dddd DD/MM - HH[h]mm"),
                  )}
                  {" → "}
                  {booking.endDate.format("HH[h]mm")}
                </TableCell>
                <TableCell>{booking.service?.coworkingSpace?.name}</TableCell>
                <TableCell>{booking.service?.name}</TableCell>
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
            ))
          ) : (
            // ÉTAT VIDE : centré au milieu du tableau + bouton "Voir la semaine suivante"
            <TableRow>
              <TableCell className="py-16" colSpan={6}>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Aucune réservation ...
                  </p>
                  <Button onClick={goToNextWeek}>
                    Voir la semaine suivante
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        {/* Footer avec la navigation compacte */}
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  Semaine du {startDate.format("D MMMM")} au{" "}
                  {endDate.format("D MMMM YYYY")}
                </p>

                <div className="w-fit">
                  <WeekSelector
                    compact
                    endDate={endDate}
                    startDate={startDate}
                    onChange={setWeekRange}
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
