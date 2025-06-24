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
import { useAdminPayments } from "@/contexts/admin/payments";

interface BookingPendingPaymentsDetailsDrawerProps {
  user: User | null;
}

export function BookingPendingPaymentsDetailsDrawer({
  user,
}: BookingPendingPaymentsDetailsDrawerProps) {
  const { markAsPaid } = useAdminPayments();
  const askConfirm = useConfirm();

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
      markAsPaid([booking]);
    }
  };

  return (
    <DrawerContent className="h-full w-full max-w-xl mx-auto max-h-[90vh]">
      <DrawerHeader className="flex justify-between">
        <div>
          <DrawerTitle>{user.fullName}</DrawerTitle>
          <DrawerDescription>Réservations impayées</DrawerDescription>
        </div>
        <DrawerClose asChild>
          <Button size="icon" variant="ghost">
            <X className="size-4" />
          </Button>
        </DrawerClose>
      </DrawerHeader>
      <ScrollArea className="h-auto overflow-y-auto">
        <div className="p-4 pb-0">
          <div>
            <div className="mt-2 space-y-3 text-sm">
              {user.bookings?.map((booking, i) => (
                <div
                  key={i}
                  className="rounded-md border border-muted p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-muted-foreground">
                      {booking.toString()}
                    </div>
                    <Button size="sm" onClick={() => handleMarkAsPaid(booking)}>
                      Marquer comme payée
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </DrawerContent>
  );
}
