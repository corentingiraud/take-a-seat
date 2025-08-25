"use client";

import { useState } from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";

import { PendingBookingsDetailsDrawer } from "./details";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminBookings } from "@/contexts/admin/bookings";
import { User } from "@/models/user";
import { Drawer } from "@/components/ui/drawer";
import { useConfirm } from "@/contexts/confirm-dialog-context";

interface AdminPendingBookingActionMenuProps {
  user: User;
}

export function AdminPendingBookingActionMenu({
  user,
}: AdminPendingBookingActionMenuProps) {
  const { bookings, cancel, confirm, loading, actionType, progress } =
    useAdminBookings();
  const askConfirm = useConfirm();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const userBookings = bookings.filter((b) => b.user?.id === user.id);

  if (userBookings.length === 0) return null;

  const isMutating = loading && actionType !== null; // true during confirm/cancel
  const isBusy = isMutating; // alias for readability

  const handleViewDetails = () => {
    setIsDrawerOpen(true);
  };

  const handleConfirmAll = async () => {
    const confirmed = await askConfirm({
      title: "Confirmer toutes les réservations ?",
      description: `${userBookings.length} réservation(s) seront confirmée(s).`,
    });

    if (confirmed) {
      await confirm(userBookings); // await to ensure UI state lines up
    }
  };

  const handleCancelAll = async () => {
    const confirmed = await askConfirm({
      title: "Annuler toutes les réservations ?",
      description: `${userBookings.length} réservation(s) seront annulée(s). Cette action est irréversible.`,
    });

    if (confirmed) {
      await cancel(userBookings); // await here too
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-busy={isBusy}
            disabled={isBusy}
            size="icon"
            variant="outline"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={loading} onClick={handleViewDetails}>
            Voir le détail
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-green-600"
            disabled={isBusy}
            onClick={handleConfirmAll}
          >
            {isMutating && actionType === "confirm"
              ? `Confirmation… ${Math.round(progress * 100)}%`
              : "Tout confirmer"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            disabled={isBusy}
            onClick={handleCancelAll}
          >
            {isMutating && actionType === "cancel"
              ? `Annulation… ${Math.round(progress * 100)}%`
              : "Tout annuler"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PendingBookingsDetailsDrawer user={user} />
    </Drawer>
  );
}
