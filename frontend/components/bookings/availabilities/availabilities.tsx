"use client";

import {
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import { Moment } from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    userId: user?.id,
  });

  prepaidCard = prepaidCard.filter(
    (prepaidCard) => prepaidCard.remainingBalance >= availableBookings.length,
  );

  const [useCard, setUseCard] = useState(false);
  const [selectedPrepaidCard, setSelectedPrepaidCard] =
    useState<PrepaidCard | null>(null);

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
          Disponibilités des réservations
        </DialogDescription>
      </DialogHeader>
      {unavailableBookings.length > 0 && (
        <div>
          <h4 className="mb-4 text-sm font-medium leading-none text-gray-500">
            Créneaux indisponibles :
          </h4>
          <ScrollArea className="rounded-md border h-32">
            <div className="p-4">
              {unavailableBookings.map((unavailableBooking, i) => (
                <div key={i}>
                  <div className="text-sm text-gray-700">
                    {unavailableBooking.booking.toString()}:{" "}
                    {unavailableBooking.cause}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      {availableBookings.length > 0 && (
        <div>
          <h4 className="mb-4 text-sm font-medium leading-none text-gray-500">
            Créneaux disponibles :
          </h4>
          <ScrollArea className="rounded-md border h-32">
            <div className="p-4">
              {availableBookings.map((booking, i) => (
                <div key={i}>
                  <div className="text-sm text-gray-300">
                    {booking.toString()}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

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

      <DialogFooter>
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
