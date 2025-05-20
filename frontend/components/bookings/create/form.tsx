"use client";

import { useEffect, useState } from "react";
import { Duration, Moment } from "moment";

import { CoworkingSpaceFormStep } from "./steps/coworking-space";
import { ServiceFormStep } from "./steps/service";
import { DateFormStep } from "./steps/date/date";
import { TimeFormStep } from "./steps/time";
import { DurationFormStep } from "./steps/duration";
import { HalfDayFormStep } from "./steps/half-day";
import { DateRangeFormStep } from "./steps/date/date-range";

import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { AVAILABLE_DURATION } from "@/models/duration";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { BookingAvailabilities } from "@/components/bookings/availabilities/availabilities";
import { Button } from "@/components/ui/button";

export const CreateBookingForm = () => {
  const [coworkingSpace, setCoworkingSpace] = useState<
    CoworkingSpace | undefined
  >(undefined);
  const [service, setService] = useState<Service | undefined>(undefined);
  const [duration, setDuration] = useState<Duration | null | undefined>(
    undefined,
  );
  const [startDay, setStartDay] = useState<Moment | undefined>(undefined);
  const [endDay, setEndDay] = useState<Moment | undefined>(undefined);
  const [startTime, setStartTime] = useState<Time | undefined>(undefined);
  const [halfDay, setHalfDay] = useState<HalfDay | undefined>(undefined);

  const [formIsValid, setFormIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (!coworkingSpace || !service) {
      setFormIsValid(false);

      return;
    }

    if (
      duration === AVAILABLE_DURATION.ONE_HOUR.getDuration() &&
      (!startDay || !startTime)
    ) {
      setFormIsValid(false);

      return;
    }

    if (
      duration === AVAILABLE_DURATION.HALF_DAY.getDuration() &&
      (!startDay || !halfDay)
    ) {
      setFormIsValid(false);

      return;
    }

    if (
      duration === AVAILABLE_DURATION.DAYS.getDuration() &&
      (!startDay || !endDay || startDay?.isAfter(endDay))
    ) {
      setFormIsValid(false);

      return;
    }

    setFormIsValid(true);
  }, [coworkingSpace, duration, startDay, endDay, startTime, halfDay]);

  return (
    <div className="mt-5 m-auto max-w-xl flex flex-col gap-5">
      <CoworkingSpaceFormStep
        onCoworkingSpaceChange={(value) => {
          setService(undefined);
          setCoworkingSpace(value);
        }}
      />
      {coworkingSpace && (
        <ServiceFormStep
          key={`coworking-space-${coworkingSpace.id}-service`}
          coworkingSpace={coworkingSpace}
          onServiceChange={(value) => setService(value)}
        />
      )}
      {service && (
        <DurationFormStep
          key={`service-${service.id}-duration`}
          onDurationChange={(value) => {
            setStartDay(undefined);
            setEndDay(undefined);
            setHalfDay(undefined);
            setStartTime(undefined);
            setFormIsValid(false);
            setDuration(value);
          }}
        />
      )}
      {service &&
        duration &&
        duration !== undefined &&
        duration !== AVAILABLE_DURATION.DAYS.getDuration() && (
          <DateFormStep
            key={`duration-${duration}-date`}
            closingTime={service.closingTime}
            duration={duration}
            openingTime={service.openingTime}
            unavailabilities={service.coworkingSpace?.unavailabilities || []}
            onDateChange={(value) => {
              setHalfDay(undefined);
              setStartTime(undefined);
              setFormIsValid(false);
              setStartDay(value);
            }}
          />
        )}
      {service &&
        startDay &&
        duration === AVAILABLE_DURATION.ONE_HOUR.getDuration() && (
          <TimeFormStep
            key={`service-${service.id}-time-${startDay?.format("YYYY-MM-DD")}`}
            date={startDay}
            service={service}
            onTimeChange={(value) => setStartTime(value)}
          />
        )}
      {service &&
        startDay &&
        duration === AVAILABLE_DURATION.HALF_DAY.getDuration() && (
          <HalfDayFormStep
            key={`service-${service.id}-half-day-${startDay?.format("YYYY-MM-DD")}`}
            closingTime={service.closingTime}
            date={startDay}
            openingTime={service.openingTime}
            unavailabilities={service.coworkingSpace?.unavailabilities || []}
            onHalfDayChange={(value) => setHalfDay(value)}
          />
        )}
      {service && duration === AVAILABLE_DURATION.DAYS.getDuration() && (
        <DateRangeFormStep
          key={`duration-${duration}-date-range`}
          unavailabilities={service.coworkingSpace?.unavailabilities || []}
          onDateRangeChange={(range) => {
            setStartDay(range.from);
            setEndDay(range.to);
          }}
        />
      )}

      <div className="mt-5 flex justify-end">
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
              endDay={endDay}
              halfDay={halfDay!}
              service={service!}
              startDay={startDay!}
              startTime={startTime}
            />
          )}
        </Dialog>
      </div>
    </div>
  );
};
