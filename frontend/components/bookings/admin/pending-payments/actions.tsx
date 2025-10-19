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
import { PaymentMethod, paymentMethodToString } from "@/models/payment-method";
import { UserPrepaidCardDialog } from "@/components/prepaid-cards/user-prepaid-card-dialog";
import { PrepaidCard } from "@/models/prepaid-card";

interface AdminPendingPaymentsActionMenuProps {
  user: User;
}
export function AdminBookingPendingPaymentsActionMenu({
  user,
}: AdminPendingPaymentsActionMenuProps) {
  const { markBookingsAsPaid } = useAdminPayments();
  const askConfirm = useConfirm();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPrepaidDialogOpen, setIsPrepaidDialogOpen] = useState(false);

  if (!(user.bookings && user.bookings.length >= 1)) return null;

  const handleViewDetails = () => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleMarkAllAsPaid = async (paymentMethod: PaymentMethod) => {
    const confirmed = await askConfirm({
      title: `Tout marquer comme payé (${paymentMethodToString(paymentMethod)}) ?`,
      description: `${user.bookings!.length} réservation(s) seront marquée(s) comme payée(s) (${paymentMethodToString(paymentMethod)}).`,
    });

    if (confirmed) {
      markBookingsAsPaid(user.bookings!);
    }
  };

  const handleConfirmPrepaid = async (card: PrepaidCard) => {
    await markBookingsAsPaid(user.bookings!, card);
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DropdownMenu /* modal={false} optionnel ici */>
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
              onClick={() => handleMarkAllAsPaid(PaymentMethod.EXTERNAL)}
            >
              Marquer tout payé (CB / espèce)
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-green-600"
              onClick={() => setIsPrepaidDialogOpen(true)}
              // Option: éviter la fermeture auto du menu
              // onSelect={(e) => e.preventDefault()}
            >
              Marquer tout payé (carte prépayée)
            </DropdownMenuItem>
          </DropdownMenuContent>

          <BookingPendingPaymentsDetailsDrawer user={selectedUser} />
        </DropdownMenu>
      </Drawer>

      {/* <-- Dialog rendue hors du menu */}
      <UserPrepaidCardDialog
        autoSelectBest
        minCredits={0}
        open={isPrepaidDialogOpen}
        userDocumentId={user.documentId}
        onConfirm={handleConfirmPrepaid}
        onOpenChange={setIsPrepaidDialogOpen}
      />
    </>
  );
}
