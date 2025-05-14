import { factories } from '@strapi/strapi';
import { ADMIN_ROLE_TYPE } from '../../constants';

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  async bulkCreate(ctx) {
    const user = ctx.state.user;
    const prepaidCard = ctx.request.body.prepaidCard;
    const bookings = ctx.request.body.bookings;


    if (!Array.isArray(bookings)) {
      return ctx.badRequest('Body should be an array of bookings');
    }

    try {
      let card;
      if (prepaidCard) {
        card = await strapi.documents('api::prepaid-card.prepaid-card').findOne({
          documentId: prepaidCard,
          populate: ['user']
        });

        if (!card || card.user.id !== user.id) {
          return ctx.badRequest('Invalid prepaid card or not owned by the user');
        }

        if (card.remainingBalance < bookings.length) {
          return ctx.badRequest('Not enough balance on the prepaid card');
        }
      }

      const createdBookings = [];

      for (const booking of bookings) {
        const { startDate, endDate, service } = booking;

        if (!startDate || !endDate || !service) {
          return ctx.badRequest('Missing required fields (startDate, endDate, service)');
        }

        if (new Date(startDate) >= new Date(endDate)) {
          return ctx.badRequest('startDate must be before endDate');
        }

        const existingService = await strapi.documents('api::service.service').findOne({
          documentId: service
        });
        if (!existingService) {
          return ctx.badRequest(`Service with ID ${service} not found`);
        }

        const created = await strapi.service('api::booking.booking').create({
          data: {
            ...booking,
            service: existingService.id,
            user: user.id,
            paymentStatus: card ? 'PAID' : 'PENDING',
            prepaidCard: card ? card.id : null,
          },
        });

        createdBookings.push(created);
      }

      if (card) {
        await strapi.documents('api::prepaid-card.prepaid-card').update({
          documentId: card.documentId,
          data: {
            remainingBalance: card.remainingBalance - bookings.length,
          },
        });
      }

      ctx.body = createdBookings;
    } catch (err) {
      console.error('Bulk create error:', err);
      ctx.badRequest('Failed to create bookings', { error: err.message });
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

  async find(ctx) {
    const user = ctx.state.user;

    if (user?.role?.type !== ADMIN_ROLE_TYPE) {
      const filters = ctx.query?.filters && typeof ctx.query.filters === 'object'
        ? ctx.query.filters
        : {};

      ctx.query = {
        ...ctx.query,
        filters: {
          ...filters,
          user: user.id,
        },
      };
    }

    return await super.find(ctx);
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
