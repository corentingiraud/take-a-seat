"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

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

interface UnconfirmedBookingsDetailsDrawerProps {
  user: User | null;
}

export function UnconfirmedBookingsDetailsDrawer({
  user,
}: UnconfirmedBookingsDetailsDrawerProps) {
  const { cancel, confirm } = useAdminBooking();

  if (!user) return null;

  return (
    <DrawerContent className="h-full w-full max-w-xl mx-auto max-h-[90vh]">
      <DrawerHeader className="flex justify-between">
        <div>
          <DrawerTitle>{user.fullName}</DrawerTitle>
          <DrawerDescription>Réservation à confirmer</DrawerDescription>
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
                    <DrawerClose asChild>
                      <Button
                        className="text-red-600 border-red-500 hover:bg-red-50"
                        size="sm"
                        variant="outline"
                        onClick={() => cancel([booking])}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button
                        className="text-green-600 border-green-500 hover:bg-green-50"
                        size="sm"
                        variant="outline"
                        onClick={() => confirm([booking])}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </DrawerClose>
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
