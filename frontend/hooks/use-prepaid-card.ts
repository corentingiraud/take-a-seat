import { useEffect, useState } from "react";

import { useStrapiAPI } from "./use-strapi-api";

import moment from "@/lib/moment";
import { useAuth } from "@/contexts/auth-context";
import { PrepaidCard } from "@/models/prepaid-card";
import { DEFAULT_DATE_FORMAT } from "@/models/utils/strapi-data";
import { PaymentStatus } from "@/models/payment-status";

export function usePrepaidCard({
  userDocumentId,
}: {
  userDocumentId?: string;
}) {
  const { user } = useAuth();
  const { fetchAll } = useStrapiAPI();

  const [allPrepaidCards, setAllPrepaidCards] = useState<PrepaidCard[]>([]);
  const [usablePrepaidCards, setUsablePrepaidCards] = useState<PrepaidCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reload = async () => {
    if (!user && !userDocumentId) return;

    try {
      setIsLoading(true);

      const allCards = await fetchAll({
        ...PrepaidCard.strapiAPIParams,
        queryParams: {
          filters: {
            user: {
              documentId: {
                $eq: userDocumentId ?? user?.documentId,
              },
            },
          },
        },
      });

      const today = moment().format(DEFAULT_DATE_FORMAT);

      const usableCards = allCards.filter((card: PrepaidCard) => {
        return (
          moment(card.validFrom).isSameOrBefore(today) &&
          moment(card.expirationDate).isAfter(today) &&
          card.paymentStatus === PaymentStatus.PAID
        );
      });

      setAllPrepaidCards(allCards);
      setUsablePrepaidCards(usableCards);
    } catch (error) {
      console.error("Erreur lors du chargement des cartes prépayées :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [userDocumentId, user]);

  return {
    reload,
    allPrepaidCards,
    usablePrepaidCards,
    isLoading,
  };
}
