"use client";

import { useEffect, useState } from "react";
import { Moment } from "moment";

import { CoworkingSpaceFormStep } from "./steps/coworking-space";
import { ServiceFormStep } from "./steps/service";
import { SingleDateFormStep } from "./steps/dates/single";
import { TimeFormStep } from "./steps/time";
import { DurationFormStep } from "./steps/duration";
import { HalfDayFormStep } from "./steps/half-day";
import { RangeOfDatesFormStep } from "./steps/dates/range";
import { MultipleDatesFormStep } from "./steps/dates/multiple";

import { CoworkingSpace } from "@/models/coworking-space";
import { Service } from "@/models/service";
import { Time } from "@/models/time";
import { HalfDay } from "@/models/half-day";
import { AVAILABLE_DURATION, DurationWrapper } from "@/models/duration";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { BookingAvailabilities } from "@/components/bookings/availabilities/availabilities";
import { Button } from "@/components/ui/button";

export const CreateBookingForm = () => {
  const [coworkingSpace, setCoworkingSpace] = useState<
    CoworkingSpace | undefined
  >(undefined);
  const [service, setService] = useState<Service | undefined>(undefined);
  const [duration, setDuration] = useState<DurationWrapper | undefined>(
    undefined,
  );
  const [multipleDays, setMultipleDates] = useState<Moment[]>([]);
  const [startDay, setStartDay] = useState<Moment | undefined>(undefined);
  const [endDay, setEndDay] = useState<Moment | undefined>(undefined);
  const [startTime, setStartTime] = useState<Time | undefined>(undefined);
  const [halfDay, setHalfDay] = useState<HalfDay | undefined>(undefined);

  const [formIsValid, setFormIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (!coworkingSpace || !service || !duration) {
      setFormIsValid(false);

      return;
    }

    if (
      duration.equals(AVAILABLE_DURATION.ONE_HOUR) &&
      (!startDay || !startTime)
    ) {
      setFormIsValid(false);

      return;
    }

    if (
      duration.equals(AVAILABLE_DURATION.HALF_DAY) &&
      (!startDay || !halfDay)
    ) {
      setFormIsValid(false);

      return;
    }

    if (
      duration.equals(AVAILABLE_DURATION.MULTIPLE_DATES) &&
      multipleDays.length === 0
    ) {
      setFormIsValid(false);

      return;
    }

    if (
      duration.equals(AVAILABLE_DURATION.RANGE_OF_DATES) &&
      (!startDay || !endDay || startDay?.isAfter(endDay))
    ) {
      setFormIsValid(false);

      return;
    }
    setFormIsValid(true);
  }, [
    coworkingSpace,
    duration,
    startDay,
    endDay,
    multipleDays,
    startTime,
    halfDay,
  ]);

  return (
    <div className="mt-5 m-auto max-w-xl flex flex-col gap-5">
      <CoworkingSpaceFormStep
        value={coworkingSpace}
        onCoworkingSpaceChange={(value) => {
          if (value) {
            setService(undefined);
            setCoworkingSpace(value);
          }
        }}
      />
      {coworkingSpace && (
        <ServiceFormStep
          key={`coworking-space-${coworkingSpace.id}-service`}
          coworkingSpace={coworkingSpace}
          value={service}
          onServiceChange={(value) => {
            if (value) {
              setService(value);
            }
          }}
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
      {service && duration?.isSingleDay && (
        <SingleDateFormStep
          key={`duration-${duration}-date`}
          duration={duration}
          service={service}
          onDateChange={(value) => {
            setHalfDay(undefined);
            setStartTime(undefined);
            setFormIsValid(false);
            setStartDay(value);
          }}
        />
      )}
      {service && startDay && duration?.equals(AVAILABLE_DURATION.ONE_HOUR) && (
        <TimeFormStep
          key={`service-${service.id}-time-${startDay?.format("YYYY-MM-DD")}`}
          date={startDay}
          service={service}
          onTimeChange={(value) => setStartTime(value)}
        />
      )}
      {service && startDay && duration?.equals(AVAILABLE_DURATION.HALF_DAY) && (
        <HalfDayFormStep
          key={`service-${service.id}-half-day-${startDay?.format("YYYY-MM-DD")}`}
          date={startDay}
          service={service}
          onHalfDayChange={(value) => setHalfDay(value)}
        />
      )}
      {service && duration?.equals(AVAILABLE_DURATION.MULTIPLE_DATES) && (
        <MultipleDatesFormStep
          key={`duration-${duration}-multiple-dates`}
          service={service}
          onDatesChange={(dates) => {
            setMultipleDates(dates);
          }}
        />
      )}
      {service && duration?.equals(AVAILABLE_DURATION.RANGE_OF_DATES) && (
        <RangeOfDatesFormStep
          key={`duration-${duration}-date-range`}
          service={service}
          onDateRangeChange={(range) => {
            if (range) {
              setStartDay(range.from);
              setEndDay(range.to);

              return;
            }
            setStartDay(undefined);
            setEndDay(undefined);
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
              multipleDays={multipleDays}
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
