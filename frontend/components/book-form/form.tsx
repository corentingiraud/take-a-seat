"use client";

import { useEffect, useState } from "react";
import { Duration, Moment } from "moment";

import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { BookingAvailabilities } from "../booking-availabilities/booking-availabilities";

import { CoworkingSpaceFormStep } from "./steps/coworking-space";
import { ServiceFormStep } from "./steps/service";
import { DateFormStep } from "./steps/date";
import { TimeFormStep } from "./steps/time";
import { DurationFormStep } from "./steps/duration";
import { HalfDayFormStep } from "./steps/half-day";

import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { AVAILABLE_DURATION } from "@/models/duration";

export const BookForm = () => {
  const [coworkingSpace, setCoworkingSpace] = useState<
    CoworkingSpace | undefined
  >(undefined);
  const [service, setService] = useState<Service | undefined>(undefined);
  const [duration, setDuration] = useState<Duration | undefined>(undefined);
  const [startDay, setStartDay] = useState<Moment | undefined>(undefined);
  const [startTime, setStartTime] = useState<Time | undefined>(undefined);
  const [halfDay, setHalfDay] = useState<HalfDay | undefined>(undefined);

  const [formIsValid, setFormIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (!coworkingSpace || !service) {
      setFormIsValid(false);

      return;
    }

    if (duration === AVAILABLE_DURATION.ONE_HOUR && (!startDay || !startTime)) {
      setFormIsValid(false);

      return;
    }

    if (duration === AVAILABLE_DURATION.HALF_DAY && (!startDay || !halfDay)) {
      setFormIsValid(false);

      return;
    }

    if (
      (duration === AVAILABLE_DURATION.DAY ||
        duration === AVAILABLE_DURATION.MONTH) &&
      !startDay
    ) {
      setFormIsValid(false);

      return;
    }

    setFormIsValid(true);
  }, [coworkingSpace, duration, startDay, startTime, halfDay]);

  return (
    <div>
      <CoworkingSpaceFormStep
        onCoworkingSpaceChange={(value) => {
          setCoworkingSpace(value);
          setService(undefined);
        }}
      />
      {coworkingSpace != null && (
        <ServiceFormStep
          key={`coworking-space-${coworkingSpace.id}-service`}
          coworkingSpace={coworkingSpace}
          onServiceChange={(value) => setService(value)}
        />
      )}
      {service && (
        <DurationFormStep
          key={`service-${service.id}-duration`}
          onDurationChange={(value) => setDuration(value)}
        />
      )}
      {service && duration != null && (
        <DateFormStep
          key={`duration-${duration}-date`}
          onDateChange={(value) => setStartDay(value)}
        />
      )}
      {service && duration === AVAILABLE_DURATION.ONE_HOUR && (
        <TimeFormStep
          key={`service-${service.id}-time`}
          service={service}
          onTimeChange={(value) => setStartTime(value)}
        />
      )}
      {service && duration === AVAILABLE_DURATION.HALF_DAY && (
        <HalfDayFormStep
          key={`service-${service.id}-half-day`}
          onHalfDayChange={(value) => setHalfDay(value)}
        />
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-3" disabled={!formIsValid}>
            Voir les disponibilités
          </Button>
        </DialogTrigger>
        {formIsValid && (
          <BookingAvailabilities
            coworkingSpace={coworkingSpace!}
            duration={duration!}
            halfDay={halfDay}
            service={service!}
            startDay={startDay!}
            startTime={startTime}
          />
        )}
      </Dialog>
    </div>
  );
};
