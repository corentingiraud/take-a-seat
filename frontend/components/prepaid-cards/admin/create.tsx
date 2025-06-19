"use client";

import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

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
import { useAdminPrepaidCards } from "@/contexts/admin/prepaid-card";
import { User } from "@/models/user";
import { SubscriptionType, HOURS_PER_TYPE } from "@/config/constants";
import { capitalizeFirstLetter } from "@/lib/utils";

export const AdminPrepaidCardsCreate = () => {
  const { users, handleSubmit, upcomingMonths, isFormValid } = useAdminPrepaidCards();

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

  return (
    <div className="space-y-6">
      <div>
        <Label>Type d’abonnement</Label>
        <Select onValueChange={handleSubscriptionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un abonnement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">1/4 temps - 36h</SelectItem>
            <SelectItem value="half">1/2 temps - 72h</SelectItem>
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
          disabled={!isFormValid(selectedMonth, selectedUsers, customHours)}
          onClick={() => {
            handleSubmit({
              subscription,
              selectedMonth,
              selectedUsers,
              customHours,
            });
            setSubscription(null);
            setSelectedUsers([]);
            setSelectedMonth(startOfMonth(new Date()),);
            setCustomHours("");
          }}
        >
          Soumettre
        </Button>
      </div>
    </div>
  );
};
