"use client";

import {
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import { Moment } from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DialogHeader, DialogFooter, DialogContent } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../ui/select";

import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { useBookingAvailabilities } from "@/hooks/booking/use-booking-availabilities";
import { usePrepaidCard } from "@/hooks/use-prepaid-card";
import { PrepaidCard } from "@/models/prepaid-card";
import { siteConfig } from "@/config/site";
import { DurationWrapper } from "@/models/duration";
import { useAuth } from "@/contexts/auth-context";

interface BookingAvailabilitiesProps {
  coworkingSpace: CoworkingSpace;
  service: Service;
  duration: DurationWrapper;
  startDay: Moment;
  endDay?: Moment;
  multipleDays?: Moment[];
  startTime?: Time;
  halfDay?: HalfDay;
}

export const BookingAvailabilities = ({
  coworkingSpace,
  service,
  startDay,
  endDay,
  multipleDays,
  halfDay,
  startTime,
  duration,
}: BookingAvailabilitiesProps) => {
  const { user } = useAuth();
  const router = useRouter();

  startDay.locale("fr");
  endDay?.locale("fr");
  multipleDays = multipleDays?.map((day) => day.locale("fr"));

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
    startTime,
    duration,
  });

  let { usablePrepaidCards: prepaidCard } = usePrepaidCard({
    userDocumentId: user?.documentId,
  });

  prepaidCard = prepaidCard.filter(
    (prepaidCard) => prepaidCard.remainingBalance >= availableBookings.length,
  );

  const [useCard, setUseCard] = useState(false);
  const [selectedPrepaidCard, setSelectedPrepaidCard] =
    useState<PrepaidCard | null>(null);

  useEffect(() => {
    if (prepaidCard.length === 1) {
      setUseCard(true);
      setSelectedPrepaidCard(prepaidCard[0]);
    } else if (prepaidCard.length > 1) {
      const cardWithMostCredits = prepaidCard.reduce((max, card) =>
        card.remainingBalance > max.remainingBalance ? card : max,
      );

      setUseCard(true);
      setSelectedPrepaidCard(cardWithMostCredits);
    } else {
      setUseCard(false);
      setSelectedPrepaidCard(null);
    }
  }, [prepaidCard]);

  async function createAvailableBookings() {
    await bulkCreateAvailableBookings(selectedPrepaidCard);
    router.push(siteConfig.path.dashboard.href);
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
      <div className="mt-6 space-y-4">
        {prepaidCard.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={useCard}
              id="use-card"
              onCheckedChange={(checked) => {
                if (!checked) {
                  setSelectedPrepaidCard(null);
                }
                setUseCard(!useCard);
              }}
            />
            <Label htmlFor="use-card">Utiliser une carte prépayée</Label>
          </div>
        )}

        {useCard && (
          <Select
            value={selectedPrepaidCard?.documentId}
            onValueChange={(val) => {
              const card = prepaidCard.find((c) => c.documentId === val);

              setSelectedPrepaidCard(card || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une carte prépayée" />
            </SelectTrigger>
            <SelectContent>
              {prepaidCard.map((card) => (
                <SelectItem key={card.id} value={card.documentId}>
                  {card.toString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* CTA */}
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button
            disabled={availableBookings.length === 0}
            onClick={async () => await createAvailableBookings()}
          >
            Réserver les {availableBookings.length} créneaux disponibles
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};
