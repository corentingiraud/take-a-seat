import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { BookingPendingPaymentsDetailsDrawer } from "./details";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/models/user";
import { Drawer } from "@/components/ui/drawer";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { useAdminPayments } from "@/contexts/admin/payments";

interface AdminPendingPaymentsActionMenuProps {
  user: User;
}

export function AdminBookingPendingPaymentsActionMenu({
  user,
}: AdminPendingPaymentsActionMenuProps) {
  const { markBookingsAsPaid: markAsPaid } = useAdminPayments();
  const askConfirm = useConfirm();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!(user.bookings && user.bookings.length >= 1)) return null;

  const handleViewDetails = () => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleMarkAllAsPaid = async () => {
    const confirmed = await askConfirm({
      title: "Tout marquer comme payé ?",
      description: `${user.bookings!.length} réservation(s) seront marquée(s) comme payée(s).`,
    });

    if (confirmed) {
      markAsPaid(user.bookings!);
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
            onClick={handleMarkAllAsPaid}
          >
            Tout marquer comme payé
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BookingPendingPaymentsDetailsDrawer user={selectedUser} />
    </Drawer>
  );
}
