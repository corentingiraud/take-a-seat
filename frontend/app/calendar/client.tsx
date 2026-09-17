"use client";

import { parseAsString, useQueryState } from "nuqs";

import { CalendarFilter } from "@/components/coworking-spaces/calendar/filters";
import { CalendarView } from "@/components/coworking-spaces/calendar/view";
import { Section } from "@/components/ui/section";

export default function Calendar() {
  const [coworkingSpaceId, setCoworkingSpaceId] = useQueryState(
    "coworkingSpaceId",
    parseAsString.withDefault(""),
  );

  return (
    <div className="space-y-6">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Calendrier
      </h2>
      <Section title="Filtres">
        <CalendarFilter
          coworkingSpaceId={coworkingSpaceId}
          onChange={setCoworkingSpaceId}
        />
      </Section>
      <Section title="Calendrier">
        {coworkingSpaceId && <CalendarView coworkingSpaceId={coworkingSpaceId} />}
      </Section>
    </div>
  );
}
