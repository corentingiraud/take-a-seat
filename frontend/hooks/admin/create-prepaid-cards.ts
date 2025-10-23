"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import moment from "@/lib/moment";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { User } from "@/models/user";
import { PrepaidCard } from "@/models/prepaid-card";
import { PaymentStatus } from "@/models/payment-status";

export function useCreatePrepaidCards() {
  const { fetchAll, create } = useStrapiAPI();
  const qc = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const data = await fetchAll<User>({
        ...User.strapiAPIParams,
        queryParams: { sort: ["lastName:asc"] },
      });

      return data;
    },
  });

  const reload = async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const upcomingMonths = Array.from({ length: 7 }, (_, i) => {
    const date = moment().startOf("month").add(i, "months");

    return {
      label: date.format("MMMM YYYY"),
      value: date.toISOString(),
      date: date.toDate(),
    };
  });

  const isFormValid = (
    selectedMonth: Date,
    selectedUsers: User[],
    customHours: string,
  ): boolean => {
    const hours = parseInt(customHours, 10);

    if (isNaN(hours) || hours <= 0) return false;
    if (selectedUsers.length === 0) return false;
    if (!(selectedMonth instanceof Date) || isNaN(selectedMonth.getTime()))
      return false;

    return true;
  };

  const createPrepaidCards = useMutation({
    mutationFn: async ({
      selectedMonth,
      selectedUsers,
      customHours,
    }: {
      selectedMonth: Date;
      selectedUsers: User[];
      customHours: string;
    }) => {
      const hours = parseInt(customHours, 10);
      const validFrom = moment(selectedMonth).startOf("month");
      const expirationDate = moment(selectedMonth).endOf("month");

      await Promise.all(
        selectedUsers.map((user) =>
          create({
            contentType: PrepaidCard.contentType,
            factory: PrepaidCard.fromJson,
            object: new PrepaidCard({
              name: PrepaidCard.buildCardName(user, validFrom, hours),
              validFrom: validFrom,
              expirationDate: expirationDate,
              remainingBalance: hours,
              initialBalance: hours,
              user: user,
              paymentStatus: PaymentStatus.PENDING,
            }),
          }),
        ),
      );
    },
    onSuccess: async (_data, variables) => {
      const count = variables.selectedUsers.length;

      toast.success(
        count === 1
          ? "Carte prépayée créée avec succès !"
          : "Cartes prépayées créées avec succès !",
      );
      await qc.invalidateQueries({ queryKey: ["admin", "users"] });
      await qc.invalidateQueries({ queryKey: ["prepaid-cards"] });
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la création des cartes.");
    },
  });

  return {
    users: usersQuery.data ?? [],
    isLoadingUsers: usersQuery.isLoading,
    reload,
    upcomingMonths,
    isFormValid,
    handleSubmit: createPrepaidCards.mutateAsync,
    isSubmitting: createPrepaidCards.isPending,
  };
}
