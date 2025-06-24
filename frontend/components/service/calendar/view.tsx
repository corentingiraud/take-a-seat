"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import React from "react";

import { Button } from "@/components/ui/button";
import { useServiceCalendar } from "@/contexts/service-calendar-context";
import { Booking } from "@/models/booking";

export const ServiceCalendarView = () => {
  const { bookings, startDate, endDate, service, setStartDate, setEndDate } =
    useServiceCalendar();

  const calendarData = useMemo(() => {
    const map = new Map<string, Booking[]>();

    for (const booking of bookings) {
      const key = `${booking.startDate.format("YYYY-MM-DD-HH")}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(booking);
    }

    return map;
  }, [bookings]);

  const prevWeek = () => {
    setStartDate(startDate.clone().subtract(1, "week").startOf("isoWeek"));
    setEndDate(endDate.clone().subtract(1, "week").endOf("isoWeek"));
  };

  const nextWeek = () => {
    setStartDate(startDate.clone().add(1, "week").startOf("isoWeek"));
    setEndDate(endDate.clone().add(1, "week").endOf("isoWeek"));
  };

  if (!service) return <p>Veuillez sélectionner un service.</p>;

  // Show Monday to Saturday only (exclude Sunday)
  const days = Array.from({ length: 6 }, (_, i) =>
    startDate.clone().startOf("isoWeek").add(i, "day"),
  );

  const hours = Array.from(
    { length: service.closingTime.hour - service.openingTime.hour },
    (_, i) => service.openingTime.hour + i,
  );

  return (
    <div className="space-y-4">
      {/* Header nav */}
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={prevWeek}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="text-sm text-muted-foreground">
          Réservations du {startDate.format("DD/MM")} -{" "}
          {endDate.format("DD/MM")}
        </p>
        <Button size="icon" variant="ghost" onClick={nextWeek}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(6,minmax(120px,1fr))] border-t border-l dark:border-neutral-700">
          {/* Header row */}
          <div className="border-b border-r p-2 font-medium text-sm bg-gray-100 dark:bg-neutral-800 dark:text-white">
            Heure
          </div>
          {days.map((day) => (
            <div
              key={day.format("YYYY-MM-DD")}
              className="border-b border-r p-2 text-center text-sm font-medium bg-gray-100 dark:bg-neutral-800 dark:text-white"
            >
              {day.format("ddd DD/MM")}
            </div>
          ))}

          {/* Time slots */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="border-b border-r p-2 text-sm font-medium bg-gray-50 dark:bg-neutral-900 dark:text-white">
                {`${String(hour).padStart(2, "0")}:00`}
              </div>

              {days.map((day) => {
                const key = `${day.format("YYYY-MM-DD")}-${String(hour).padStart(2, "0")}`;
                const slotBookings = calendarData.get(key) || [];

                return (
                  <div
                    key={key}
                    className="border-b border-r p-2 text-xs space-y-1 bg-white dark:bg-neutral-950 dark:border-neutral-700"
                  >
                    <div className="font-semibold text-gray-700 dark:text-gray-200">
                      {slotBookings.length} / {service.maximumBookingsPerHour}
                    </div>
                    {slotBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-blue-100 dark:bg-blue-800/40 rounded px-1 py-0.5 text-[11px] text-blue-900 dark:text-blue-200"
                      >
                        {b.user?.firstNameWithInitial || "Utilisateur inconnu"}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
