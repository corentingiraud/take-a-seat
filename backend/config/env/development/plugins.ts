// config/plugins.ts
export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'localhost'),
        port: env.int('SMTP_PORT', 1025),

        // Mailcatcher doesn't use TLS or auth.
        secure: false,
        ignoreTLS: true,
      },
      settings: {
        defaultFrom: env('EMAIL_FROM', 'no-reply@take-a-seat.local'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'no-reply@take-a-seat.local'),
      },
    },
  },
});
