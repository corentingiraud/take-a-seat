"use client";

import { ServiceCalendarFilter } from "@/components/service/calendar/filters";
import { ServiceCalendarView } from "@/components/service/calendar/view";
import { Section } from "@/components/ui/section";
import { ServiceCalendarProvider } from "@/contexts/service-calendar-context";

export default function ServiceCalendar() {
  return (
    <ServiceCalendarProvider>
      <div className="space-y-6">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Calendrier des services
        </h2>
        <Section title="Filtres">
          <ServiceCalendarFilter />
        </Section>
        <Section title="Calendrier">
          <ServiceCalendarView />
        </Section>
      </div>
    </ServiceCalendarProvider>
  );
}
