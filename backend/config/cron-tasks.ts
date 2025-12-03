export default {
  seedUsers: {
    task: async ({ strapi }) => {
      strapi.log.info("🔄 [seedUsers] Cron started…");

      const ROLE_COWORKER_ID = 4;

      const USERS = [
        {firstName: 'Stephanie', lastName: 'Pollet', email: 'contact@lamaisonduvillage.fr'},
        {firstName: 'Dorian', lastName: 'Degoutte', email: 'doriandegoutte@hotmail.fr'},
        {firstName: 'Clémentine', lastName: 'Whelan', email: 'clementine.whelan39@gmail.com'},
        {firstName: 'Noa', lastName: 'Goby', email: 'noa.goby@hotmail.fr'},
        {firstName: 'Cloé', lastName: 'Mathieu', email: 'cloemat2@gmail.com'},
        {firstName: 'Jeanne', lastName: 'Laurent', email: 'j.laurent@axelo.fr'},
        {firstName: 'Maëlle', lastName: 'Bertrand', email: 'latelierma@gmail.com'},
        {firstName: 'Charles-Emmanuel', lastName: 'Kuhne', email: 'charleskuhne@gmail.com'},
        {firstName: 'Paul', lastName: 'Brann', email: 'paul_brann@hotmail.com'},
        {firstName: 'Valérie', lastName: 'Goldstein', email: 'goldstein.valerie@orange.fr'},
        {firstName: 'Jérôme', lastName: 'Buisine', email: 'jerome.buisine@outlook.fr'},
        {firstName: 'Steve', lastName: 'Boudin', email: 'bib@bibarr.fr'},
        {firstName: 'Caroline', lastName: 'Bagland', email: 'caroline.bagland@outlook.fr'},
        {firstName: 'Tommy', lastName: 'Dujardin', email: 'dujardin.tommy@gmail.com'},
        {firstName: 'Inès', lastName: 'Vidal-Bochet', email: 'contact.ivbarchi@gmail.com'},
        {firstName: 'Florian', lastName: 'Vallet', email: 'activhandi@outlook.fr'},
        {firstName: 'Corentin', lastName: 'Giraud', email: 'corentin@giraud.dev'},
        {firstName: 'Valentine', lastName: 'Laflèche', email: 'lafleche.valentine@gmail.com'},
        {firstName: 'Cathy', lastName: 'Neyrinck', email: 'cathyneyrinck@gmail.com'},
        {firstName: 'Arthur', lastName: 'Talpaert', email: 'arthur@symbiome.eu'},
        {firstName: 'Vincent', lastName: 'Roubeau', email: 'vincentroubeau@posteo.net'},
        {firstName: 'Albert', lastName: 'Santiago', email: 'asantiago.contact@gmail.com'},
        {firstName: 'Emilie', lastName: 'Enjalbert', email: 'e.enjalbert@hrconseilcie.fr'},
        {firstName: 'Valentin', lastName: 'Brune', email: 'v.brune@hrconseilcie.fr'},
        {firstName: 'Tiphaine', lastName: 'Pellé', email: 'tiphaine.pelle@gmail.com'},
        {firstName: 'Raphael', lastName: 'Marcantoni', email: 'raphael.marcantoni@gmail.com'},
        {firstName: 'Steve', lastName: 'Chirol', email: 'steve.chirol@gmail.com'},
        {firstName: 'Serge', lastName: 'Durand', email: 'serge.durand@gmail.com'},
        {firstName: 'Diego', lastName: 'Buffet Aguilar', email: 'diego.buffet.aguilar07@gmail.com'},
        {firstName: 'Charly', lastName: 'Sistac', email: 'charly_sistac@hotmail.fr'},
      ];

      for (const u of USERS) {
        strapi.log.info(`👉 Checking user: ${u.email}`);

        const existing = await strapi.entityService.findMany(
          "plugin::users-permissions.user",
          {
            filters: { email: u.email },
            limit: 1,
          }
        );

        if (existing.length > 0) {
          strapi.log.info(`⏭️ Skip: ${u.email} already exists`);
          continue;
        }

        strapi.log.info(`🆕 Creating user: ${u.email}`);

        await strapi.entityService.create("plugin::users-permissions.user", {
          data: {
            username: u.email,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            provider: "local",
            password: randomPassword(),
            confirmed: true,
            blocked: false,
            role: {
              connect: [ROLE_COWORKER_ID],
            },
          },
        });

        strapi.log.info(`✅ Created: ${u.email}`);
      }

      strapi.log.info("🎉 [seedUsers] All done.");
    },

    // Exécution unique 10s après le démarrage
    options: new Date(Date.now() + 10_000),
  },
};

function randomPassword() {
  return Math.random().toString(36).slice(-12);
}
