import { useState } from "react";
import { MoreHorizontal, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { PrepaidCard } from "@/models/prepaid-card";
import { useAdminPrepaidCardPaymentActions } from "@/hooks/admin/payments/prepaid-cards/use-admin-prepaid-card-payment-actions";

interface AdminPendingPrepaidCardPaymentsActionMenuProps {
  prepaidCard: PrepaidCard;
}

export function AdminPendingPrepaidCardPaymentsActionMenu({
  prepaidCard,
}: AdminPendingPrepaidCardPaymentsActionMenuProps) {
  const { markPrepaidCardAsPaid, isMarkingPrepaidCardAsPaid } =
    useAdminPrepaidCardPaymentActions();
  const askConfirm = useConfirm();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isBusy = isMarkingPrepaidCardAsPaid || submitting;

  const handleMarkAsPaid = async () => {
    if (isBusy) return;
    const confirmed = await askConfirm({
      title: "Marquer comme payée ?",
      description: `"${prepaidCard.name}" sera marquée comme payée.`,
    });

    if (!confirmed) return;

    try {
      setSubmitting(true);
      await markPrepaidCardAsPaid(prepaidCard);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={(o) => !isBusy && setOpen(o)}>
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
        <DropdownMenuItem
          className="text-green-600"
          disabled={isBusy}
          onClick={handleMarkAsPaid}
        >
          Marquer comme payée
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
