import { Metadata } from "next";

import MyPrepaidCards from "./client";

export const metadata: Metadata = {
  title: "Mes cartes pré-payées",
};

export default function MyPrepaidCardsPage() {
  return <MyPrepaidCards />;
}
