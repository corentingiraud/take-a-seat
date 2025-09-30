"use client";

import { useEffect, useMemo, useState } from "react";
import React from "react";
import { ChevronRight } from "lucide-react";
import { Moment } from "moment";

import { useServiceCalendar } from "@/contexts/service-calendar-context";
import { Booking } from "@/models/booking";
import { Availability } from "@/models/availability";
import { Unavailability } from "@/models/unavailability";
import { WeekSelector } from "@/components/ui/week-selector";
import { Button } from "@/components/ui/button";
import { UserPreview } from "@/components/users/preview";
import { useAuth } from "@/contexts/auth-context";
import { RoleType } from "@/models/role";
import moment from "@/lib/moment";

export const ServiceCalendarView = () => {
  const { bookings, startDate, endDate, service, setWeekRange, goToNextWeek } =
    useServiceCalendar();
  const { hasRole } = useAuth();

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>(
    [],
  );
  const [hours, setHours] = useState<number[]>([]);
  const [weekDays, setWeekDays] = useState<Moment[]>([]);

  // Map des bookings par slot "YYYY-MM-DD-HH-mm"
  const calendarData = useMemo(() => {
    const map = new Map<string, Booking[]>();

    for (const booking of bookings) {
      const key = `${booking.startDate.format("YYYY-MM-DD-HH-mm")}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(booking);
    }

    return map;
  }, [bookings]);

  useEffect(() => {
    if (!service) {
      setAvailabilities([]);
      setUnavailabilities([]);
      setHours([]);
      setWeekDays([]);

      return;
    }

    // Availabilities qui chevauchent la semaine
    const rangeAvailabilities =
      service.findAvailabilitiesForDateRange(startDate, endDate) || [];

    // Unavailabilities du coworking space (si dispo) qui chevauchent la semaine
    const rangeUnavailabilities =
      service.coworkingSpace?.findUnavailabilitiesForDateRange(
        startDate,
        endDate,
      ) || [];

    if (rangeAvailabilities.length === 0) {
      setAvailabilities([]);
      setUnavailabilities(rangeUnavailabilities);
      setHours([]);
      setWeekDays([]);

      return;
    }

    // Union des jours ouverts par availability
    const daysSet = new Map<string, Moment>();

    for (const av of rangeAvailabilities) {
      for (const d of av.getAvailableDaysOfWeek(startDate)) {
        const key = d.format("YYYY-MM-DD");

        if (!daysSet.has(key)) daysSet.set(key, d);
      }
    }
    const days = Array.from(daysSet.values()).sort(
      (a, b) => a.valueOf() - b.valueOf(),
    );

    // Bornes horaires globales (min opening / max closing) pour la grille
    let globalEarliestHour = Infinity;
    let globalLatestHour = -Infinity;

    for (const av of rangeAvailabilities) {
      const earliest = av.earliestOpeningOfWeek?.hour ?? null;
      const latest = av.latestClosingOfTheWeek?.hour ?? null;

      if (earliest !== null && earliest < globalEarliestHour)
        globalEarliestHour = earliest;
      if (latest !== null && latest > globalLatestHour)
        globalLatestHour = latest;
    }

    if (
      !Number.isFinite(globalEarliestHour) ||
      !Number.isFinite(globalLatestHour) ||
      globalLatestHour <= globalEarliestHour
    ) {
      setAvailabilities(rangeAvailabilities);
      setUnavailabilities(rangeUnavailabilities);
      setHours([]);
      setWeekDays(days);

      return;
    }

    const duration = service.bookingDuration ?? 60;
    const totalMinutes = (globalLatestHour - globalEarliestHour) * 60;
    const hourOffsets = Array.from(
      { length: Math.floor(totalMinutes / duration) },
      (_, i) => i * duration,
    );

    setAvailabilities(rangeAvailabilities);
    setUnavailabilities(rangeUnavailabilities);
    setHours(hourOffsets);
    setWeekDays(days);
  }, [service, startDate, endDate]);

  // Availability couvrant un slot (si chevauchements, on prend la 1ère)
  const findAvailabilityForSlot = React.useCallback(
    (day: Moment, hour: number, minute: number): Availability | null => {
      if (availabilities.length === 0 || !service) return null;
      const slotStart = day.clone().startOf("day").hour(hour).minute(minute);
      const duration = moment.duration(
        service.bookingDuration ?? 60,
        "minutes",
      );

      return (
        availabilities.find((av) => av.includeSlot(slotStart, duration)) ?? null
      );
    },
    [availabilities, service],
  );

  // Slot indisponible à cause d'une unavailability (chevauchement strict)
  const isSlotUnavailable = React.useCallback(
    (day: Moment, hour: number, minute: number): boolean => {
      if (unavailabilities.length === 0 || !service) return false;

      const slotStart = day.clone().startOf("day").hour(hour).minute(minute);
      const slotEnd = slotStart
        .clone()
        .add(service.bookingDuration ?? 60, "minutes");

      // Chevauchement si: uStart < slotEnd && uEnd > slotStart
      return unavailabilities.some((u) => {
        const uStart = moment(u.startDate);
        const uEnd = moment(u.endDate);

        return uStart.isBefore(slotEnd) && uEnd.isAfter(slotStart);
      });
    },
    [unavailabilities, service],
  );

  // Jour fermé si aucune availability ne couvre le jour avec au moins un slot
  // (les unavailabilities sont gérées au niveau du slot pour éviter de fermer tout le jour si partielle)
  const isClosedDay = React.useCallback(
    (day: Moment) => {
      if (availabilities.length === 0) return true;
      const covering = availabilities.filter(
        (av) =>
          av.startDate.isSameOrBefore(day, "day") &&
          av.endDate.isSameOrAfter(day, "day"),
      );

      if (covering.length === 0) return true;

      return !covering.some((av) => av.getBookingSlotsFor(day).length > 0);
    },
    [availabilities],
  );

  // Slot ouvert si une availability inclut le slot ET qu'aucune unavailability ne le bloque
  const isTimeOpen = React.useCallback(
    (day: Moment, hour: number, minute: number) => {
      const av = findAvailabilityForSlot(day, hour, minute);

      if (!av) return false;
      if (isSlotUnavailable(day, hour, minute)) return false;

      return true;
    },
    [findAvailabilityForSlot, isSlotUnavailable],
  );

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

  // Aucun créneau affichable
  if (
    availabilities.length === 0 ||
    weekDays.length === 0 ||
    hours.length === 0
  )
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

  const referenceOpeningHour = Math.min(
    ...availabilities
      .map((av) => av.earliestOpeningOfWeek?.hour)
      .filter((h): h is number => typeof h === "number"),
  );

  return (
    <div className="space-y-4">
      {headerNav}

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
            const h = referenceOpeningHour + Math.floor(offset / 60);
            const m = offset % 60;
            const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            return (
              <React.Fragment key={label}>
                <div className="border-b border-r p-2 text-sm font-medium bg-gray-50 dark:bg-neutral-900 dark:text-white">
                  {label}
                </div>

                {weekDays.map((day) => {
                  const cellKey = `${day.format("YYYY-MM-DD")}-${String(h).padStart(2, "0")}-${String(m).padStart(2, "0")}`;

                  if (isClosedDay(day)) {
                    return (
                      <div
                        key={cellKey}
                        aria-label="Fermé"
                        className="border-b border-r p-2 text-xs text-center italic bg-gray-100 text-muted-foreground dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                      >
                        Fermé
                      </div>
                    );
                  }

                  const avForSlot = findAvailabilityForSlot(day, h, m);
                  const slotBlocked = isSlotUnavailable(day, h, m);

                  if (!avForSlot || slotBlocked) {
                    // Ouvert ce jour mais créneau fermé (pause ou indispo)
                    return (
                      <div
                        key={cellKey}
                        aria-label={slotBlocked ? "Indisponible" : "Fermé"}
                        className={`border-b border-r p-2 text-xs text-center italic text-muted-foreground dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 ${
                          slotBlocked
                            ? "bg-red-50 dark:bg-red-900/20"
                            : "bg-gray-50"
                        }`}
                      >
                        {slotBlocked ? "Indisponible" : "Fermé"}
                      </div>
                    );
                  }

                  // Slot ouvert → capacité selon l'availability
                  const slotKey = `${day.format("YYYY-MM-DD")}-${String(h).padStart(2, "0")}-${String(m).padStart(2, "0")}`;
                  const slotBookings = calendarData.get(slotKey) || [];
                  const capacity = avForSlot.numberOfSeats;
                  const isFull = slotBookings.length >= capacity;

                  return (
                    <div
                      key={cellKey}
                      className={`border-b border-r p-2 text-xs space-y-1 dark:border-neutral-700 ${
                        isFull
                          ? "bg-red-100 dark:bg-red-900/40"
                          : "bg-white dark:bg-neutral-950"
                      }`}
                    >
                      <div className="font-semibold text-gray-700 dark:text-gray-200">
                        {slotBookings.length} / {capacity}
                      </div>
                      {slotBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-blue-100 dark:bg-blue-800/40 rounded px-1 py-0.5 text-[11px] text-blue-900 dark:text-blue-200"
                        >
                          {hasRole(RoleType.SUPER_ADMIN) ? (
                            <UserPreview user={b.user!} />
                          ) : (
                            b.user?.firstNameWithInitial ||
                            "Utilisateur inconnu"
                          )}
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
