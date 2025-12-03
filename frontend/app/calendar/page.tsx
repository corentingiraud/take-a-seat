import { Metadata } from "next";

import Calendar from "./client";

export const metadata: Metadata = {
  title: "Calendrier",
};

export default function ServiceCalendarPage() {
  return <Calendar />;
}
