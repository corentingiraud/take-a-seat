"use client";

import { Moment } from "moment";

import moment from "@/lib/moment";
import { useCoworkingSpaceCalendar } from "@/hooks/use-coworking-space-calendar";
import { groupBookingsByPerson } from "@/models/utils/booking-people";

const MAX_DAYS = 7;

interface AlreadyBookedProps {
  coworkingSpaceId?: string;
  serviceId: string;
  startDate: Moment;
  endDate: Moment;
  // Days about to be booked
  days: Moment[];
}

export const AlreadyBooked = ({
  coworkingSpaceId,
  serviceId,
  startDate,
  endDate,
  days,
}: AlreadyBookedProps) => {
  const { data: space } = useCoworkingSpaceCalendar({ coworkingSpaceId, startDate, endDate });

  if (!space || days.length === 0) return null;

  const uniqueDays = [...new Map(days.map((d) => [d.format("YYYY-MM-DD"), d])).values()];

  return (
    <div className="mt-6 rounded-md border p-4 text-sm dark:border-neutral-700">
      <h4 className="mb-2 font-semibold">Déjà réservés</h4>
      <ul className="space-y-1">
        {uniqueDays.slice(0, MAX_DAYS).map((day) => {
          const people = groupBookingsByPerson(
            space
              .bookingsOverlapping(day.clone().startOf("day"), day.clone().endOf("day"), serviceId)
              .map((b) => ({
                name: b.user?.firstNameWithInitial ?? "Quelqu'un",
                start: b.startDate.toDate(),
                end: b.endDate.toDate(),
              })),
          );

          return (
            <li key={day.format("YYYY-MM-DD")}>
              <span>{moment(day).format("dddd D MMMM")}</span>
              {" : "}
              {people.length
                ? people.map((p) => `${p.name} ${p.label}`).join(", ")
                : "personne n'a encore réservé ce jour-là."}
            </li>
          );
        })}
      </ul>
      {uniqueDays.length > MAX_DAYS && (
        <p className="mt-1 text-xs text-muted-foreground">
          et {uniqueDays.length - MAX_DAYS} autres jours
        </p>
      )}
    </div>
  );
};
