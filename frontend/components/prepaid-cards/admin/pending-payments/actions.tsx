import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { useAdminPayments } from "@/contexts/admin/payments";
import { PrepaidCard } from "@/models/prepaid-card";

interface AdminPendingPrepaidCardPaymentsActionMenuProps {
  prepaidCard: PrepaidCard;
}

export function AdminPendingPrepaidCardPaymentsActionMenu({
  prepaidCard,
}: AdminPendingPrepaidCardPaymentsActionMenuProps) {
  const { markPrepaidCardAsPaid } = useAdminPayments();
  const askConfirm = useConfirm();

  const handleMarkAsPaid = async () => {
    const confirmed = await askConfirm({
      title: "Marquer comme payée ?",
      description: `"${prepaidCard.name}" sera marquée comme payée.`,
    });

    if (confirmed) {
      markPrepaidCardAsPaid(prepaidCard);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-green-600" onClick={handleMarkAsPaid}>
          Marquer comme payée
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
