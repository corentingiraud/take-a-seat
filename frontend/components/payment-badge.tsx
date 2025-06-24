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
    default:
      return null;
  }
}
