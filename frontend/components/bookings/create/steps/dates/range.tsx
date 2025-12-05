"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange as ReactDayPickerDateRange } from "react-day-picker";
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
import { Service } from "@/models/service";
import { RoleType } from "@/models/role";
import { useAuth } from "@/contexts/auth-context";
import { useGetMonthRange } from "../utils/use-get-month-range";

interface DateRange {
  from: Moment | undefined;
  to?: Moment;
}

interface DateRangeFormStepProps {
  service: Service;
  onDateRangeChange: (dateRange?: DateRange) => void;
}

export const RangeOfDatesFormStep = ({
  service,
  onDateRangeChange,
}: DateRangeFormStepProps) => {
  const { isSuperAdmin } = useAuth();

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

      return;
    }
    onDateRangeChange(undefined);
  };

  const { startMonth, endMonth } = useGetMonthRange();

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
              autoFocus
              disabled={(date) =>
                shouldDisableDate({
                  date,
                  unavailabilities:
                    service.coworkingSpace?.unavailabilities ?? [],
                  availabilities: service.availabilities,
                  canBookInPast: isSuperAdmin,
                })
              }
              startMonth={startMonth.toDate()}
              locale={fr}
              mode="range"
              selected={dateRange}
              endMonth={endMonth.toDate()}
              onSelect={onValueChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
