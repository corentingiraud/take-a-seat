export default {
  routes: [
    {
      method: 'POST',
      path: '/bookings/bulk-create',
      handler: 'booking.bulkCreate',
    },
    // Shadows the core GET /bookings (02-core loads after this file) so coworkers can list
    // their own bookings without holding booking.find, which would let them populate every
    // user's bookings from other content types.
    {
      method: 'GET',
      path: '/bookings',
      handler: 'booking.list',
    },
  ],
};
