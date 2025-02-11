export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Take a seat",
  description: "",
  navItems: [
    {
      label: "Accueil",
      href: "/",
    },
    {
      label: "Mes réservation",
      href: "/my-bookings",
    },
    {
      label: "Mes cartes pré-payées",
      href: "/my-prepaid-cards",
    },
  ],
};

export const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337/api";
