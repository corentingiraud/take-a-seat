import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminBooking } from "@/contexts/admin/admin-booking-context";
import { User } from "@/models/user";

interface AdminUnpaidBookingActionMenuProps {
  user: User;
}

export function AdminUnpaidBookingActionMenu({
  user,
}: AdminUnpaidBookingActionMenuProps) {
  const { markAsPaid } = useAdminBooking();

  if (!(user.bookings && user.bookings.length >= 1)) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* <DropdownMenuItem onClick={() => viewDetails(user)}>
          Voir le détail
        </DropdownMenuItem> */}
        <DropdownMenuItem onClick={() => markAsPaid(user.bookings!)}>
          Tout marquer comme payé
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
