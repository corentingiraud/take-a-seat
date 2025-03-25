"use client";

import { env } from "next-runtime-env";
import moment from "moment";
moment.locale("fr");

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Take a seat",
  description: "",
  navItems: [
    {
      label: "Accueil",
      href: "/",
    },
  ],
};

export const API_URL =
  env("NEXT_PUBLIC_STRAPI_API_URL") || "http://localhost:1337/api";

export const MINIMUM_BOOKING_DURATION = moment.duration("1", "hours");
