"use client";

import {
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import { Duration, Moment } from "moment";
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

interface BookingAvailabilitiesProps {
  coworkingSpace: CoworkingSpace;
  service: Service;
  duration: Duration;
  startDay: Moment;
  endDay?: Moment;
  startTime?: Time;
  halfDay?: HalfDay;
}

export const BookingAvailabilities = ({
  coworkingSpace,
  service,
  startDay,
  endDay,
  halfDay,
  startTime,
  duration,
}: BookingAvailabilitiesProps) => {
  const router = useRouter();

  const {
    availableBookings,
    unavailableBookings,
    bulkCreateAvailableBookings,
  } = useBookingAvailabilities({
    service,
    startDay,
    endDay,
    halfDay,
    startTime,
    duration,
  });

  const { prepaidCards } = usePrepaidCard();

  const [useCard, setUseCard] = useState(false);
  const [selectedPrepaidCard, setSelectedPrepaidCard] = useState<PrepaidCard>();

  async function createAvailableBookings() {
    await bulkCreateAvailableBookings(selectedPrepaidCard);
    router.push(siteConfig.path.myBookings.href);
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
        {prepaidCards.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={useCard}
              id="use-card"
              onCheckedChange={() => setUseCard(!useCard)}
            />
            <Label htmlFor="use-card">Utiliser une carte prépayée</Label>
          </div>
        )}

        {useCard && (
          <Select
            onValueChange={(val) => {
              const card = prepaidCards.find((c) => c.documentId === val);

              setSelectedPrepaidCard(card);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une carte prépayée" />
            </SelectTrigger>
            <SelectContent>
              {prepaidCards.map((card) => (
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
