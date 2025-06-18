import { useEffect, useState } from "react";
import moment from "moment";

import { useStrapiAPI } from "./use-strapi-api";

import { useAuth } from "@/contexts/auth-context";
import { PrepaidCard } from "@/models/prepaid-card";
import { DEFAULT_DATE_FORMAT } from "@/models/utils/strapi-data";

export function usePrepaidCard() {
  const { user } = useAuth();
  const { fetchAll } = useStrapiAPI();
  const [allPrepaidCards, setAllPrepaidCards] = useState<PrepaidCard[]>([]);
  const [usablePrepaidCards, setUsablePrepaidCards] = useState<PrepaidCard[]>([]);

  const reload = async () => {
    if (!user) return;

    const allCards = await fetchAll({
      ...PrepaidCard.strapiAPIParams,
      queryParams: {
        filters: {
          user: {
            id: {
              $eq: user.id,
            },
          },
        },
      },
    });

    const today = moment().format(DEFAULT_DATE_FORMAT);

    const usableCards = allCards.filter((card: PrepaidCard) => {
      return (
        moment(card.validFrom).isSameOrBefore(today) &&
        moment(card.expirationDate).isAfter(today)
      );
    });

    setAllPrepaidCards(allCards);
    setUsablePrepaidCards(usableCards);
  };

  useEffect(() => {
    reload();
  }, [user]);

  return {
    reload,
    allPrepaidCards,
    usablePrepaidCards,
  };
}
