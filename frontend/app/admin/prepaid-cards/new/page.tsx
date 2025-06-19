import { Metadata } from "next";

import AdminPrepaidCardsPageClient from "./client";

export const metadata: Metadata = {
  title: "Administration des cartes prépayées",
};

export default function AdminPrepaidCardsPage() {
  return <AdminPrepaidCardsPageClient />;
}
