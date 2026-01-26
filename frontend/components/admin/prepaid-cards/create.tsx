"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

import { MultiUserSelect } from "@/components/users/multi-select";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User } from "@/models/user";
import {
  CardCategory,
  SubscriptionLevel,
  SUBSCRIPTION_CONFIG,
  PREPAID_CONFIG,
} from "@/config/constants";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useCreatePrepaidCards } from "@/hooks/admin/create-prepaid-cards";

export const AdminPrepaidCardsCreate = () => {
  const {
    users,
    isLoadingUsers,
    handleSubmit,
    upcomingMonths,
    isFormValid,
    isSubmitting,
  } = useCreatePrepaidCards();

  const [cardCategory, setCardCategory] = useState<CardCategory | null>(null);
  const [subscriptionLevel, setSubscriptionLevel] =
    useState<SubscriptionLevel | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    startOfMonth(new Date()),
  );

  const getConfig = () => {
    if (cardCategory === "subscription" && subscriptionLevel) {
      return SUBSCRIPTION_CONFIG[subscriptionLevel];
    }
    if (cardCategory === "prepaid") {
      return PREPAID_CONFIG.fortyHours;
    }
    return null;
  };

  const config = getConfig();

  const handleCategoryChange = (val: CardCategory) => {
    setCardCategory(val);
    setSubscriptionLevel(null);
  };

  const resetForm = () => {
    setCardCategory(null);
    setSubscriptionLevel(null);
    setSelectedUsers([]);
    setSelectedMonth(startOfMonth(new Date()));
  };

  const canSubmit = () => {
    if (!config) return false;
    return isFormValid(selectedMonth, selectedUsers, config.hours);
  };

  const getValidityLabel = () => {
    if (!config) return "";
    if (cardCategory === "subscription") {
      return `Mois de ${format(selectedMonth, "MMMM yyyy", { locale: fr })}`;
    }
    const startDate = new Date(selectedMonth);
    const endDate = new Date(selectedMonth);
    endDate.setMonth(endDate.getMonth() + config.validityMonths);
    endDate.setDate(0); // Dernier jour du mois précédent
    return `Du 1er ${format(startDate, "MMMM yyyy", { locale: fr })} au ${format(endDate, "d MMMM yyyy", { locale: fr })}`;
  };

  if (isLoadingUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin w-6 h-6 mb-3" />
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Type de carte</Label>
        <Select
          value={cardCategory || undefined}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un type de carte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="subscription">Abonnement mensuel</SelectItem>
            <SelectItem value="prepaid">Carte prépayée 40h</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {cardCategory === "subscription" && (
        <div>
          <Label>Niveau d'abonnement</Label>
          <Select
            value={subscriptionLevel || undefined}
            onValueChange={(val) =>
              setSubscriptionLevel(val as SubscriptionLevel)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un niveau" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUBSCRIPTION_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {cardCategory && (
        <div>
          <Label>
            {cardCategory === "subscription"
              ? "Mois concerné"
              : "Date de début"}
          </Label>
          <Select
            value={selectedMonth.toISOString()}
            onValueChange={(val) => setSelectedMonth(new Date(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une date">
                {capitalizeFirstLetter(
                  format(selectedMonth, "LLLL yyyy", { locale: fr }),
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {upcomingMonths.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Coworkers</Label>
        <MultiUserSelect
          users={users}
          value={selectedUsers}
          onChange={setSelectedUsers}
        />
      </div>

      {selectedUsers.length > 0 && config && (
        <div className="mt-6 border rounded-md p-4 space-y-2">
          <p className="font-semibold">Récapitulatif :</p>
          <ul className="list-disc pl-5">
            {selectedUsers.map((user) => (
              <li key={user.id}>
                {user.firstName} {user.lastName} →{" "}
                <strong>
                  {config.hours === 9999 ? "illimité" : `${config.hours}h`}
                </strong>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm">{getValidityLabel()}</p>
        </div>
      )}

      <div>
        <Button
          disabled={!canSubmit() || isSubmitting}
          onClick={async () => {
            if (!config || !cardCategory) return;
            await handleSubmit({
              startDate: selectedMonth,
              selectedUsers,
              hours: config.hours,
              validityMonths: config.validityMonths,
              category: cardCategory,
            });
            resetForm();
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création en
              cours...
            </>
          ) : (
            "Soumettre"
          )}
        </Button>
      </div>
    </div>
  );
};
