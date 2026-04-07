"use client";

import {
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import { Moment } from "moment";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

import { DialogHeader, DialogFooter, DialogContent } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";

import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { useBookingAvailabilities } from "@/hooks/bookings/form/use-booking-availabilities";
import { usePrepaidCard } from "@/hooks/use-prepaid-cards";
import { PrepaidCard } from "@/models/prepaid-card";
import { siteConfig } from "@/config/site";
import { DurationWrapper } from "@/models/duration";
import { useAuth } from "@/contexts/auth-context";
import PrepaidCardSelect from "@/components/prepaid-cards/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RoleType } from "@/models/role";
import { User } from "@/models/user";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { UserSelect } from "@/components/users/select";

interface BookingAvailabilitiesProps {
  coworkingSpace: CoworkingSpace;
  service: Service;
  duration: DurationWrapper;
  startDay?: Moment;
  endDay?: Moment;
  multipleDays?: Moment[];
  times?: Time[];
  halfDay?: HalfDay;
}

export const BookingAvailabilities = ({
  coworkingSpace,
  service,
  startDay,
  endDay,
  multipleDays,
  halfDay,
  times,
  duration,
}: BookingAvailabilitiesProps) => {
  const router = useRouter();
  const { user: authUser, hasRole } = useAuth();
  const { fetchAll } = useStrapiAPI();

  // ----- ADMIN: select target user -----
  const isSuperAdmin = hasRole(RoleType.SUPER_ADMIN) ?? false;

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isSuperAdmin) return;

    setLoadingUsers(true);
    fetchAll<User>({ ...User.strapiAPIParams })
      .then(setUsers)
      .finally(() => setLoadingUsers(false));
  }, [isSuperAdmin]);

  const effectiveUser = (isSuperAdmin && selectedUser) ? selectedUser : authUser ?? null;

  // Hook pour les créneaux (utilise maintenant targetUser)
  const {
    availableBookings,
    unavailableBookings,
    bulkCreateAvailableBookings,
  } = useBookingAvailabilities({
    service,
    startDay,
    endDay,
    multipleDays,
    halfDay,
    times,
    duration,
    targetUser: effectiveUser ?? undefined,
  });

  // Cartes prépayées du user ciblé
  const { usablePrepaidCards: prepaidCard } = usePrepaidCard({
    userDocumentId: effectiveUser?.documentId,
  });

  const [useCard, setUseCard] = useState(false);
  const [selectedPrepaidCard, setSelectedPrepaidCard] =
    useState<PrepaidCard | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [confirmedWithCard, setConfirmedWithCard] = useState(false);
  const [confirmedCardBalance, setConfirmedCardBalance] = useState(0);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (bookingConfirmed && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [bookingConfirmed]);

  const eligibleCards = prepaidCard.filter(
    (c) => c.remainingBalance >= availableBookings.length,
  );

  useEffect(() => {
    if (prepaidCard.length === 0) {
      setUseCard(false);
      setSelectedPrepaidCard(null);
      return;
    }

    if (prepaidCard.length === 1) {
      setUseCard(true);
      setSelectedPrepaidCard(prepaidCard[0]);
      return;
    }

    const cardWithMostCredits = prepaidCard.reduce((max, card) =>
      card.remainingBalance > max.remainingBalance ? card : max,
    );

    setUseCard(true);
    setSelectedPrepaidCard(cardWithMostCredits);
  }, [prepaidCard]);

  async function createAvailableBookings() {
    if (!effectiveUser) return;

    const usedCard = useCard ? selectedPrepaidCard : null;

    await bulkCreateAvailableBookings(usedCard);

    setConfirmedCount(availableBookings.length);
    setConfirmedWithCard(!!usedCard);
    setConfirmedCardBalance(
      usedCard ? usedCard.remainingBalance - availableBookings.length : 0,
    );
    setBookingConfirmed(true);
  }

  if (bookingConfirmed) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            {coworkingSpace.name} - {service.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 rounded-md border border-green-300 bg-green-50 p-6 text-center dark:border-green-900/50 dark:bg-green-950">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            ✅ Réservation confirmée
          </div>
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            {confirmedCount > 1
              ? `Vos ${confirmedCount} créneaux ont bien été réservés.`
              : "Votre créneau a bien été réservé."}
          </p>
          <p className="mt-1 text-xs text-green-600/80 dark:text-green-400/80">
            Aucune autre action n'est nécessaire.
          </p>
        </div>

        <div className="mt-4 rounded-md border p-4 text-sm dark:border-neutral-700">
          {confirmedWithCard ? (
            <p className="text-center">
              ✅ Paiement validé via carte prépayée — solde restant&nbsp;:{" "}
              <span className="font-semibold">{confirmedCardBalance} heure(s)</span>.
            </p>
          ) : (
            <p className="text-center">
              💳 Le règlement se fait <span className="font-semibold">sur place</span> ou
              via votre carte prépayée si vous êtes abonné·e.
            </p>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={() => router.push(siteConfig.path.dashboard.href)}>
            Voir mes réservations
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          {coworkingSpace.name} - {service.name}
        </DialogTitle>
        <DialogDescription className="text-lg text-gray-600">
          Vérifiez les créneaux disponibles pour cette réservation
        </DialogDescription>
      </DialogHeader>

      {/* ADMIN ONLY: sélection de l'utilisateur */}
      {isSuperAdmin && (
        <div className="mt-4 space-y-2">
          <Label>Réserver pour</Label>
          <UserSelect
            users={users}
            value={selectedUser}
            onChange={setSelectedUser}
            modal={true}
          />
          {loadingUsers && (
            <p className="text-xs text-muted-foreground">Chargement des utilisateurs…</p>
          )}
        </div>
      )}

      {/* Créneaux indisponibles */}
      {unavailableBookings.length > 0 && (
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
            ❌ Créneaux indisponibles
          </h4>
          <p className="text-xs text-red-500 mb-3 dark:text-red-300">
            Ces créneaux ne peuvent pas être réservés pour le moment.
          </p>
          <ScrollArea className="relative rounded-md border h-32 bg-white dark:bg-neutral-900 dark:border-neutral-700">
            <div className="p-4">
              {unavailableBookings.map((unavailableBooking, i) => (
                <div key={i}>
                  <div className="text-sm text-red-700 dark:text-red-200">
                    {unavailableBooking.booking.toString()} :{" "}
                    {unavailableBooking.cause}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
            {unavailableBookings.length > 3 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-neutral-900 text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                Faites défiler pour voir plus
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Créneaux disponibles */}
      {availableBookings.length > 0 && (
        <div className="mt-6 rounded-md border border-green-300 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
            ✅ Créneaux disponibles
          </h4>
          <p className="text-xs text-green-500 mb-3 dark:text-green-300">
            Ces créneaux sont prêts à être réservés.
          </p>
          <ScrollArea className="relative rounded-md border h-32 bg-white dark:bg-neutral-900 dark:border-neutral-700">
            <div className="p-4">
              {availableBookings.map((booking, i) => (
                <div key={i}>
                  <div className="text-sm text-green-700 dark:text-green-200">
                    {booking.toString()}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
            {availableBookings.length > 3 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-neutral-900 text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                Faites défiler pour voir plus
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Carte prépayée */}
      <div className="mt-6 space-y-3">
        {eligibleCards.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={useCard}
              id="use-card"
              onCheckedChange={(v) => {
                const next = v === true;
                setUseCard(next);
                if (!next) setSelectedPrepaidCard(null);
              }}
            />
            <Label htmlFor="use-card">Utiliser une carte prépayée</Label>
          </div>
        )}

        {useCard && (
          <PrepaidCardSelect
            autoSelectBest
            cards={eligibleCards}
            placeholder="Sélectionnez une carte prépayée"
            value={selectedPrepaidCard}
            onChange={setSelectedPrepaidCard}
          />
        )}
      </div>

      {/* CTA */}
      <DialogFooter className="mt-6">
        <Button
          disabled={
            availableBookings.length === 0 ||
            (isSuperAdmin && !effectiveUser)
          }
          onClick={async () => await createAvailableBookings()}
        >
          Réserver les {availableBookings.length} créneaux disponibles
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
