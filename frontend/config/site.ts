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
    // GENERAL
    notFound: {
      href: "/404",
    },
    // AUTHENTICATION
    forgotPassword: {
      href: "/forgot-password",
    },
    signup: {
      href: "/signup",
    },
    login: {
      href: "/login",
    },
    // COWORKER PAGES
    dashboard: {
      href: "/",
    },
    book: {
      href: "/book",
    },
    serviceCalendar: {
      href: "/service-calendar",
    },
    myInformation: {
      href: "/my-information",
    },
    // ADMIN PAGES
    adminBookings: {
      href: "/admin/bookings",
    },
    adminPayments: {
      href: "/admin/payments",
    },
    adminPrepaidCardsNew: {
      href: "/admin/prepaid-cards/new",
    },
    strapiAdmin: {
      href: API_URL.replace("/api", "/admin"),
    },
  },
};

export const MINIMUM_BOOKING_DURATION = moment.duration("1", "hours");
