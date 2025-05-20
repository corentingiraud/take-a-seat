import { Metadata } from "next";

import AdminBookingsPageClient from "./client";

export const metadata: Metadata = {
  title: "Administration des réservations",
};

export default function AdminBookingsPage() {
  return <AdminBookingsPageClient />;
}
