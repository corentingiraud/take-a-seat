import { Metadata } from "next";

import MyBookings from "./client";

export const metadata: Metadata = {
  title: "Mes réservations",
};

export default function MyBookingsPage() {
  return <MyBookings />;
}
