const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

/** Format a number with French thousands separators (e.g. 1760 -> "1 760"). */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Format an hour count (e.g. 1760 -> "1 760 h"). */
export function formatHours(value: number): string {
  return `${numberFormatter.format(value)} h`;
}
