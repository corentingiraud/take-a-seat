export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export function getPaymentStatusLabel(s: keyof typeof PaymentStatus) {
  switch (s) {
    case PaymentStatus.PENDING:
      return "A payer";
    case PaymentStatus.PAID:
      return "Payé";
    default:
      return "Unknown";
  }
}
