import { env } from "next-runtime-env";

export type SiteConfig = typeof siteConfig;

export const API_URL =
  env("NEXT_PUBLIC_STRAPI_API_URL") || "http://localhost:1337/api";

export const HCAPTCHA_SITE_KEY =
  env("NEXT_PUBLIC_HCAPTCHA_SITE_KEY") ||
  "92caca56-0a84-409e-acf0-449c998efc7e";

export const siteConfig = {
  name: "Le Pêle Coworking",
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
    adminUserDashboard: {
      href: "/admin/users",
    },
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
