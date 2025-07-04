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
