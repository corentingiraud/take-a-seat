"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { Booking } from "@/models/booking";
import { PrepaidCard } from "@/models/prepaid-card";
import { usePrepaidCard } from "@/hooks/use-prepaid-card";
import { useAuth } from "@/contexts/auth-context";
import PrepaidCardSelect from "@/components/prepaid-cards/select";
import {
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export function BookingsList() {
  const {
    bookings,
    reload,
    setWeekRange,
    startDate,
    endDate,
    goToNextWeek,
    cancelMany,
    payManyWithCard,
    isLoading,
  } = useBooking();
  const { user } = useAuth();

  const confirm = useConfirm();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<PrepaidCard | null>(null);

  const { usablePrepaidCards } = usePrepaidCard({
    userDocumentId: user?.documentId,
  });

  const selectedBookings: Booking[] = useMemo(
    () => bookings.filter((b) => selectedIds.has(b.documentId)),
    [bookings, selectedIds],
  );

  const neededCredits = selectedBookings.length;
  const eligibleCards = useMemo(
    () => usablePrepaidCards.filter((c) => c.remainingBalance >= neededCredits),
    [usablePrepaidCards, neededCredits],
  );

  const handleConfirmPayWithCard = async () => {
    if (!selectedCard) return;
    await payManyWithCard(selectedBookings, selectedCard);
    await reload();
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [bookings]);

  const isAllSelected =
    bookings.length > 0 && bookings.every((b) => selectedIds.has(b.documentId));

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(bookings.map((b) => b.documentId)));
    } else {
      setSelectedIds(new Set());
    }
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
        startDate={startDate}
        onChange={setWeekRange}
      />

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selectedBookings.length} sélectionné(s)
        </span>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={
                selectedBookings.length === 0 ||
                isLoading ||
                !selectedBookings.every((b) => b.paymentStatus === "PENDING")
              }
            >
              Payer avec une carte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sélectionner une carte</DialogTitle>
              <DialogDescription>
                Choisissez une carte pour payer {selectedBookings.length}{" "}
                réservation(s).
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              <PrepaidCardSelect
                autoSelectBest
                cards={eligibleCards}
                disabled={isLoading}
                placeholder="Sélectionnez une carte"
                value={selectedCard}
                onChange={setSelectedCard}
              />
              {eligibleCards.length === 0 && selectedBookings.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucune carte ne possède assez de crédits pour{" "}
                  {selectedBookings.length} réservation(s).
                </p>
              )}
            </div>

            <DialogClose asChild>
              <DialogFooter className="mt-6">
                <Button variant="secondary">Annuler</Button>
                <Button
                  disabled={!selectedCard || isLoading}
                  onClick={handleConfirmPayWithCard}
                >
                  Confirmer le paiement
                </Button>
              </DialogFooter>
            </DialogClose>
          </DialogContent>
        </Dialog>

        <Button
          disabled={
            selectedBookings.length === 0 ||
            isLoading ||
            !selectedBookings.every((b) => b.isCancelable)
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
                disabled={bookings.length === 0 || isLoading}
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
            bookings.map((booking) => {
              const isChecked = selectedIds.has(booking.documentId);

              return (
                <TableRow key={booking.documentId}>
                  <TableCell>
                    <Checkbox
                      aria-label="Sélectionner"
                      checked={isChecked}
                      disabled={isLoading}
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
              );
            })
          ) : (
            // ÉTAT VIDE
            <TableRow>
              <TableCell className="py-16" colSpan={7}>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Aucune réservation ...
                  </p>
                  <Button disabled={isLoading} onClick={goToNextWeek}>
                    Voir la semaine suivante
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>
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
