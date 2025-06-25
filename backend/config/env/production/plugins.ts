export default ({ env }) => ({
  email: {
    config: {
      provider: 'mailgun',
      providerOptions: {
        key: env('MAILGUN_API_KEY'),
        domain: env('MAILGUN_DOMAIN'),
        url: env('MAILGUN_URL', 'https://api.mailgun.net'), //Optional. If domain region is Europe use 'https://api.eu.mailgun.net'
      },
      settings: {
        defaultFrom: "no-reply@take-a-seat.giraud.dev",
        defaultFromName: "Le Pêle Coworking",
        defaultTo: "corentin@giraud.dev",
        defaultToName: "Corentin Giraud",
      },
    },
  }
})
