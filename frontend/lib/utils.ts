import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { siteConfig } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(val?: string): string {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function generateDynamicPageTitle(title: string) {
  return `${title} - ${siteConfig.name}`;
}

export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s.-]/g, "");

  // FR sans indicatif → +33
  if (/^0[67]\d{8}$/.test(cleaned)) {
    return "+33" + cleaned.slice(1);
  }

  // Déjà international
  return cleaned;
};
