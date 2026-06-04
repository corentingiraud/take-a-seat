"use client";

import { cn } from "@/lib/utils";

interface HeatmapCell {
  dayOfWeek: number;
  hour: number;
  count: number;
}

interface BookingHeatmapProps {
  cells: HeatmapCell[];
  isLoading?: boolean;
}

// Monday to Friday; JS getDay() is 0=Sunday..6=Saturday. Weekends are hidden.
const DAYS = [
  { label: "Lun", index: 1 },
  { label: "Mar", index: 2 },
  { label: "Mer", index: 3 },
  { label: "Jeu", index: 4 },
  { label: "Ven", index: 5 },
];

export function BookingHeatmap({ cells, isLoading }: BookingHeatmapProps) {
  if (isLoading) {
    return <div className="h-48 w-full animate-pulse rounded bg-muted" />;
  }

  if (cells.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Aucune donnée pour cette période
      </p>
    );
  }

  const hours = cells.map((c) => c.hour);
  const minHour = Math.min(...hours);
  const maxHour = Math.max(...hours);
  const hourRange = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i,
  );

  const maxCount = Math.max(...cells.map((c) => c.count));
  const countByKey = new Map(cells.map((c) => [`${c.dayOfWeek}-${c.hour}`, c.count]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-10" />
            {hourRange.map((h) => (
              <th key={h} className="text-center font-normal text-muted-foreground">
                {h}h
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day.index}>
              <td className="pr-2 text-right text-muted-foreground">{day.label}</td>
              {hourRange.map((h) => {
                const count = countByKey.get(`${day.index}-${h}`) ?? 0;
                const intensity = maxCount > 0 ? count / maxCount : 0;
                return (
                  <td key={h} className="p-0">
                    <div
                      className={cn(
                        "flex h-7 items-center justify-center rounded",
                        count === 0 && "bg-muted/40",
                      )}
                      style={
                        count > 0
                          ? { backgroundColor: `rgba(37, 99, 235, ${0.15 + intensity * 0.85})` }
                          : undefined
                      }
                      title={`${day.label} ${h}h — ${count} réservation(s)`}
                    >
                      {count > 0 && (
                        <span className={cn("font-medium", intensity > 0.5 ? "text-white" : "text-foreground")}>
                          {count}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
