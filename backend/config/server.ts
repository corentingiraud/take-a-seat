export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  url: env('API_PUBLIC_URL', 'http://localhost:1337'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
