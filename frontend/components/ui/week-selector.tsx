"use client";

import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import moment, { Moment } from "moment";
import { useCallback, useEffect, useState } from "react";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  CalendarDayButton,
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

type WeekSelectorProps = {
  label?: string;
  startDate: Moment;
  endDate: Moment;
  onChange?: (start: Moment, end: Moment) => void;
  compact?: boolean;
  displayCalendar?: boolean;
  getMarkedDays?: (monthStart: Moment, monthEnd: Moment) => Promise<Moment[]>;
};

export const WeekSelector = ({
  label = "Semaine du",
  startDate,
  endDate,
  onChange,
  compact = false,
  displayCalendar = true,
  getMarkedDays,
}: WeekSelectorProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(startDate.toDate());
  const [markedDays, setMarkedDays] = useState<Moment[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);

  const fetchMarkedDays = useCallback(async (month: Date) => {
    if (!getMarkedDays) return;

    setIsLoadingMarkers(true);
    try {
      const monthStart = moment(month).startOf("month");
      const monthEnd = moment(month).endOf("month");
      const days = await getMarkedDays(monthStart, monthEnd);
      setMarkedDays(days);
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [getMarkedDays]);

  useEffect(() => {
    fetchMarkedDays(currentMonth);
  }, [currentMonth, fetchMarkedDays]);

  const goToPreviousWeek = () => {
    const newStart = startDate.clone().subtract(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    onChange?.(newStart, newEnd);
  };

  const goToNextWeek = () => {
    const newStart = startDate.clone().add(1, "week").startOf("isoWeek");
    const newEnd = newStart.clone().endOf("isoWeek");

    onChange?.(newStart, newEnd);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const newStart = startDate
        .clone()
        .year(date.getFullYear())
        .month(date.getMonth())
        .date(date.getDate())
        .startOf("isoWeek");
      const newEnd = newStart.clone().endOf("isoWeek");
      onChange?.(newStart, newEnd);
      setCalendarOpen(false);
    }
  };

  const markedDatesSet = new Set(
    markedDays.map((d) => d.format("YYYY-MM-DD"))
  );

  const isDateMarked = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return markedDatesSet.has(dateStr);
  };

  const isDateInRange = (date: Date) => {
    const momentDate = moment(date).startOf("day");
    return momentDate.isSameOrAfter(startDate.clone().startOf("day")) &&
           momentDate.isSameOrBefore(endDate.clone().startOf("day"));
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  return (
    <div className="flex items-center justify-between">
      <Button size="icon" variant="ghost" onClick={goToPreviousWeek}>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {!compact && (
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {label} {startDate.format("D MMMM")} au{" "}
            {endDate.format("D MMMM YYYY")}
          </p>
          {displayCalendar && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost">
                  <CalendarIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  month={currentMonth}
                  onMonthChange={handleMonthChange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  captionLayout="dropdown"
                  className="rounded-lg border shadow-sm"
                  locale={fr}
                  components={{
                    DayButton: ({ children, modifiers, day, ...props }) => {
                      const hasMarker =
                        !modifiers.outside && isDateMarked(day.date);
                      const showLoading = !modifiers.outside && isLoadingMarkers;
                      const inRange = !modifiers.outside && isDateInRange(day.date);

                      return (
                        <CalendarDayButton
                          day={day}
                          modifiers={modifiers}
                          {...props}
                          className={inRange ? "bg-primary/10" : undefined}
                        >
                          {children}
                          {showLoading ? (
                            <Skeleton className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" />
                          ) : (
                            hasMarker && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                            )
                          )}
                        </CalendarDayButton>
                      );
                    },
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      <Button size="icon" variant="ghost" onClick={goToNextWeek}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
