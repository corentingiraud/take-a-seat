import { Metadata } from "next";

import ServiceCalendar from "./client";

export const metadata: Metadata = {
  title: "Calendrier des services",
};

export default function ServiceCalendarPage() {
  return <ServiceCalendar />;
}
