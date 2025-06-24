"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

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
  const { bookings, cancel, confirm } = useAdminBookings();
  const askConfirm = useConfirm();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 🧠 bookings dynamiques du user
  const userBookings = bookings.filter((b) => b.user?.id === user.id);

  if (userBookings.length === 0) return null;

  const handleViewDetails = () => {
    setIsDrawerOpen(true);
  };

  const handleConfirmAll = async () => {
    const confirmed = await askConfirm({
      title: "Confirmer toutes les réservations ?",
      description: `${userBookings.length} réservation(s) seront confirmée(s).`,
    });

    if (confirmed) {
      confirm(userBookings);
    }
  };

  const handleCancelAll = async () => {
    const confirmed = await askConfirm({
      title: "Annuler toutes les réservations ?",
      description: `${userBookings.length} réservation(s) seront annulée(s). Cette action est irréversible.`,
    });

    if (confirmed) {
      cancel(userBookings);
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewDetails}>
            Voir le détail
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-green-600"
            onClick={handleConfirmAll}
          >
            Tout confirmer
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={handleCancelAll}>
            Tout annuler
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PendingBookingsDetailsDrawer user={user} />
    </Drawer>
  );
}
