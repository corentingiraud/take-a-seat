export default {
  routes: [
    {
      method: 'GET',
      path: '/coworking-spaces/:id/calendar',
      handler: 'coworking-space.calendar',
    },
  ]
};
