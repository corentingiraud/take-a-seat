import { useEffect, useState } from "react";
import moment from "moment";

import { useStrapiAPI } from "./use-strapi-api";

import { useAuth } from "@/contexts/auth-context";
import { PrepaidCard } from "@/models/prepaid-card";
import { DEFAULT_DATE_FORMAT } from "@/models/utils/strapi-data";

export function usePrepaidCard() {
  const { user } = useAuth();
  const { fetchAll } = useStrapiAPI();
  const [prepaidCards, setPrepaidCards] = useState<PrepaidCard[]>([]);

  const reload = async () => {
    if (!user) return;

    fetchAll({
      ...PrepaidCard.strapiAPIParams,
      queryParams: {
        filters: {
          user: {
            id: {
              $eq: user.id,
            },
          },
          expirationDate: {
            $gt: moment().format(DEFAULT_DATE_FORMAT),
          },
        },
      },
    }).then((prepaidCards) => {
      setPrepaidCards(prepaidCards);
    });
  };

  useEffect(() => {
    reload();
  }, [user]);

  return { reload, prepaidCards };
}
