import { env } from "next-runtime-env";
import moment from "moment";
moment.locale("fr");

export type SiteConfig = typeof siteConfig;

export const API_URL =
  env("NEXT_PUBLIC_STRAPI_API_URL") || "http://localhost:1337/api";

export const siteConfig = {
  name: "Take a seat",
  description: "Réservez votre espace de travail en toute simplicité.",
  path: {
    home: {
      href: "/",
    },
    // AUTHENTICATION
    forgotPassword: {
      href: "/forgot-password",
    },
    signup: {
      href: "/signup",
    },
    login: {
      href: "/",
    },
    // COWORKER PAGES
    myInformation: {
      href: "/my-information",
    },
    myBookings: {
      href: "/my-bookings",
    },
    myPrepaidCards: {
      href: "/my-prepaid-cards",
    },
    // ADMIN PAGES
    adminBookings: {
      href: "/admin/bookings",
    },
    strapiAdmin: {
      href: API_URL.replace("/api", "/admin"),
    },
  },
};

export const MINIMUM_BOOKING_DURATION = moment.duration("1", "hours");
