import { renderEJSTemplate } from '../src/utils/render-template';

export default {
  // Every 15 minutes
  '*/15 * * * *': async ({ strapi }) => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const cancelledBookings = await strapi.db.query('api::booking.booking').findMany({
      where: {
        bookingStatus: 'CANCELLED',
        paymentStatus: 'CANCELLED',
        updatedAt: { $gte: fifteenMinutesAgo },
      },
      populate: ['user', 'service', 'service.coworkingSpace'],
    });

    if (cancelledBookings.length === 0) return;

    const bookingsPayload = cancelledBookings.map((booking) => ({
      user: {
        firstName: booking.user?.firstName,
        lastName: booking.user?.lastName,
        email: booking.user?.email,
      },
      service: {
        name: booking.service?.name,
      },
      coworkingSpace: {
        name: booking.service?.coworkingSpace?.name,
      },
      startDate: new Date(booking.startDate).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Europe/Paris',
      }),
      endDate: new Date(booking.endDate).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Europe/Paris',
      }),
    }));

    const emailPayload = {
      bookings: bookingsPayload,
      adminUrl: process.env.FRONTEND_URL,
    };

    try {
      await strapi.plugins['email'].services.email.send({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `${cancelledBookings.length} réservation(s) non payée(s) annulée(s)`,
        html: await renderEJSTemplate('admin-booking-cancelled.ejs', emailPayload),
      });

      strapi.log.info(`Sent cancellation summary email for ${cancelledBookings.length} booking(s)`);
    } catch (err) {
      strapi.log.error('Failed to send cancellation summary email:', err);
    }
  },
};
