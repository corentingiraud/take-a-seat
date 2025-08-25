export default ({ env }) => ({
  email: {
    config: {
      provider: 'mailgun',
      providerOptions: {
        key: env('MAILGUN_API_KEY'),
        domain: env('MAILGUN_DOMAIN'),
        url: env('MAILGUN_URL', 'https://api.mailgun.net'),
      },
      settings: {
        defaultFrom: process.env.EMAIL_FROM,
        defaultReplyTo: process.env.ADMIN_NOTIFICATION_EMAIL,
      },
    },
  }
})
