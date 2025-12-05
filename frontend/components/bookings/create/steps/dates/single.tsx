"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Moment } from "moment";
import { fr } from "date-fns/locale";

import { shouldDisableDate } from "../utils/should-disable-date";

import moment from "@/lib/moment";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DurationWrapper } from "@/models/duration";
import { Service } from "@/models/service";
import { useGetMonthRange } from "../utils/use-get-month-range";
import { useAuth } from "@/contexts/auth-context";

interface SingleDateFormStepProps {
  service: Service;
  duration: DurationWrapper;
  onDateChange: (date: Moment) => void;
}

export const SingleDateFormStep = ({
  service,
  duration,
  onDateChange,
}: SingleDateFormStepProps) => {
  const { isSuperAdmin } = useAuth();

  const [date, setDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);

  const onValueChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      const mDate = moment(date);

      onDateChange(mDate);
    }
  };

  const { startMonth, endMonth } = useGetMonthRange();

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
              autoFocus
              disabled={(date) =>
                shouldDisableDate({
                  date,
                  unavailabilities:
                    service.coworkingSpace?.unavailabilities ?? [],
                  availabilities: service.availabilities,
                  duration: duration.getDuration()!,
                  canBookInPast: isSuperAdmin,
                })
              }
              startMonth={startMonth.toDate()}
              locale={fr}
              mode="single"
              selected={date}
              endMonth={endMonth.toDate()}
              onDayClick={() => setCalendarOpen(false)}
              onSelect={onValueChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
