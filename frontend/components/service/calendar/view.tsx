"use client";

import { useEffect, useMemo, useState } from "react";
import React from "react";
import { ChevronRight } from "lucide-react";
import { Moment } from "moment";

import { useServiceCalendar } from "@/contexts/service-calendar-context";
import { Booking } from "@/models/booking";
import { Availability } from "@/models/availability";
import { WeekSelector } from "@/components/ui/week-selector";
import { Button } from "@/components/ui/button";

export const ServiceCalendarView = () => {
  const { bookings, startDate, endDate, service, setWeekRange, goToNextWeek } =
    useServiceCalendar();

  const [availability, setAvailability] = useState<Availability | null>(null);
  const [hours, setHours] = useState<number[]>([]);
  const [weekDays, setWeekDays] = useState<Moment[]>([]);

  const calendarData = useMemo(() => {
    const map = new Map<string, Booking[]>();

    for (const booking of bookings) {
      const key = `${booking.startDate.format("YYYY-MM-DD-HH-mm")}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(booking);
    }

    return map;
  }, [bookings]);

  useEffect(() => {
    const maybeAvailability = service?.findAvailabilityFor(startDate);

    if (!maybeAvailability) {
      setAvailability(null);
      setHours([]);

      return;
    }

    const openingTime = maybeAvailability.earliestOpeningOfWeek;
    const latestClosingTime = maybeAvailability.latestClosingOfTheWeek;

    const duration = service?.bookingDuration ?? 60;
    const totalMinutes = (latestClosingTime!.hour - openingTime!.hour) * 60;
    const hours = Array.from(
      { length: Math.floor(totalMinutes / duration) },
      (_, i) => i * duration,
    );

    setAvailability(maybeAvailability);
    setHours(hours);
    setWeekDays(maybeAvailability.getAvailableDaysOfWeek(startDate));
  }, [service, startDate, endDate]);

  if (!service)
    return (
      <p className="mt-10 text-center text-muted-foreground">
        Veuillez sélectionner un service.
      </p>
    );

  const headerNav = (
    <WeekSelector
      endDate={endDate}
      startDate={startDate}
      onChange={(newStart, newEnd) => {
        setWeekRange(newStart, newEnd);
      }}
    />
  );

  if (!availability)
    return (
      <div className="space-y-10">
        {headerNav}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-center text-muted-foreground">
            Le service semble fermé sur cette semaine.
          </p>
          <Button onClick={goToNextWeek}>
            Essayez la semaine suivante
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Header nav */}
      {headerNav}

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div
          className="grid border-t border-l dark:border-neutral-700"
          style={{
            gridTemplateColumns: `80px repeat(${weekDays.length}, minmax(120px,1fr))`,
          }}
        >
          {/* Header row */}
          <div className="border-b border-r p-2 font-medium text-sm bg-gray-100 dark:bg-neutral-800 dark:text-white">
            Heure
          </div>
          {weekDays.map((day) => (
            <div
              key={day.format("YYYY-MM-DD")}
              className="border-b border-r p-2 text-center text-sm font-medium bg-gray-100 dark:bg-neutral-800 dark:text-white"
            >
              {day.format("ddd DD/MM")}
            </div>
          ))}

          {/* Time slots */}
          {hours.map((offset) => {
            const openingHour = availability!.earliestOpeningOfWeek!.hour;
            const h = openingHour + Math.floor(offset / 60);
            const m = offset % 60;
            const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            return (
              <React.Fragment key={label}>
                <div className="border-b border-r p-2 text-sm font-medium bg-gray-50 dark:bg-neutral-900 dark:text-white">
                  {label}
                </div>

                {weekDays.map((day) => {
                  const key = `${day.format("YYYY-MM-DD")}-${String(h).padStart(2, "0")}-${String(m).padStart(2, "0")}`;
                  const slotBookings = calendarData.get(key) || [];

                  return (
                    <div
                      key={key}
                      className="border-b border-r p-2 text-xs space-y-1 bg-white dark:bg-neutral-950 dark:border-neutral-700"
                    >
                      <div className="font-semibold text-gray-700 dark:text-gray-200">
                        {slotBookings.length} / {availability.numberOfSeats}
                      </div>
                      {slotBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-blue-100 dark:bg-blue-800/40 rounded px-1 py-0.5 text-[11px] text-blue-900 dark:text-blue-200"
                        >
                          {b.user?.firstNameWithInitial ||
                            "Utilisateur inconnu"}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
