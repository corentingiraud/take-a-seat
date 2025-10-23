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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/models/user";
import { SubscriptionType, HOURS_PER_TYPE } from "@/config/constants";
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

  const [subscription, setSubscription] = useState<SubscriptionType | null>(
    null,
  );
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    startOfMonth(new Date()),
  );
  const [customHours, setCustomHours] = useState<string>("");

  const handleSubscriptionChange = (val: SubscriptionType) => {
    setSubscription(val);
    setCustomHours(String(HOURS_PER_TYPE[val]));
  };

  // --- Loading state for users
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
        <Label>Type d’abonnement</Label>
        <Select
          value={subscription || undefined}
          onValueChange={handleSubscriptionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un abonnement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">1/4 temps - 36h</SelectItem>
            <SelectItem value="half">1/2 temps - 72h</SelectItem>
            <SelectItem value="threeQuarter">3/4 temps - 108h</SelectItem>
            <SelectItem value="full">Temps plein - illimité</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Mois concerné</Label>
        <Select
          value={selectedMonth.toISOString()}
          onValueChange={(val) => setSelectedMonth(new Date(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir un mois">
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

      <div>
        <Label>Coworkers</Label>
        <MultiUserSelect
          users={users}
          value={selectedUsers}
          onChange={setSelectedUsers}
        />
      </div>

      <div>
        <Label>Nombre d’heures à créditer</Label>
        <Input
          min="1"
          placeholder="Saisir un nombre d’heures"
          type="number"
          value={customHours}
          onChange={(e) => setCustomHours(e.target.value)}
        />
      </div>

      {selectedUsers.length > 0 && customHours && (
        <div className="mt-6 border rounded-md p-4 space-y-2">
          <p className="font-semibold">Récapitulatif :</p>
          <ul className="list-disc pl-5">
            {selectedUsers.map((user) => (
              <li key={user.id}>
                {user.firstName} {user.lastName} →{" "}
                <strong>{customHours}</strong> heures à créditer
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm">
            Pour le mois de :{" "}
            {format(selectedMonth, "MMMM yyyy", { locale: fr })}
          </p>
        </div>
      )}

      <div>
        <Button
          disabled={
            !isFormValid(selectedMonth, selectedUsers, customHours) ||
            isSubmitting
          }
          onClick={async () => {
            await handleSubmit({
              selectedMonth,
              selectedUsers,
              customHours,
            });
            setSubscription(null);
            setSelectedUsers([]);
            setSelectedMonth(startOfMonth(new Date()));
            setCustomHours("");
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
