import { factories } from '@strapi/strapi';
import { ADMIN_ROLE_TYPE } from '../../constants';
import { renderEJSTemplate } from '../../../utils/render-template';

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  async bulkCreate(ctx) {
    const actorUser = ctx.state.user; // user authentifié (admin ou non)
    const {
      prepaidCardDocumentId,
      serviceDocumentId,
      bookings,
      userDocumentId,
    } = ctx.request.body;

    if (!Array.isArray(bookings)) {
      return ctx.badRequest("Body should be an array of bookings");
    }

    // Récupérer le user "cible"
    let targetUser = actorUser;

    if (userDocumentId && userDocumentId !== actorUser.documentId) {

      const isSuperAdmin = actorUser?.role?.type === ADMIN_ROLE_TYPE;


      if (!isSuperAdmin) {
        return ctx.forbidden(
          "You are not allowed to create bookings for another user",
        );
      }

      targetUser = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: userDocumentId,
        });

      if (!targetUser) {
        return ctx.badRequest(
          `User with documentId ${userDocumentId} not found`,
        );
      }
    }

    try {
      const service = await strapi
        .documents("api::service.service")
        .findOne({
          documentId: serviceDocumentId,
          populate: ["coworkingSpace", "coworkingSpace.unavailabilities"],
        });

      if (!service) {
        return ctx.badRequest(
          `Service with ID ${serviceDocumentId} not found`,
        );
      }

      const futureAvailabilities = await strapi
        .db
        .query("api::availability.availability")
        .findMany({
          where: {
            service: service.id,
          },
        });

      let prepaidCard = null;

      if (prepaidCardDocumentId) {
        prepaidCard = await strapi
          .documents("api::prepaid-card.prepaid-card")
          .findOne({
            documentId: prepaidCardDocumentId,
            populate: ["user"],
          });

        if (
          !prepaidCard ||
          prepaidCard.user.id !== targetUser.id
        ) {
          return ctx.badRequest(
            "Invalid prepaid card or not owned by the user",
          );
        }

        if (prepaidCard.remainingBalance < bookings.length) {
          return ctx.badRequest("Not enough balance on the prepaid card");
        }
      }

      const bookingsToCreate = [];

      for (const booking of bookings) {
        const { startDate, endDate } = booking;

        if (!startDate || !endDate) {
          return ctx.badRequest(
            "Missing required fields (startDate, endDate)",
          );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
          return ctx.badRequest("startDate must be before endDate");
        }

        const isUnavailable =
          service.coworkingSpace.unavailabilities.some(
            (unavailability) => {
              const unStart = new Date(unavailability.startDate);
              const unEnd = new Date(unavailability.endDate);

              return start < unEnd && end > unStart;
            },
          );

        if (isUnavailable) {
          return ctx.badRequest(
            "Slot overlaps with coworking space unavailability",
          );
        }

        const matchedAvailability = futureAvailabilities.find((av) => {
          const avStart = new Date(av.startDate);
          const avEnd = new Date(av.endDate);
          avEnd.setHours(23, 59, 59, 999);
          return start >= avStart && end <= avEnd;
        });

        if (!matchedAvailability) {
          return ctx.badRequest(
            "No availability found for the selected time slot",
          );
        }

        const overlappingBookings = await strapi
          .db
          .query("api::booking.booking")
          .findMany({
            where: {
              service: service.id,
              startDate: { $lt: end },
              endDate: { $gt: start },
            },
          });

        if (
          overlappingBookings.length >=
          matchedAvailability.numberOfSeats
        ) {
          return ctx.badRequest(
            `Slot exceeds available seats (${matchedAvailability.numberOfSeats})`,
          );
        }

        bookingsToCreate.push({
          ...booking,
          bookingStatus: "CONFIRMED",
          service: service.documentId,
          user: targetUser.documentId,
          paymentStatus: prepaidCard ? "PAID" : "PENDING",
          prepaidCard: prepaidCard ? prepaidCard.documentId : null,
        });
      }

      await strapi.db.transaction(async () => {
        for (const booking of bookingsToCreate) {
          await strapi
            .documents("api::booking.booking")
            .create({ data: booking });
        }

        if (prepaidCard) {
          await strapi
            .documents("api::prepaid-card.prepaid-card")
            .update({
              documentId: prepaidCard.documentId,
              data: {
                remainingBalance:
                  prepaidCard.remainingBalance -
                  (bookings.length * service.bookingDuration) / 60,
              },
            });
        }
      });

      ctx.body = { count: bookings.length };

      const emailPayload = {
        user: targetUser,
        service: {
          name: service.name,
        },
        coworkingSpace: {
          name: service.coworkingSpace.name,
        },
        bookings: bookingsToCreate.map((b) => ({
          startDate: new Date(b.startDate).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Europe/Paris",
          }),
          endDate: new Date(b.endDate).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "Europe/Paris",
          }),
        })),
        paymentStatus: prepaidCard ? "PAYÉ" : "EN ATTENTE",
        prepaidCardUsed: !!prepaidCard,
        remainingBalance: prepaidCard
          ? prepaidCard.remainingBalance - bookings.length
          : null,
        adminUrl: process.env.FRONTEND_URL,
        accountUrl: process.env.FRONTEND_URL,
        createdBy: actorUser.email,
      };

      await strapi.plugins["email"].services.email.send({
        to: targetUser.email,
        subject: "Confirmation de vos réservations – Le Pêle Coworking",
        html: await renderEJSTemplate(
          "user-booking-summary.ejs",
          emailPayload,
        ),
      });

      await strapi.plugins["email"].services.email.send({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Nouvelle réservation de ${targetUser.email} (créée par ${actorUser.email})`,
        html: await renderEJSTemplate(
          "admin-booking-summary.ejs",
          emailPayload,
        ),
      });
    } catch (err) {
      console.error(err);
      return ctx.badRequest("Failed to create bookings", {
        error: err.message,
      });
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Fetch the booking
    const booking = await strapi.documents('api::booking.booking').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!booking) {
      return ctx.notFound('Booking not found');
    }

    // Check if user is the owner or admin
    const isOwner = booking.user?.id === user?.id;
    const isAdmin = user?.role?.type === ADMIN_ROLE_TYPE;

    // If not allowed, deny
    if (!isOwner && !isAdmin) {
      return ctx.unauthorized('You are not allowed to update this booking');
    }

    // Else proceed with the update
    return await super.update(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    const booking = await strapi.documents('api::booking.booking').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!booking) {
      return ctx.notFound('Booking not found');
    }

    const isOwner = booking.user?.id === user?.id;
    const isAdmin = user?.role?.type === ADMIN_ROLE_TYPE;

    if (!isOwner && !isAdmin) {
      return ctx.unauthorized('You are not allowed to view this booking');
    }

    return booking;
  },
}));
