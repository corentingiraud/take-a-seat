"use client";

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
    getBookings,
  } = useCalendar({
    coworkingSpaceId,
    startDate,
    endDate,
  });

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
  if (coworkingSpace.getAvailabilitiesForDateRange(startDate, endDate).length === 0)
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
    <div className="flex items-center flex-wrap gap-3 mt-4">
      {Object.entries(serviceColorMap).map(([serviceDocumentId, color]) => {
        const className = colorClasses[color] || colorClasses.blue;

        const service = coworkingSpace.services.find(
          (s) => s.documentId === serviceDocumentId
        );

        if (!service) return null;

        return (
          <div key={serviceDocumentId} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${className}`} />
            <span className="text-sm">{service.name}</span>
          </div>
        );
      })}
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
            className="border-b border-r p-2 text-center text-sm font-medium bg-gray-100 dark:bg-neutral-800 dark:text-white sticky top-0 z-20"          >
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

                // Unavailable slot
                if (isUnavailable(day, time)) {
                  return (
                    <div
                      key={cellKey}
                      className="border-b border-r p-2 text-xs text-center italic bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 dark:border-neutral-700"
                    >
                      Indisponible
                    </div>
                  );
                }

                // No availability → closed
                const av = findAvailability(day, time);
                if (!av) {
                  return (
                    <div
                      key={cellKey}
                      className="border-b border-r p-2 text-xs text-center italic bg-gray-50 text-muted-foreground dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700"
                    >
                      Fermé
                    </div>
                  );
                }

                // Slot open
                const slotStart = day.clone().hour(time.hour).minute(time.minute);
                const slotEnd = slotStart.clone().add(slotDuration, "minutes");

                const slotBookings = getBookings(slotStart, slotEnd);

                const capacity = av.numberOfSeats;
                const isFull = slotBookings.length >= capacity;

                return (
                  <div
                    key={cellKey}
                    className={`border-b border-r p-2 text-xs space-y-1 dark:border-neutral-700 ${
                      isFull ? "bg-red-100 dark:bg-red-900/40" : "bg-white dark:bg-neutral-950"
                    }`}
                  >
                    <div className="font-semibold text-gray-700 dark:text-gray-200">
                      {slotBookings.length} / {capacity}
                    </div>

                    {slotBookings.map((b) => {
                      const serviceDocumentId = b.service?.documentId || 0;
                      const color = serviceColorMap[serviceDocumentId];
                      const className = colorClasses[color] || colorClasses.blue;

                      return (
                        <div
                          key={b.id}
                          className={`${className} rounded px-1 py-0.5 text-[11px]`}
                        >
                          {hasRole(RoleType.SUPER_ADMIN)
                            ? <UserPreview user={b.user!} />
                            : b.user?.firstNameWithInitial || "Utilisateur inconnu"}
                        </div>
                      );
                    })}
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
