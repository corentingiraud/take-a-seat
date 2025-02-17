export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export function getPaymentStatusTranslation(paymentStatus: PaymentStatus) {
  switch (paymentStatus) {
    case PaymentStatus.PENDING:
      return "A payer";
    case PaymentStatus.PAID:
      return "Payée";
  }
}
