import { factories } from '@strapi/strapi';
import { sanitize } from '@strapi/utils';

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  async bulkCreate(ctx) {
    const user = ctx.state.user;
    const bookings = ctx.request.body;

    if (!Array.isArray(bookings)) {
      return ctx.badRequest('Body should be an array of bookings');
    }

    try {
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
          },
        });

        createdBookings.push(created);
      }

      ctx.send(createdBookings);
    } catch (err) {
      console.error('Bulk create error:', err);
      ctx.badRequest('Failed to create bookings', { error: err.message });
    }
  },
}));
