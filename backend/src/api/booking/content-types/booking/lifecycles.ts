import { errors } from '@strapi/utils';

import { prepaidCardChange, prepaidCardRejection } from '../../../../utils/prepaid-card';

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

export default {
  async beforeUpdate(event: any) {
    const prepaidCardService = strapi.documents('api::prepaid-card.prepaid-card');
    const bookingService = strapi.documents('api::booking.booking');

    const existingBooking = await bookingService.findFirst({
      filters: { id: event.params.where.id },
      populate: ['prepaidCard', 'user'],
    });

    const newStatus = event.params.data.bookingStatus;
    const previousStatus = existingBooking?.bookingStatus;

    const isCancelling =
      !!newStatus &&
      newStatus === 'CANCELLED' &&
      previousStatus !== 'CANCELLED';

    const addedCardId = prepaidCardChange(event.params.data.prepaidCard);
    const currentCardId = existingBooking?.prepaidCard?.id ?? null;
    const cardChanges = addedCardId !== undefined && addedCardId !== currentCardId;

    // Hours were debited from that card, and only it gets them back on cancel.
    if (cardChanges && currentCardId && existingBooking.paymentStatus === 'PAID') {
      throw new errors.ApplicationError(
        'The prepaid card of a paid booking cannot be changed, cancel the booking instead'
      );
    }

    if (cardChanges && addedCardId !== null) {
      if (isCancelling || existingBooking.paymentStatus !== 'PENDING') {
        throw new errors.ApplicationError('A prepaid card can only pay a pending booking');
      }

      const addedCard = await prepaidCardService.findFirst({
        filters: { id: addedCardId },
        populate: ['user'],
      });

      // This runs on a plain PUT /api/bookings/:id, which any coworker may issue.
      // Everything below is a trust boundary: without it the card id in the payload
      // is enough to drain someone else's card. Ownership is checked card-owner vs
      // booking-owner, not vs the actor, so an admin paying a member's bookings with
      // that member's card still works (the actor is authorised in the controller).
      const hours = await getHours(existingBooking);
      const rejection = !addedCard
        ? 'Prepaid card not found'
        : addedCard.user?.id !== existingBooking.user?.id
          ? 'Prepaid card is not owned by the booking user'
          : (addedCard.remainingBalance ?? 0) < hours
            ? 'Not enough balance on the prepaid card'
            : prepaidCardRejection(addedCard, [existingBooking.startDate]);

      if (rejection) {
        throw new errors.ApplicationError(rejection);
      }

      const bookingWithCard = {
        ...existingBooking,
        prepaidCard: addedCard,
      };

      await decrementPrepaidCardBalance(bookingWithCard);
      event.params.data.paymentStatus = 'PAID';
    }

    if (isCancelling) {
      const hasCard = !!existingBooking?.prepaidCard?.documentId;
      event.params.data.paymentStatus = hasCard ? 'REFUNDED' : 'CANCELLED';

      if (hasCard) {
        await incrementPrepaidCardBalance(existingBooking);
      }
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
