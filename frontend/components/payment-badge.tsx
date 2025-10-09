import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/models/payment-status";

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentBadgeProps) {
  switch (status) {
    case PaymentStatus.PENDING:
      return (
        <Badge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800">
          À payer
        </Badge>
      );
    case PaymentStatus.PAID:
      return (
        <Badge className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800">
          Payée
        </Badge>
      );
    case PaymentStatus.REFUNDED:
      return (
        <Badge className="bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800">
          Remboursée
        </Badge>
      );
    case PaymentStatus.CANCELLED:
      return (
        <Badge className="bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800">
          Annulée
        </Badge>
      );
    default:
      return null;
  }
}
