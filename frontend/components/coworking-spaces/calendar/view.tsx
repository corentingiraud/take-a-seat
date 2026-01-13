"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { WeekSelector } from "@/components/ui/week-selector";
import { Button } from "@/components/ui/button";
import { useWeekSelector } from "@/hooks/use-week-selector";
import { useCalendar } from "@/hooks/use-calendar";
import { UserPreview } from "@/components/users/preview";
import { RoleType } from "@/models/role";
import { useAuth } from "@/contexts/auth-context";

interface CalendarViewProps {
  coworkingSpaceId: string;
}

export const CalendarView = ({ coworkingSpaceId }: CalendarViewProps) => {
  const { hasRole } = useAuth();

  const { startDate, endDate, setWeekRange, goToNextWeek } = useWeekSelector();

  const {
    coworkingSpace,
    weekdays,
    hours,
    slotDuration,
    serviceColorMap,
    isUnavailable,
    findAvailability,
    hasAvailabilityBeforeAndAfter,
    getBookings,
  } = useCalendar({
    coworkingSpaceId,
    startDate,
    endDate,
  });

  // services that the user chose to hide (by documentId)
  const [hiddenServices, setHiddenServices] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleServiceVisibility = (serviceDocumentId: string) => {
    setHiddenServices((prev) => {
      const next = new Set(prev);
      if (next.has(serviceDocumentId)) {
        next.delete(serviceDocumentId);
      } else {
        next.add(serviceDocumentId);
      }
      return next;
    });
  };

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-800/40",
    green: "bg-green-100 dark:bg-green-800/40",
    yellow: "bg-yellow-100 dark:bg-yellow-800/40",
    purple: "bg-purple-100 dark:bg-purple-800/40",
    red: "bg-red-100 dark:bg-red-800/40",
  };

  const headerNav = (
    <WeekSelector
      endDate={endDate}
      startDate={startDate}
      onChange={setWeekRange}
    />
  );

  // No coworking space found
  if (!coworkingSpace)
    return (
      <div className="space-y-10">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-center text-muted-foreground">
            Aucun espace de coworking trouvé...
          </p>
        </div>
      </div>
    );

  // No availabilities for the entire range
  if (
    coworkingSpace.getAvailabilitiesForDateRange(startDate, endDate).length ===
    0
  )
    return (
      <div className="space-y-10">
        {headerNav}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-center text-muted-foreground">
            L&apos;espace de coworking semble fermé sur cette semaine.
          </p>
          <Button onClick={goToNextWeek}>
            Essayez la semaine suivante
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );

  const serviceLegend = (
    <div className="mt-4">
      <div className="flex items-center flex-wrap gap-3">
        {Object.entries(serviceColorMap).map(([serviceDocumentId, color]) => {
          const className = colorClasses[color] || colorClasses.blue;

          const service = coworkingSpace.services.find(
            (s) => s.documentId === serviceDocumentId,
          );

          if (!service) return null;

          const isHidden = hiddenServices.has(serviceDocumentId);

          return (
            <button
              key={serviceDocumentId}
              type="button"
              onClick={() => toggleServiceVisibility(serviceDocumentId)}
              className={`flex items-center gap-2 rounded px-2 py-1 text-sm transition hover:bg-muted/60 dark:hover:bg-neutral-800 cursor-pointer ${
                isHidden ? "opacity-50" : ""
              }`}
            >
              <div className={`w-4 h-4 rounded ${className}`} />
              <span>{service.name}</span>
              <span className="text-[11px] text-muted-foreground">
                ({isHidden ? "masqué" : "affiché"})
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Cliquez sur un service pour afficher ou masquer ses réservations dans le
        calendrier.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {headerNav}
      {serviceLegend}

      <div
        className="overflow-x-auto relative grid border-t border-l dark:border-neutral-700"
        style={{
          gridTemplateColumns: `80px repeat(${weekdays.length}, minmax(120px,1fr))`,
        }}
      >
        {/* Empty top-left header cell */}
        <div className="border-b border-r p-2 bg-gray-100 dark:bg-neutral-800 dark:text-white sticky left-0 top-0 z-30" />

        {/* Day headers */}
        {weekdays.map((day) => (
          <div
            key={day.format("YYYY-MM-DD")}
            className="border-b border-r p-2 text-center text-sm font-medium bg-gray-100 dark:bg-neutral-800 dark:text-white sticky top-0 z-20"
          >
            {day.format("ddd DD/MM")}
          </div>
        ))}

        {/* Time rows */}
        {hours.map((time) => {
          const label = `${String(time.hour).padStart(2, "0")}:${String(
            time.minute,
          ).padStart(2, "0")}`;

          return (
            <div key={label} className="contents">
              {/* Left time label */}
              <div className="border-b border-r p-2 text-sm font-medium bg-gray-50 dark:bg-neutral-900 dark:text-white sticky left-0 z-10">
                {label}
              </div>

              {/* Day cells */}
              {weekdays.map((day) => {
                const cellKey = `${day.format("YYYY-MM-DD")}-${label}`;

                // Unavailable slot (global)
                if (isUnavailable(day, time)) {
                  return (
                    <div
                      key={cellKey}
                      className="border-b border-r p-2 text-xs italic bg-red-50 text-red-600 
                                dark:bg-red-900/20 dark:text-red-300 dark:border-neutral-700
                                flex items-center justify-center"
                    >
                      Indisponible
                    </div>
                  );
                }

                // No availability → closed or pause (no service open at this time)
                const anyAvailability = findAvailability(day, time);
                if (!anyAvailability) {
                  const isPause = hasAvailabilityBeforeAndAfter(day, time);
                  return (
                    <div
                      key={cellKey}
                      className="border-b border-r p-2 text-xs italic bg-gray-50 text-muted-foreground
                                dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700
                                flex items-center justify-center"
                    >
                      {isPause ? "Pause" : "Fermé"}
                    </div>
                  );
                }

                // Slot open
                const slotStart = day
                  .clone()
                  .hour(time.hour)
                  .minute(time.minute);
                const slotEnd = slotStart.clone().add(slotDuration, "minutes");

                const slotMoment = slotStart.clone().add(1, "minute");
                const slotBookings = getBookings(slotStart, slotEnd);

                // Build per-service info for this slot
                const servicesForSlot = coworkingSpace.services
                  .map((service) => {
                    // find this service's availability for this exact slot
                    const avs = service.findAvailabilitiesForDateRange(
                      startDate,
                      endDate,
                    );
                    const serviceAvailability =
                      avs.find((av: any) => av.contains(slotMoment)) || null;

                    if (!serviceAvailability) return null;

                    const bookingsForService = slotBookings.filter(
                      (b) => b.service?.documentId === service.documentId,
                    );

                    const isServiceHidden = hiddenServices.has(
                      service.documentId,
                    );

                    const visibleBookingsForService = isServiceHidden
                      ? []
                      : bookingsForService;

                    return {
                      service,
                      availability: serviceAvailability,
                      capacity: serviceAvailability.numberOfSeats,
                      bookingsForService,
                      visibleBookingsForService,
                      isServiceHidden,
                    };
                  })
                  .filter(Boolean) as Array<{
                  service: (typeof coworkingSpace.services)[number];
                  availability: any;
                  capacity: number;
                  bookingsForService: any[];
                  visibleBookingsForService: any[];
                  isServiceHidden: boolean;
                }>;

                // global "full" state: all services that are available are full
                const isFull =
                  servicesForSlot.length > 0 &&
                  servicesForSlot.every(
                    (s) =>
                      s.visibleBookingsForService.length >= s.capacity &&
                      s.capacity > 0,
                  );


                  return (
                    <div
                      key={cellKey}
                      className={`border-b border-r p-2 text-xs space-y-2 dark:border-neutral-700 ${
                        isFull
                          ? "bg-red-100 dark:bg-red-900/40"
                          : "bg-white dark:bg-neutral-950"
                      }`}
                    >
                      {/* Per-service counts + user list */}
                      <div className="space-y-1">
                        {servicesForSlot.map(
                          ({
                            service,
                            capacity,
                            visibleBookingsForService,
                            isServiceHidden,
                          }) => {
                            const color = serviceColorMap[service.documentId] || "blue";
                            const className = colorClasses[color] || colorClasses.blue;

                            return (!isServiceHidden &&
                              <div key={service.documentId} className={`flex flex-col items-start text-[11px] rounded p-1 ${className}`}>
                                <div className="self-end">{`${visibleBookingsForService.length} / ${capacity}`}</div>
                                {visibleBookingsForService.length > 0 && (
                                    <div className="mt-1 w-full">
                                      {visibleBookingsForService.map((b) => (
                                        <div
                                          key={b.id}
                                          className="rounded px-1 py-0.5 text-[11px] bg-white/40 dark:bg-black/20"
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
                                  )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
