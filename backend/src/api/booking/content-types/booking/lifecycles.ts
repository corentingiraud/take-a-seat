async function incrementPrepaidCardBalance(booking: any) {
  if (!booking?.prepaidCard?.documentId || !booking.startDate || !booking.endDate) return;

  const hours =
    Math.max(
      0,
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60)
    );

  const prepaidCardService = strapi.documents('api::prepaid-card.prepaid-card');

  const existingCard = await prepaidCardService.findOne({
    documentId: booking.prepaidCard.documentId,
  });

  if (existingCard) {
    await prepaidCardService.update({
      documentId: booking.prepaidCard.documentId,
      data: {
        remainingBalance: existingCard.remainingBalance + hours,
      },
    });

    strapi.log.info(`Increment prepaid card '${booking.prepaidCard.name}' balance due to booking update: +${hours}h.`);
  }
}


export default {
  async beforeUpdate(event: any) {
    const newStatus = event.params.data.bookingStatus;

    if (!newStatus) return;

    const bookingService = strapi.documents('api::booking.booking');

    const existingBooking = await bookingService.findFirst({
      filters: {
        id: event.params.where.id,
      },
      populate: ['prepaidCard'],
    });

    const previousStatus = existingBooking?.bookingStatus;

    const shouldIncrement =
      (previousStatus === 'PENDING' && newStatus === 'CANCELLED') ||
      (previousStatus === 'CONFIRMED' && newStatus === 'CANCELLED');

    if (!shouldIncrement) return;

    await incrementPrepaidCardBalance(existingBooking);
  },

  async beforeDelete(event: any) {
    const bookingService = strapi.documents('api::booking.booking');

    const existingBooking = await bookingService.findFirst({
      filters: {
        id: event.params.where.id,
      },
      populate: ['prepaidCard'],
    });

    const previousStatus = existingBooking?.bookingStatus;

    const shouldIncrement =
      previousStatus === 'PENDING' || previousStatus === 'CONFIRMED';

    if (!shouldIncrement) return;

    await incrementPrepaidCardBalance(existingBooking);
  },
};
