import { useState } from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";

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
import { PaymentMethod, paymentMethodToString } from "@/models/payment-method";
import { UserPrepaidCardDialog } from "@/components/prepaid-cards/user-prepaid-card-dialog";
import { PrepaidCard } from "@/models/prepaid-card";
import { useAdminBookingPaymentActions } from "@/hooks/admin/payments/bookings/use-admin-booking-payment-actions";

interface AdminPendingPaymentsActionMenuProps {
  user: User;
}

export function AdminBookingPendingPaymentsActionMenu({
  user,
}: AdminPendingPaymentsActionMenuProps) {
  const { markBookingsAsPaid, isMarkingBookingsAsPaid } =
    useAdminBookingPaymentActions();

  const askConfirm = useConfirm();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPrepaidDialogOpen, setIsPrepaidDialogOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const isBusy = isMarkingBookingsAsPaid || submitting;

  if (!user.bookings || user.bookings.length < 1) return null;

  const handleViewDetails = () => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleMarkAllAsPaid = async (paymentMethod: PaymentMethod) => {
    const confirmed = await askConfirm({
      title: `Tout marquer comme payé (${paymentMethodToString(paymentMethod)}) ?`,
      description: `${user.bookings!.length} réservation(s) seront marquée(s) comme payée(s) (${paymentMethodToString(paymentMethod)}).`,
    });

    if (!confirmed) return;

    try {
      setSubmitting(true);
      await markBookingsAsPaid(user.bookings!);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPrepaid = async (card: PrepaidCard) => {
    try {
      setSubmitting(true);
      await markBookingsAsPaid(user.bookings!, card);
    } finally {
      setIsPrepaidDialogOpen(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DropdownMenu>
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
            <DropdownMenuItem disabled={isBusy} onClick={handleViewDetails}>
              Voir le détail
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-green-600"
              disabled={isBusy}
              onClick={() => handleMarkAllAsPaid(PaymentMethod.EXTERNAL)}
            >
              Marquer tout comme payé (CB / espèce)
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-green-600"
              disabled={isBusy}
              onClick={() => setIsPrepaidDialogOpen(true)}
            >
              Marquer tout payé (carte prépayée)
            </DropdownMenuItem>
          </DropdownMenuContent>

          <BookingPendingPaymentsDetailsDrawer user={selectedUser} />
        </DropdownMenu>
      </Drawer>

      <UserPrepaidCardDialog
        autoSelectBest
        minCredits={0}
        open={isPrepaidDialogOpen}
        userDocumentId={user.documentId}
        onConfirm={handleConfirmPrepaid}
        onOpenChange={(open) => {
          if (!isBusy) setIsPrepaidDialogOpen(open);
        }}
      />
    </>
  );
}
