"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Moment } from "moment";

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
import { fr } from "date-fns/locale";

interface MultipleDateFormStepProps {
  service: Service;
  onDatesChange: (dates: Moment[]) => void;
}

export const MultipleDatesFormStep = ({
  service,
  onDatesChange,
}: MultipleDateFormStepProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);

  const onValueChange = (dates: Date[] | undefined) => {
    const validDates = dates ?? [];

    const sortedDates = [...validDates].sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    setSelectedDates(sortedDates);
    onDatesChange(sortedDates.map((d) => moment(d)));
  };

  const currentMonth = moment();
  const nextMonth = currentMonth.clone().add(1, "month");

  return (
    <div className="flex flex-col mt-2">
      <Label htmlFor="multiple-dates">Quand ?</Label>
      <div className="mt-2">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "w-full text-left whitespace-pre-wrap",
                selectedDates.length === 0 && "text-muted-foreground",
              )}
              name="multiple-dates"
              variant={"outline"}
            >
              <CalendarIcon className="mr-2" />
              {selectedDates.length > 0 ? (
                <>
                  {`${selectedDates.length} jour${selectedDates.length > 1 ? "s" : ""} sélectionné${selectedDates.length > 1 ? "s" : ""}`}
                </>
              ) : (
                <span>Choisir les jours</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-auto p-0">
            <Calendar
              initialFocus
              disabled={(date) =>
                shouldDisableDate({
                  date,
                  unavailabilities:
                    service.coworkingSpace?.unavailabilities ?? [],
                  availabilities: service.availabilities,
                })
              }
              fromMonth={currentMonth.toDate()}
              locale={fr}
              mode="multiple"
              selected={selectedDates}
              toMonth={nextMonth.toDate()}
              onDayClick={() => {}}
              onSelect={onValueChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
