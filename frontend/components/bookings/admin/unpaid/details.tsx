"use client";

import * as React from "react";
import { X } from "lucide-react";

import { User } from "@/models/user";
import { useAdminBooking } from "@/contexts/admin/admin-booking-context";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnpaidBookingsDetailsDrawerProps {
  user: User | null;
}

export function UnpaidBookingsDetailsDrawer({
  user,
}: UnpaidBookingsDetailsDrawerProps) {
  const { markAsPaid } = useAdminBooking();

  if (!user) return null;

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
                    <Button size="sm" onClick={() => markAsPaid([booking])}>
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
