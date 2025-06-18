import { Metadata } from "next";

import AdminPaymentsPageClient from "./client";

export const metadata: Metadata = {
  title: "Administration des paiements",
};

export default function AdminBookingsPage() {
  return <AdminPaymentsPageClient />;
}
