import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { UnconfirmedBookingsDetailsDrawer } from "./details";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminBooking } from "@/contexts/admin/admin-booking-context";
import { User } from "@/models/user";
import { Drawer } from "@/components/ui/drawer";
import { useConfirm } from "@/contexts/confirm-dialog-context";

interface AdminUnconfirmedBookingActionMenuProps {
  user: User;
}

export function AdminUnconfirmedBookingActionMenu({
  user,
}: AdminUnconfirmedBookingActionMenuProps) {
  const { cancel, confirm } = useAdminBooking();
  const askConfirm = useConfirm();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!(user.bookings && user.bookings.length >= 1)) return null;

  const handleViewDetails = () => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleConfirmAll = async () => {
    const confirmed = await askConfirm({
      title: "Confirmer toutes les réservations ?",
      description: `Tu es sur le point de confirmer ${user.bookings!.length} réservation(s).`,
      confirmText: "Oui, confirmer tout",
      cancelText: "Annuler",
    });

    if (confirmed) {
      confirm(user.bookings!);
    }
  };

  const handleCancelAll = async () => {
    const confirmed = await askConfirm({
      title: "Annuler toutes les réservations ?",
      description: `Tu es sur le point d'annuler ${user.bookings!.length} réservation(s). Cette action est irréversible.`,
      confirmText: "Oui, tout annuler",
      cancelText: "Revenir",
    });

    if (confirmed) {
      cancel(user.bookings!);
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

      <UnconfirmedBookingsDetailsDrawer user={selectedUser} />
    </Drawer>
  );
}
