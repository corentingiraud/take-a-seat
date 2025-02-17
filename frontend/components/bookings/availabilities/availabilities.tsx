"use client";

import {
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import { Duration, Moment } from "moment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { DialogHeader, DialogFooter, DialogContent } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";

import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { useBookingAvailabilities } from "@/hooks/use-booking-availabilities";
import { useStrapiAPI } from "@/hooks/use-strapi-api";
import { Booking } from "@/models/booking";

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
  const { create } = useStrapiAPI();
  const router = useRouter();

  const { availableBookings, unavailableBookings } = useBookingAvailabilities({
    service,
    startDay,
    halfDay,
    startTime,
    duration,
  });

  async function createAvailableBookings() {
    for (const booking of availableBookings) {
      await create({
        ...Booking.strapiAPIParams,
        object: booking,
      });
    }
    let message =
      "Votre réservation a bien été enregistrée. Elle doit néanmoins être validée par un administrateur.";

    if (availableBookings.length > 1) {
      message =
        "Vos réservations ont bien été enregistrées. Elles doivent néanmoins être validées par un administrateur.";
    }
    toast.success(message);
    router.push("/my-bookings");
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
          {coworkingSpace.name} - {service.name}
        </DialogTitle>
        <DialogDescription>Disponibilités des réservations</DialogDescription>
      </DialogHeader>
      {unavailableBookings.length > 0 && (
        <div>
          <h4 className="mb-4 text-sm font-medium leading-none">
            Créneaux indisponibles
          </h4>
          <ScrollArea className="rounded-md border h-32">
            <div className="p-4">
              {unavailableBookings.map((unavailableBooking, i) => (
                <div key={i}>
                  <div className="text-sm">
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
        </div>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button
            disabled={availableBookings.length === 0}
            onClick={async () => await createAvailableBookings()}
          >
            Réserver les créneaux disponibles ({availableBookings.length})
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};
