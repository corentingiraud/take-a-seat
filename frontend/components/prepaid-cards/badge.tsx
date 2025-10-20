import { Badge } from "@/components/ui/badge";
import { PrepaidCardStatus } from "@/models/prepaid-card";

interface PrepaidCardStatusBadgeProps {
  status: PrepaidCardStatus;
}

export function PrepaidCardStatusBadge({
  status,
}: PrepaidCardStatusBadgeProps) {
  switch (status) {
    case "usable":
      return (
        <Badge className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800">
          Utilisable
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800">
          À venir
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800">
          Expirée
        </Badge>
      );
    case "unusable":
      return (
        <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800">
          Non utilisable
        </Badge>
      );
    default:
      return null;
  }
}
