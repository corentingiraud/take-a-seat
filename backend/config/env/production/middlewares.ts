
export default [
  {
    name: 'strapi::cors',
    config: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'x-hcaptcha-token'],
      keepHeaderOnError: true,
    },
  },
]
