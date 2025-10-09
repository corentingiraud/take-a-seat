async function getHours(booking: any) {
  if (!booking?.startDate || !booking?.endDate) return 0;
  return Math.max(
    0,
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60)
  );
}

async function incrementPrepaidCardBalance(booking: any) {
  if (!booking?.prepaidCard?.documentId) return;

  const hours = await getHours(booking);
  if (hours <= 0) return;

  const prepaidCardService = strapi.documents('api::prepaid-card.prepaid-card');

  const existingCard = await prepaidCardService.findOne({
    documentId: booking.prepaidCard.documentId,
  });

  if (existingCard) {
    await prepaidCardService.update({
      documentId: booking.prepaidCard.documentId,
      data: {
        remainingBalance: (existingCard.remainingBalance ?? 0) + hours,
      },
    });

    strapi.log.info(
      `Increment prepaid card '${booking.prepaidCard.name}' balance due to booking update: +${hours}h.`
    );
  }
}

async function decrementPrepaidCardBalance(booking: any) {
  if (!booking?.prepaidCard?.documentId) return;

  const hours = await getHours(booking);
  if (hours <= 0) return;

  const prepaidCardService = strapi.documents('api::prepaid-card.prepaid-card');

  const existingCard = await prepaidCardService.findOne({
    documentId: booking.prepaidCard.documentId,
  });

  if (existingCard) {
    const next = Math.max(0, (existingCard.remainingBalance ?? 0) - hours);
    await prepaidCardService.update({
      documentId: booking.prepaidCard.documentId,
      data: { remainingBalance: next },
    });

    strapi.log.info(
      `Decrement prepaid card '${booking.prepaidCard.name}' balance due to booking using prepaid card: -${hours}h.`
    );
  }
}

function getPrepaidCardIdFromUpdateData(data: any): string | undefined {
  const prepaidCardRel = data?.prepaidCard;
  if (!prepaidCardRel) return undefined;
  if (prepaidCardRel.set && Array.isArray(prepaidCardRel.set)) {
    return prepaidCardRel.set[0]?.id;
  }
  return undefined;
}

export default {
  async beforeUpdate(event: any) {
    const prepaidCardService = strapi.documents('api::prepaid-card.prepaid-card');
    const bookingService = strapi.documents('api::booking.booking');

    const existingBooking = await bookingService.findFirst({
      filters: { id: event.params.where.id },
      populate: ['prepaidCard'],
    });

    const newStatus = event.params.data.bookingStatus;
    const previousStatus = existingBooking?.bookingStatus;

    const isCancelling =
      !!newStatus &&
      newStatus === 'CANCELLED' &&
      previousStatus !== 'CANCELLED';

    if (isCancelling) {
      const hasCard = !!existingBooking?.prepaidCard?.documentId;
      event.params.data.paymentStatus = hasCard ? 'REFUNDED' : 'CANCELLED';

      if (hasCard) {
        await incrementPrepaidCardBalance(existingBooking);
      }
    }

    const addedCardId = getPrepaidCardIdFromUpdateData(event.params.data);
    const nowHasCard = !!addedCardId;

    if (nowHasCard && existingBooking.paymentStatus === 'PENDING') {
      const addedCard = await prepaidCardService.findFirst({
        filters: { id: addedCardId },
      });

      const bookingWithCard = {
        ...existingBooking,
        prepaidCard: addedCard,
      };

      await decrementPrepaidCardBalance(bookingWithCard);
    }
  },

  async beforeDelete(event: any) {
    const bookingService = strapi.documents('api::booking.booking');

    const existingBooking = await bookingService.findFirst({
      filters: { id: event.params.where.id },
      populate: ['prepaidCard'],
    });

    const previousStatus = existingBooking?.bookingStatus;

    const shouldIncrement =
      previousStatus === 'PENDING' || previousStatus === 'CONFIRMED';

    if (!shouldIncrement) return;

    await incrementPrepaidCardBalance(existingBooking);
  },
};
