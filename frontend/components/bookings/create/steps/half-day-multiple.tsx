"use client";

import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { Moment } from "moment";
import { fr } from "date-fns/locale";

import { shouldDisableDate } from "./utils/should-disable-date";
import { isHalfDayAvailable } from "./utils/is-half-day-available";
import { useGetMonthRange } from "./utils/use-get-month-range";

import moment from "@/lib/moment";
import { Label } from "@/components/ui/label";
import { cn, capitalizeFirstLetter } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service } from "@/models/service";
import { HalfDay, HalfDaySelection } from "@/models/half-day";
import { useAuth } from "@/contexts/auth-context";
import { AVAILABLE_DURATION } from "@/models/duration";

interface HalfDayMultipleFormStepProps {
  service: Service;
  onSelectionsChange: (selections: HalfDaySelection[]) => void;
}

export const HalfDayMultipleFormStep = ({
  service,
  onSelectionsChange,
}: HalfDayMultipleFormStepProps) => {
  const { isSuperAdmin } = useAuth();
  const { startMonth, endMonth } = useGetMonthRange();

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selections, setSelections] = useState<HalfDaySelection[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const unavailabilities = service.coworkingSpace?.unavailabilities ?? [];

  const getAvailableHalfDays = (date: Moment): HalfDay[] =>
    Object.values(HalfDay).filter((hd) =>
      isHalfDayAvailable(date, hd, unavailabilities, service),
    );

  const onDatesChange = (dates: Date[] | undefined) => {
    const validDates = [...(dates ?? [])].sort(
      (a, b) => a.getTime() - b.getTime(),
    );
    setSelectedDates(validDates);

    // Keep existing selections for dates still selected, add defaults for new ones
    const newSelections: HalfDaySelection[] = validDates.map((d) => {
      const mDate = moment(d);
      const existing = selections.find((s) => s.date.isSame(mDate, "day"));

      if (existing) return existing;

      const available = getAvailableHalfDays(mDate);

      return { date: mDate, halfDay: available[0] ?? HalfDay.Morning };
    });

    setSelections(newSelections);
    onSelectionsChange(newSelections);
  };

  const updateHalfDay = (index: number, halfDay: HalfDay) => {
    const updated = [...selections];

    updated[index] = { ...updated[index], halfDay };
    setSelections(updated);
    onSelectionsChange(updated);
  };

  const removeDate = (index: number) => {
    const updatedDates = selectedDates.filter((_, i) => i !== index);
    const updatedSelections = selections.filter((_, i) => i !== index);

    setSelectedDates(updatedDates);
    setSelections(updatedSelections);
    onSelectionsChange(updatedSelections);
  };

  return (
    <div className="flex flex-col mt-2 gap-3">
      <div>
        <Label htmlFor="half-day-dates">Quand ?</Label>
        <div className="mt-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "w-full text-left whitespace-pre-wrap",
                  selectedDates.length === 0 && "text-muted-foreground",
                )}
                name="half-day-dates"
                variant="outline"
              >
                <CalendarIcon className="mr-2" />
                {selectedDates.length > 0 ? (
                  `${selectedDates.length} jour${selectedDates.length > 1 ? "s" : ""} sélectionné${selectedDates.length > 1 ? "s" : ""}`
                ) : (
                  <span>Choisir les jours</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-auto p-0">
              <Calendar
                autoFocus
                disabled={(date) =>
                  shouldDisableDate({
                    date,
                    unavailabilities,
                    availabilities: service.availabilities,
                    duration: AVAILABLE_DURATION.HALF_DAY.getDuration()!,
                    canBookInPast: isSuperAdmin,
                  })
                }
                startMonth={startMonth.toDate()}
                locale={fr}
                mode="multiple"
                selected={selectedDates}
                endMonth={endMonth.toDate()}
                onDayClick={() => {}}
                onSelect={onDatesChange}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selections.length > 0 && (
        <div className="rounded-md border p-3 space-y-2">
          {selections.map((selection, i) => {
            const available = getAvailableHalfDays(selection.date);

            return (
              <div
                key={selection.date.format("YYYY-MM-DD")}
                className="flex items-center gap-2"
              >
                <span className="text-sm flex-1 truncate flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  {capitalizeFirstLetter(selection.date.format("dddd D MMMM"))}
                </span>
                <Select
                  value={
                    Object.entries(HalfDay).find(
                      ([, v]) => v === selection.halfDay,
                    )?.[0]
                  }
                  onValueChange={(v) =>
                    updateHalfDay(i, HalfDay[v as keyof typeof HalfDay])
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(HalfDay)
                      .filter(([, label]) =>
                        available.includes(label as HalfDay),
                      )
                      .map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeDate(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
