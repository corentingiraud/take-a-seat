"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { User } from "@/models/user";
import { useAdminBookings } from "@/contexts/admin/bookings-context";
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

interface PendingBookingsDetailsDrawerProps {
  user: User | null;
}

export function PendingBookingsDetailsDrawer({
  user,
}: PendingBookingsDetailsDrawerProps) {
  const { cancel, confirm } = useAdminBookings();
  const askConfirm = useConfirm(); // renamed to avoid conflict

  const { bookings } = useAdminBookings();

  if (!user) return null;

  const userBookings = bookings.filter(
    (booking) => booking.user?.id === user.id,
  );

  const handleCancel = async (booking: Booking) => {
    const confirmed = await askConfirm({
      title: "Annuler la réservation ?",
      description:
        "Es-tu sûr de vouloir annuler cette réservation ? Cette action est irréversible.",
      confirmText: "Oui, annuler",
      cancelText: "Non, revenir",
    });

    if (confirmed) {
      cancel([booking]);
    }
  };

  const handleConfirm = async (booking: Booking) => {
    const confirmed = await askConfirm({
      title: "Confirmer la réservation ?",
      description: "Souhaites-tu vraiment confirmer cette réservation ?",
      confirmText: "Oui, confirmer",
      cancelText: "Annuler",
    });

    if (confirmed) {
      confirm([booking]);
    }
  };

  return (
    <DrawerContent className="h-full w-full max-w-xl mx-auto max-h-[90vh]">
      <DrawerHeader className="flex justify-between">
        <div>
          <DrawerTitle>{user.fullName}</DrawerTitle>
          <DrawerDescription>Réservations à confirmer</DrawerDescription>
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
              {userBookings.map((booking, i) => (
                <div
                  key={i}
                  className="rounded-md border border-muted p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-muted-foreground">
                      {booking.toString()}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(booking)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleConfirm(booking)}>
                      <Check className="w-4 h-4" />
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
