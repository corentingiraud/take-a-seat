import { toast } from "sonner";

import { Booking } from "@/models/booking";
import { PrepaidCard } from "@/models/prepaid-card";
import { API_URL } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";

interface UseBulkCreateBookingsParams {
  bookings: Booking[],
  userDocumentId?: string,
}

export function useBulkCreateBookings({bookings, userDocumentId}: UseBulkCreateBookingsParams) {
  const { getJWT } = useAuth();

  async function bulkCreate(prepaidCard: PrepaidCard | null) {
    if (bookings.length === 0) {
      toast.error("Aucune réservation à enregistrer.");

      return;
    }

    try {
      const url = `${API_URL}/${Booking.contentType}/bulk-create`;

      const headers = new Headers({
        "Content-Type": "application/json",
      });

      const token = getJWT();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const body: any = {
        serviceDocumentId: bookings[0].service?.documentId,
        bookings: bookings.map((booking) => ({
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
        })),
      };

      if (prepaidCard) {
        body.prepaidCardDocumentId = prepaidCard.documentId;
      }

      if (userDocumentId) {
        body.userDocumentId = userDocumentId;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Échec de la création des réservations");
      }

      const message =
        bookings.length > 1
          ? "Vos réservations ont bien été enregistrées."
          : "Votre réservation a bien été enregistrée.";

      toast.success(message);
    } catch (err) {
      toast.error("Une erreur est survenue, merci de réessayer.");
      throw err;
    }
  }

  return bulkCreate;
}
