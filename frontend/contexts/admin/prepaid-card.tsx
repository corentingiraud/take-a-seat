"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import moment from "moment";
import { toast } from "sonner";

import { User } from "@/models/user";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { SubscriptionType } from "@/config/constants";
import { PrepaidCard } from "@/models/prepaid-card";
import { PaymentStatus } from "@/models/payment-status";

interface AdminPrepaidCardsContextType {
  users: User[];
  reload: () => void;
  upcomingMonths: { label: string; value: string; date: Date }[];
  handleSubmit: (params: {
    subscription: SubscriptionType | null;
    selectedMonth: Date;
    selectedUsers: User[];
    customHours: string;
  }) => void;
  isFormValid: (
    selectedMonth: Date,
    selectedUsers: User[],
    customHours: string,
  ) => boolean;
}

interface AdminPrepaidCardsProviderProps {
  children: ReactNode;
}

const AdminPrepaidCardsContext = createContext<
  AdminPrepaidCardsContextType | undefined
>(undefined);

export const AdminPrepaidCardsProvider = ({
  children,
}: AdminPrepaidCardsProviderProps) => {
  const { fetchAll, create } = useStrapiAPI();
  const [users, setUsers] = useState<User[]>([]);

  const reload = async () => {
    const data = await fetchAll<User>({
      ...User.strapiAPIParams,
      queryParams: {
        sort: ["lastName:asc"],
      },
    });

    setUsers(data);
  };

  useEffect(() => {
    reload();
  }, []);

  const upcomingMonths = Array.from({ length: 7 }, (_, i) => {
    const date = moment().startOf("month").add(i, "months");

    return {
      label: date.format("MMMM YYYY"), // ex: "Juin 2025"
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

    if (isNaN(hours) || hours <= 0) {
      return false;
    }

    if (selectedUsers.length === 0) {
      return false;
    }

    if (!(selectedMonth instanceof Date) || isNaN(selectedMonth.getTime())) {
      return false;
    }

    return true;
  };

  const handleSubmit = async ({
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

    try {
      await Promise.all(
        selectedUsers.map((user) =>
          create({
            contentType: PrepaidCard.contentType,
            factory: PrepaidCard.fromJson,
            object: new PrepaidCard({
              validFrom: validFrom,
              expirationDate: expirationDate,
              remainingBalance: hours,
              user: user,
              paymentStatus: PaymentStatus.PENDING,
            }),
          }),
        ),
      );

      toast.success(
        selectedUsers.length === 1
          ? "Carte prépayée créée avec succès !"
          : "Cartes prépayées créées avec succès !",
      );

      reload();
    } catch {
      toast.error("Une erreur est survenue lors de la création des cartes.");
    }
  };

  return (
    <AdminPrepaidCardsContext.Provider
      value={{ users, reload, upcomingMonths, handleSubmit, isFormValid }}
    >
      {children}
    </AdminPrepaidCardsContext.Provider>
  );
};

export const useAdminPrepaidCards = (): AdminPrepaidCardsContextType => {
  const context = useContext(AdminPrepaidCardsContext);

  if (!context) {
    throw new Error(
      "useAdminPrepaidCards must be used within an AdminPrepaidCardsProvider",
    );
  }

  return context;
};
