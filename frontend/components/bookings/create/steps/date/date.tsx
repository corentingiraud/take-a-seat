"use client";

import { CalendarIcon } from "lucide-react";
import moment, { Duration, Moment } from "moment";
import { useState } from "react";

import { shouldDisableDate } from "../utils/should-disable-date";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Unavailability } from "@/models/unavailability";
import { Time } from "@/models/time";

interface DateFormStepProps {
  unavailabilities: Unavailability[];
  openingTime: Time;
  closingTime: Time;
  duration: Duration;
  onDateChange: (date: Moment) => void;
}

export const DateFormStep = ({
  unavailabilities,
  openingTime,
  closingTime,
  duration,
  onDateChange,
}: DateFormStepProps) => {
  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);

  const onValueChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      onDateChange(moment(date));
    }
  };

  return (
    <div className="flex flex-col mt-2">
      <Label htmlFor="date">Quand ?</Label>
      <div className="mt-2">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              className={cn("w-full", !date && "text-muted-foreground")}
              name="date"
              variant={"outline"}
            >
              <CalendarIcon />
              {date ? (
                moment(date).format("D MMMM YYYY")
              ) : (
                <span>Choisir une date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-auto p-0">
            <Calendar
              initialFocus
              disabled={(date) =>
                shouldDisableDate({
                  date,
                  unavailabilities,
                  openingTime,
                  closingTime,
                  duration,
                })
              }
              mode="single"
              selected={date}
              onDayClick={() => setCalendarOpen(false)}
              onSelect={onValueChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
