"use client";

import { CalendarIcon } from "lucide-react";
import moment, { Moment } from "moment";
import { useState } from "react";
import { DateRange as ReactDayPickerDateRange } from "react-day-picker";

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

interface DateRange {
  from: Moment | undefined;
  to?: Moment;
}

interface DateRangeFormStepProps {
  unavailabilities: Unavailability[];
  onDateRangeChange: (dateRange: DateRange) => void;
}

export const DateRangeFormStep = ({
  unavailabilities,
  onDateRangeChange,
}: DateRangeFormStepProps) => {
  const [dateRange, setDateRange] = useState<
    ReactDayPickerDateRange | undefined
  >();
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);

  const onValueChange = (dateRange: ReactDayPickerDateRange | undefined) => {
    setDateRange(dateRange);
    if (dateRange) {
      onDateRangeChange({
        from: moment(dateRange.from),
        to: moment(dateRange.to),
      });
    }
  };

  return (
    <div className="flex flex-col mt-2">
      <Label htmlFor="date">Quand ?</Label>
      <div className="mt-2">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              className={cn("w-full", !dateRange && "text-muted-foreground")}
              name="date"
              variant={"outline"}
            >
              <CalendarIcon />
              {dateRange ? (
                `${moment(dateRange.from).format("D MMMM YYYY")} => ${moment(dateRange.to).format("D MMMM YYYY")}`
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
                })
              }
              mode="range"
              selected={dateRange}
              onSelect={onValueChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
