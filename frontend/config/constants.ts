export const UNDEFINED_ID = -1;
export const UNDEFINED_DOCUMENT_ID = "undefined";

export type CardCategory = "subscription" | "prepaid";
export type SubscriptionLevel = "quarter" | "half" | "threeQuarter" | "full";
export type PrepaidCardType = "fortyHours";

export interface CardConfig {
  hours: number;
  validityMonths: number;
  label: string;
}

export const SUBSCRIPTION_CONFIG: Record<SubscriptionLevel, CardConfig> = {
  quarter: { hours: 36, validityMonths: 1, label: "1/4 temps - 36h" },
  half: { hours: 72, validityMonths: 1, label: "1/2 temps - 72h" },
  threeQuarter: { hours: 108, validityMonths: 1, label: "3/4 temps - 108h" },
  full: { hours: 9999, validityMonths: 1, label: "Temps plein - illimité" },
};

export const PREPAID_CONFIG: Record<PrepaidCardType, CardConfig> = {
  fortyHours: { hours: 40, validityMonths: 12, label: "Carte 40h (10 × ½ journée)" },
};
