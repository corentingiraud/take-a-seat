import { factories } from '@strapi/strapi';
import { ADMIN_ROLE_TYPE } from '../../constants';

export default factories.createCoreController(
  'api::coworking-space.coworking-space',
  ({ strapi }) => ({
    async calendar(ctx) {
      const { id } = ctx.params;
      const startDate = ctx.query.startDate as string;
      const endDate = ctx.query.endDate as string;

      if (!startDate || !endDate) {
        return ctx.badRequest('startDate and endDate are required');
      }

      // 1) Check coworking space
      const space = await strapi
        .documents('api::coworking-space.coworking-space')
        .findOne({ documentId: id, populate: ["unavailabilities"] });

      if (!space) {
        return ctx.notFound(`Coworking space with documentId '${id}' not found`);
      }

      // 2) Fetch services linked to this coworking space
      const services = await strapi
        .documents('api::service.service')
        .findMany({
          filters: {
            coworkingSpace: { documentId: id },
          },
          populate: ['availabilities'],
        });

      if (services.length === 0) {
        ctx.body = [];
        return;
      }

      const serviceIds = services.map((s) => s.documentId);

      // 3) Fetch bookings for all services
      const bookings = await strapi
        .documents('api::booking.booking')
        .findMany({
          filters: {
            service: {
              documentId: { $in: serviceIds },
            },
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
            bookingStatus: 'CONFIRMED',
          },
          populate: ['user', 'service'],
        });

      const user = ctx.state.user;
      const isAdmin = user?.role?.type === ADMIN_ROLE_TYPE;

      const maskUser = (u: any) => {
        if (!u) return null;
        if (isAdmin) return u;

        return {
          firstName: u.firstName ?? null,
          lastNameInitial: u.lastName
            ? u.lastName.charAt(0).toUpperCase()
            : null,
        };
      };

      // 4) Group bookings by service
      const grouped = services.map((service) => {
        const serviceBookings = bookings
          .filter((b) => b.service?.documentId === service.documentId)
          .map((b) => ({
            ...b,
            user: maskUser(b.user),
          }));

        return {
          ...service,
          bookings: serviceBookings,
        };
      });



      ctx.body = {
        ...space,
        services: grouped,
      }
    },
  })
);
