export default {
  routes: [{
    method: 'POST',
    path: '/bookings/bulk-create',
    handler: 'booking.bulkCreate',
  }]
};
