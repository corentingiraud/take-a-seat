"use client";

import * as React from "react";
import { X } from "lucide-react";

import { User } from "@/models/user";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { Booking } from "@/models/booking";
import { useAdminBookingPaymentActions } from "@/hooks/admin/payments/bookings/use-admin-booking-payment-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminBookingPayments } from "@/hooks/admin/payments/bookings/use-admin-booking-payments";

interface BookingPendingPaymentsDetailsDrawerProps {
  user: User | null;
  onClose?: () => void;
}

export function BookingPendingPaymentsDetailsDrawer({
  user,
  onClose,
}: BookingPendingPaymentsDetailsDrawerProps) {
  const { getUserBookings } = useAdminBookingPayments();
  const { markBookingsAsPaid } = useAdminBookingPaymentActions();
  const askConfirm = useConfirm();

  const userBookings = getUserBookings(user?.documentId);

  const groupedBookings = React.useMemo(() => {
    const map = new Map<string, Map<string, Booking[]>>();

    userBookings?.forEach((booking) => {
      const coworkingName =
        booking.service?.coworkingSpace?.name || "Sans espace coworking";
      const serviceName = booking.service?.name || "Service inconnu";

      if (!map.has(coworkingName)) {
        map.set(coworkingName, new Map());
      }

      const serviceMap = map.get(coworkingName)!;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, []);
      }

      serviceMap.get(serviceName)!.push(booking);
    });

    return map;
  }, [userBookings]);

  if (!user) return null;

  const handleMarkAsPaid = async (booking: Booking) => {
    const confirmed = await askConfirm({
      title: "Marquer la réservation comme payée ?",
      description:
        "Cette action enregistrera la réservation comme payée. Es-tu sûr ?",
      confirmText: "Oui, marquer comme payée",
      cancelText: "Annuler",
    });

    if (confirmed) {
      markBookingsAsPaid([booking]);
    }
  };

  return (
    <DrawerContent className="h-full w-full max-w-3xl mx-auto max-h-[90vh]">
      <DrawerHeader className="flex justify-between items-center">
        <div>
          <DrawerTitle>{user.fullName}</DrawerTitle>
          <DrawerDescription>Réservations impayées</DrawerDescription>
        </div>
        <DrawerClose asChild>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </DrawerClose>
      </DrawerHeader>

      <ScrollArea className="h-auto overflow-y-auto px-4 pb-6">
        {Array.from(groupedBookings.entries()).map(
          ([coworkingName, servicesMap]) => (
            <div key={coworkingName} className="mb-8">
              <h3 className="text-lg font-semibold mb-3">
                {coworkingName}
              </h3>

              {Array.from(servicesMap.entries()).map(
                ([serviceName, bookings]) => (
                  <div key={serviceName} className="mb-5">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {serviceName}
                    </h4>

                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Statut réservation</TableHead>
                            <TableHead>Statut paiement</TableHead>
                            <TableHead className="text-right">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking, i) => (
                            <TableRow key={i}>
                              <TableCell className="whitespace-nowrap">
                                {booking.toString()}
                              </TableCell>
                              <TableCell>
                                {booking.bookingStatus}
                              </TableCell>
                              <TableCell>
                                {booking.paymentStatus}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(booking)}
                                >
                                  Marquer comme payée
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )
              )}
            </div>
          )
        )}
      </ScrollArea>
    </DrawerContent>
  );
}
