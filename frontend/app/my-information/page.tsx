import { Metadata } from "next";

import MyInformation from "./client";

export const metadata: Metadata = {
  title: "Mes informations",
};

export default function MyInformationPage() {
  return <MyInformation />;
}
