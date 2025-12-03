"use client";

import { CalendarFilter } from "@/components/coworking-spaces/calendar/filters";
import { CalendarView } from "@/components/coworking-spaces/calendar/view";
import { Section } from "@/components/ui/section";
import { CoworkingSpace } from "@/models/coworking-space";
import { useState } from "react";

export default function Calendar() {
  const [coworkingSpace, setCoworkingSpace] = useState<CoworkingSpace>();

  return (
    <div className="space-y-6">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Calendrier
      </h2>
      <Section title="Filtres">
        <CalendarFilter onChange={setCoworkingSpace} coworkingSpace={coworkingSpace}/>
      </Section>
      <Section title="Calendrier">
        {coworkingSpace && <CalendarView coworkingSpaceId={coworkingSpace.documentId}/>}
      </Section>
    </div>
  );
}
