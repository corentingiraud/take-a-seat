import { factories } from '@strapi/strapi';
import { ADMIN_ROLE_TYPE } from '../../constants';

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  async bulkCreate(ctx) {
    const user = ctx.state.user;
    const { prepaidCardDocumentId, serviceDocumentId, bookings } = ctx.request.body;

    if (!Array.isArray(bookings)) {
      return ctx.badRequest('Body should be an array of bookings');
    }

    try {
      const service = await strapi.documents('api::service.service').findOne({
        documentId: serviceDocumentId,
        populate: ['coworkingSpace', 'coworkingSpace.unavailabilities']
      });

      if (!service) {
        return ctx.badRequest(`Service with ID ${serviceDocumentId} not found`);
      }

      let prepaidCard;
      if (prepaidCardDocumentId) {
        prepaidCard = await strapi.documents('api::prepaid-card.prepaid-card').findOne({
          documentId: prepaidCardDocumentId,
          populate: ['user']
        });

        if (!prepaidCard || prepaidCard.user.id !== user.id) {
          return ctx.badRequest('Invalid prepaid card or not owned by the user');
        }

        if (prepaidCard.remainingBalance < bookings.length) {
          return ctx.badRequest('Not enough balance on the prepaid card');
        }
      }

      const bookingsToCreate = [];

      for (const booking of bookings) {
        const { startDate, endDate } = booking;

        if (!startDate || !endDate) {
          return ctx.badRequest('Missing required fields (startDate, endDate, service)');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
          return ctx.badRequest('startDate must be before endDate');
        }

        const coworkingUnavailabilities = service.coworkingSpace.unavailabilities;

        const isUnavailable = coworkingUnavailabilities.some(unavailability => {
          const unStart = new Date(unavailability.startDate);
          const unEnd = new Date(unavailability.endDate);
          return start < unEnd && end > unStart;
        });

        if (isUnavailable) {
          return ctx.badRequest('Slot overlaps with coworking space unavailability');
        }

        const overlappingBookings = await strapi.documents('api::booking.booking').findMany({
          filters: {
            service: {
              documentId: service.documentId
            },
            startDate: { $lte: end },
            endDate: { $gte: start }
          }
        });

        if (overlappingBookings.length >= service.maximumBookingsPerHour) {
          return ctx.badRequest(`Slot exceeds maximum bookings (${service.maximumBookingsPerHour})`);
        }

        bookingsToCreate.push({
          ...booking,
          service: service.id,
          user: user.id,
          paymentStatus: prepaidCard ? 'PAID' : 'PENDING',
          prepaidCard: prepaidCard ? prepaidCard.id : null
        })
      }

      await strapi.db.transaction(async () => {
        for (const booking of bookingsToCreate) {
          console.log(booking);
          await strapi.documents('api::booking.booking').create({
            data: booking
          });
        }

        if (prepaidCard) {
          await strapi.documents('api::prepaid-card.prepaid-card').update({
            documentId: prepaidCard.documentId,
            data: {
              remainingBalance: prepaidCard.remainingBalance - bookings.length
            }
          });
        }
      });

      ctx.body = {
        count: bookings.length,
      };
    } catch (err) {
      console.error('Bulk create error:', JSON.stringify(err));
      return ctx.badRequest('Failed to create bookings', { error: err.message });
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Fetch the booking
    const booking = await strapi.documents('api::booking.booking').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!booking) {
      return ctx.notFound('Booking not found');
    }

    // Check if user is the owner or admin
    const isOwner = booking.user?.id === user?.id;
    const isAdmin = user?.role?.type === ADMIN_ROLE_TYPE;

    // If not allowed, deny
    if (!isOwner && !isAdmin) {
      return ctx.unauthorized('You are not allowed to update this booking');
    }

    // Else proceed with the update
    return await super.update(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    const booking = await strapi.documents('api::booking.booking').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!booking) {
      return ctx.notFound('Booking not found');
    }

    const isOwner = booking.user?.id === user?.id;
    const isAdmin = user?.role?.type === ADMIN_ROLE_TYPE;

    if (!isOwner && !isAdmin) {
      return ctx.unauthorized('You are not allowed to view this booking');
    }

    return booking;
  },
}));
