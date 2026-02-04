import { Metadata } from "next";

import StatsPageClient from "./client";

export const metadata: Metadata = {
  title: "Statistiques",
};

export default function StatsPage() {
  return <StatsPageClient />;
}
