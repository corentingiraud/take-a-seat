import { Badge } from "@/components/ui/badge";
import { PrepaidCardStatus } from "@/models/prepaid-card";

interface CardStatusBadgeProps {
  status: PrepaidCardStatus;
}

export function CardStatusBadge({ status }: CardStatusBadgeProps) {
  switch (status) {
    case "usable":
      return <Badge className="bg-green-200 text-green-800">Utilisable</Badge>;
    case "upcoming":
      return <Badge className="bg-yellow-200 text-yellow-800">À venir</Badge>;
    case "expired":
      return <Badge className="bg-red-200 text-red-800">Expirée</Badge>;
    default:
      return null;
  }
}
