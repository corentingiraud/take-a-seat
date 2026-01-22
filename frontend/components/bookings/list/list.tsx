"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ChevronRight } from "lucide-react";
import Link from "next/link";

import { BookingStatusBadge } from "../badge";

import { BookingActionMenu } from "./actions";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPrepaidCardDialog } from "@/components/prepaid-cards/user-prepaid-card-dialog";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { capitalizeFirstLetter } from "@/lib/utils";
import { getServiceCalendarHref } from "@/lib/urls";
import { Booking } from "@/models/booking";
import { PrepaidCard } from "@/models/prepaid-card";
import { User } from "@/models/user";
import { useBookings } from "@/hooks/bookings/use-bookings";
import { useBookingActions } from "@/hooks/bookings/use-booking-actions";
import { useWeekSelector } from "@/hooks/use-week-selector";
import { useAuth } from "@/contexts/auth-context";

export function BookingsList({ user }: { user?: User }) {
  const { user: authUser } = useAuth();

  const { startDate, endDate, setWeekRange, goToNextWeek } = useWeekSelector(); 

  const effectiveUserId = user?.documentId ?? authUser?.documentId;

  const {
    bookings,
    isLoading,
    isFetching,
    reload,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useBookings({
    userDocumentId: user?.documentId,
    startDate,
    endDate,
  });

  const { cancelMany, payManyWithCard } = useBookingActions();
  const confirm = useConfirm();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPrepaidDialogOpen, setIsPrepaidDialogOpen] = useState(false);
  const [singlePayBooking, setSinglePayBooking] = useState<Booking | null>(null);

  const selectedBookings: Booking[] = useMemo(
    () => bookings.filter((b) => selectedIds.has(b.documentId)),
    [bookings, selectedIds],
  );

  // Bookings to pay: either bulk selection or single booking from action menu
  const bookingsToPay = singlePayBooking ? [singlePayBooking] : selectedBookings;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [startDate, endDate, user?.documentId]);

  const isAllSelected =
    bookings.length > 0 && bookings.every((b) => selectedIds.has(b.documentId));

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(bookings.map((b) => b.documentId)));
    else setSelectedIds(new Set());
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (checked) next.add(id);
      else next.delete(id);

      return next;
    });
  };

  const handleBulkCancel = async () => {
    if (selectedBookings.length === 0) return;

    const ok = await confirm({
      title:
        selectedBookings.length === 1
          ? "Annuler cette réservation ?"
          : `Annuler ${selectedBookings.length} réservations ?`,
      description: "Cette action est irréversible.",
    });

    if (!ok) return;

    await cancelMany(selectedBookings);
  };

  return (
    <div className="mt-7">
      <WeekSelector
        endDate={endDate}
        userDocumentId={effectiveUserId}
        startDate={startDate}
        onChange={setWeekRange}
      />

      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selectedBookings.length} sélectionné(s)
        </span>

        <UserPrepaidCardDialog
          disabled={
            bookingsToPay.length === 0 ||
            isLoading ||
            isFetching ||
            !bookingsToPay.every((b) => b.paymentStatus === "PENDING")
          }
          minCredits={bookingsToPay.length}
          open={isPrepaidDialogOpen}
          selectionLabel={
            bookingsToPay.length > 0
              ? `Choisissez une carte pour payer ${bookingsToPay.length} réservation(s).`
              : undefined
          }
          userDocumentId={user?.documentId}
          onConfirm={async (card: PrepaidCard) => {
            await payManyWithCard(bookingsToPay, card);
            setSinglePayBooking(null);
            await reload();
          }}
          onOpenChange={(open) => {
            setIsPrepaidDialogOpen(open);
            if (!open) setSinglePayBooking(null);
          }}
        />

        <Button
          disabled={
            selectedBookings.length === 0 ||
            isLoading ||
            isFetching ||
            !selectedBookings.every((b) => b.paymentStatus === "PENDING")
          }
          onClick={() => {
            setSinglePayBooking(null);
            setIsPrepaidDialogOpen(true);
          }}
        >
          Payer avec une carte
        </Button>

        <Button
          disabled={
            selectedBookings.length === 0 ||
            isLoading ||
            isFetching ||
            !selectedBookings.every((b) => b.isCancelable(authUser?.role))
          }
          variant="destructive"
          onClick={handleBulkCancel}
        >
          Annuler
        </Button>
      </div>

      <Table
        className="mt-7"
        style={bookings.length > 0 ? { minWidth: "900px" } : {}}
      >
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Tout sélectionner"
                checked={isAllSelected}
                disabled={bookings.length === 0 || isLoading || isFetching}
                onCheckedChange={(v) => toggleAll(Boolean(v))}
              />
            </TableHead>
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
            <>
              {bookings.map((booking) => {
                const isChecked = selectedIds.has(booking.documentId);

                return (
                  <TableRow key={booking.documentId}>
                    <TableCell>
                      <Checkbox
                        aria-label="Sélectionner"
                        checked={isChecked}
                        disabled={isLoading || isFetching}
                        onCheckedChange={(v) =>
                          toggleOne(booking.documentId, Boolean(v))
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {capitalizeFirstLetter(
                        booking.startDate.format("dddd DD/MM - HH[h]mm"),
                      )}
                      {" → "}
                      {booking.endDate.format("HH[h]mm")}
                    </TableCell>

                    <TableCell>
                      {booking.service?.coworkingSpace?.name}
                    </TableCell>

                    <TableCell>
                      {booking.service ? (
                        <div className="flex items-center gap-2">
                          <span className="truncate">
                            {booking.service.name}
                          </span>
                          <Link
                            aria-label={`Voir le calendrier du service ${booking.service.name}`}
                            className="transition-colors text-muted-foreground hover:text-primary"
                            href={getServiceCalendarHref({
                              coworkingSpaceId:
                                booking.service.coworkingSpace?.documentId,
                              serviceId: booking.service.documentId,
                              startDate,
                              endDate,
                            })}
                          >
                            <CalendarIcon className="shrink-0" size={16} />
                          </Link>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell>
                      <BookingStatusBadge booking={booking} />
                    </TableCell>

                    <TableCell>
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </TableCell>

                    <TableCell>
                      <BookingActionMenu
                        booking={booking}
                        onPayWithCard={(b) => {
                          setSinglePayBooking(b);
                          setIsPrepaidDialogOpen(true);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          ) : (
            <TableRow>
              <TableCell className="py-16" colSpan={7}>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Aucune réservation ...
                  </p>
                  <Button
                    disabled={isLoading || isFetching}
                    onClick={goToNextWeek}
                  >
                    Voir la semaine suivante
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? "Chargement..." : "Charger plus"}
          </Button>
        </div>
      )}
      <div className="mt-7" />
      <WeekSelector
        endDate={endDate}
        userDocumentId={effectiveUserId}
        startDate={startDate}
        onChange={setWeekRange}
      />
    </div>
  );
}
