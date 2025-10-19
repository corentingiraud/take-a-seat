export enum PaymentMethod {
  EXTERNAL = "EXTERNAL",
  PREPAID_CARD = "PREPAID_CARD",
}

export function paymentMethodToString(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.EXTERNAL:
      return "CB / espèce";
    case PaymentMethod.PREPAID_CARD:
      return "Carte prépayée";
    default:
      return method;
  }
}
