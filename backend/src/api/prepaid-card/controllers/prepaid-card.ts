import { factories } from '@strapi/strapi';
import { ADMIN_ROLE_TYPE } from '../../constants';

export default factories.createCoreController('api::prepaid-card.prepaid-card', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    if (user?.role?.type !== ADMIN_ROLE_TYPE) {
      const filters = ctx.query?.filters && typeof ctx.query.filters === 'object'
        ? ctx.query.filters
        : {};

      ctx.query = {
        ...ctx.query,
        filters: {
          ...filters,
          user: user.id,
        },
      };
    }

    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    const card = await strapi.documents('api::prepaid-card.prepaid-card').findOne({
      documentId: id,
      populate: ['user'],
    });

    if (!card) {
      return ctx.notFound('Prepaid card not found');
    }

    const isOwner = card.user?.id === user?.id;
    const isAdmin = user?.role?.type === ADMIN_ROLE_TYPE;

    if (!isOwner && !isAdmin) {
      return ctx.unauthorized('You are not allowed to view this prepaid card');
    }

    return card;
  },
}));
