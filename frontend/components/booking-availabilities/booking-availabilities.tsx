"use client";

import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Duration, Moment } from "moment";

import { DialogHeader, DialogFooter, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { useBookingAvailabilities } from "@/hooks/use-booking-availabilities";

interface BookingAvailabilitiesProps {
  coworkingSpace: CoworkingSpace;
  service: Service;
  duration: Duration;
  startDay: Moment;
  startTime?: Time;
  halfDay?: HalfDay;
}

export const BookingAvailabilities = ({
  coworkingSpace,
  service,
  startDay,
  halfDay,
  startTime,
  duration,
}: BookingAvailabilitiesProps) => {
  const { availableBookings, unavailableBookings } = useBookingAvailabilities({
    service,
    startDay,
    halfDay,
    startTime,
    duration,
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          {coworkingSpace.name} - {service.name}
        </DialogTitle>
        <DialogDescription>Disponibilités des réservations</DialogDescription>
      </DialogHeader>
      <h4 className="mb-4 text-sm font-medium leading-none">
        Créneaux disponibles
      </h4>
      <ScrollArea className="rounded-md border h-32">
        <div className="p-4">
          {availableBookings.map((booking, i) => (
            <div key={i}>
              <div className="text-sm">{booking.toString()}</div>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button type="submit">
          Réserver les créneaux disponibles ({availableBookings.length})
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
