import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::service.service', ({ strapi }) => ({
  async calendar(ctx) {
    const { id } = ctx.params;
    const startDate = ctx.query.startDate as string;
    const endDate = ctx.query.endDate as string;

    if (!startDate || !endDate) {
      return ctx.badRequest('startDate and endDate are required');
    }

    const service = await strapi.documents('api::service.service').findOne({
      documentId: id,
    });

    if (!service) {
      return ctx.notFound(`Service with documentId '${id}' not found`);
    }

    const bookings = await strapi.documents('api::booking.booking').findMany({
      filters: {
        service: {
          documentId: id,
        },
        startDate: {
          $lte: endDate,
        },
        endDate: {
          $gte: startDate,
        },
        bookingStatus: 'CONFIRMED',
      },
      populate: ['user', 'service'],
    });

    ctx.body = bookings;
  },
}));
