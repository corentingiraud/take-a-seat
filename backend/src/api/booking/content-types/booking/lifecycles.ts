async function incrementPrepaidCardBalance(prepaidCard: any) {
  if (!prepaidCard || !prepaidCard.documentId) return;

  const prepaidCardService = strapi.documents('api::prepaid-card.prepaid-card');

  const existingCard = await prepaidCardService.findOne({
    documentId: prepaidCard.documentId,
  });

  if (existingCard) {
    await prepaidCardService.update({
      documentId: prepaidCard.documentId,
      data: {
        remainingBalance: existingCard.remainingBalance + 1,
      },
    });

    strapi.log.info(`Updated prepaidCard ${prepaidCard.documentId}: +1 remaining`);
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

    await incrementPrepaidCardBalance(existingBooking.prepaidCard);
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

    await incrementPrepaidCardBalance(existingBooking.prepaidCard);
  },
};
