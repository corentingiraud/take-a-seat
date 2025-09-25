export const UNDEFINED_ID = -1;
export const UNDEFINED_DOCUMENT_ID = "undefined";

export type SubscriptionType = "quarter" | "half" | "threeQuarter" | "full";

export const HOURS_PER_TYPE: Record<SubscriptionType, number> = {
  quarter: 36,
  half: 72,
  threeQuarter: 108,
  full: 9999,
};
