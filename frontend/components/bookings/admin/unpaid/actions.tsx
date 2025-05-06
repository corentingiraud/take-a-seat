import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { UnpaidBookingsDetailsDrawer } from "./details";

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

interface AdminUnpaidBookingActionMenuProps {
  user: User;
}

export function AdminUnpaidBookingActionMenu({
  user,
}: AdminUnpaidBookingActionMenuProps) {
  const { markAsPaid } = useAdminBooking();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!(user.bookings && user.bookings.length >= 1)) return null;

  const handleViewDetails = () => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
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
          <DropdownMenuItem onClick={() => markAsPaid(user.bookings!)}>
            Tout marquer comme payé
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UnpaidBookingsDetailsDrawer user={selectedUser} />
    </Drawer>
  );
}
