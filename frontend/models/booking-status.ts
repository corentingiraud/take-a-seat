export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export function getBookingStatusTranslation(bookingStatus: BookingStatus) {
  switch (bookingStatus) {
    case BookingStatus.PENDING:
      return "En cours de validation";
    case BookingStatus.CONFIRMED:
      return "Confirmée";
    case BookingStatus.CANCELLED:
      return "Annulée";
  }
}
