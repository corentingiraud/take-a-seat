import { factories } from '@strapi/strapi';
import { ADMIN_ROLE_TYPE } from '../../constants';
import { renderEJSTemplate } from '../../../utils/render-template';
import { prepaidCardRejection } from '../../../utils/prepaid-card';

const sameInstant = (a: unknown, b: unknown) =>
  new Date(a as string).getTime() === new Date(b as string).getTime();

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  async bulkCreate(ctx) {
    const actorUser = ctx.state.user; // user authentifié (admin ou non)
    const isSuperAdmin = actorUser?.role?.type === ADMIN_ROLE_TYPE;
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

      const requiredHours = (bookings.length * service.bookingDuration) / 60;

      // Every check runs inside the transaction that writes, so two requests racing on the
      // same slot (a double click) cannot both pass the seat and duplicate checks.
      const result = await strapi.db.transaction(async ({ trx }) => {
        // ponytail: one advisory lock per service serializes its bulk-creates. Ceiling: a
        // single queue per service, fine at a few bookings a minute.
        await trx.raw("SELECT pg_advisory_xact_lock(?)", [service.id]);

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
          // Row lock before reading the balance: the same card can be spent on another
          // service at the same time, which the service lock does not cover.
          await strapi
            .db
            .queryBuilder("api::prepaid-card.prepaid-card")
            .select("id")
            .where({ documentId: prepaidCardDocumentId })
            .forUpdate()
            .first()
            .execute();

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
            return { rejection: "Invalid prepaid card or not owned by the user" };
          }

          if (prepaidCard.remainingBalance < requiredHours) {
            return { rejection: "Not enough balance on the prepaid card" };
          }

          const rejection = prepaidCardRejection(
            prepaidCard,
            bookings.map((booking) => booking.startDate),
          );

          if (rejection) {
            return { rejection };
          }
        }

        const bookingsToCreate = [];

        for (const booking of bookings) {
          const { startDate, endDate } = booking;

          if (!startDate || !endDate) {
            return { rejection: "Missing required fields (startDate, endDate)" };
          }

          const start = new Date(startDate);
          const end = new Date(endDate);
          if (start >= end) {
            return { rejection: "startDate must be before endDate" };
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
            return { rejection: "Slot overlaps with coworking space unavailability" };
          }

          const matchedAvailability = futureAvailabilities.find((av) => {
            const avStart = new Date(av.startDate);
            const avEnd = new Date(av.endDate);
            avEnd.setHours(23, 59, 59, 999);
            return start >= avStart && end <= avEnd;
          });

          if (!matchedAvailability) {
            return { rejection: "No availability found for the selected time slot" };
          }

          // ponytail: matchedAvailability is resolved on the date range only, so a
          // prepaidCardOnly availability must not overlap an open one on the same service.
          if (matchedAvailability.prepaidCardOnly && !prepaidCard && !isSuperAdmin) {
            return { rejection: "Slot is restricted to prepaid card holders" };
          }

          const overlappingBookings = await strapi
            .db
            .query("api::booking.booking")
            .findMany({
              where: {
                service: service.id,
                startDate: { $lt: end },
                endDate: { $gt: start },
                bookingStatus: { $ne: "CANCELLED" },
              },
              populate: { user: { select: ["id"] } },
            });

          // A user holds at most one seat of a service per slot, including within this batch.
          const alreadyBooked =
            overlappingBookings.some((b) => b.user?.id === targetUser.id) ||
            bookingsToCreate.some(
              (b) => new Date(b.startDate) < end && new Date(b.endDate) > start,
            );

          if (alreadyBooked) {
            return { rejection: "Slot already booked by this user" };
          }

          if (
            overlappingBookings.length >=
            matchedAvailability.numberOfSeats
          ) {
            return {
              rejection: `Slot exceeds available seats (${matchedAvailability.numberOfSeats})`,
            };
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
                  prepaidCard.remainingBalance - requiredHours,
              },
            });
        }

        return { prepaidCard, bookingsToCreate };
      });

      if ("rejection" in result) {
        return ctx.badRequest(result.rejection);
      }

      const { prepaidCard, bookingsToCreate } = result;

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
          ? prepaidCard.remainingBalance - requiredHours
          : null,
        adminUrl: process.env.FRONTEND_URL,
        accountUrl: process.env.FRONTEND_URL,
        createdBy: actorUser.email,
      };

      // The bookings are committed: a mail failure must not answer 400 and invite a retry.
      try {
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
        strapi.log.error(`Booking emails failed: ${err.message}`);
      }
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
      populate: ['user', 'service'],
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

    // An owner may cancel or pay a booking, nothing else: reopening a cancelled one or moving
    // it to another slot or service would skip every check bulkCreate makes. The frontend
    // resends every field, so compare with the stored values rather than test presence.
    const data = ctx.request.body?.data ?? {};
    const changed = (field: string, current: unknown) =>
      data[field] !== undefined && data[field] !== current;

    if (
      !isAdmin &&
      (changed('service', booking.service?.documentId) ||
        changed('user', booking.user?.documentId) ||
        (data.startDate !== undefined && !sameInstant(data.startDate, booking.startDate)) ||
        (data.endDate !== undefined && !sameInstant(data.endDate, booking.endDate)) ||
        (changed('bookingStatus', booking.bookingStatus) && data.bookingStatus !== 'CANCELLED'))
    ) {
      return ctx.badRequest('Only cancelling or paying a booking is allowed');
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
