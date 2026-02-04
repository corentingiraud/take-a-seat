import { ADMIN_ROLE_TYPE } from '../../constants';

export default {
  async getStats(ctx) {
    const user = ctx.state.user;

    if (!user || user.role?.type !== ADMIN_ROLE_TYPE) {
      return ctx.unauthorized('Only admins can access stats');
    }

    const { startDate, endDate } = ctx.query as {
      startDate?: string;
      endDate?: string;
    };

    if (!startDate || !endDate) {
      return ctx.badRequest('startDate and endDate query parameters are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return ctx.badRequest('Invalid date format');
    }

    if (start >= end) {
      return ctx.badRequest('startDate must be before endDate');
    }

    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 31) {
      return ctx.badRequest('Date range must not exceed 1 month');
    }

    const stats = await strapi
      .service('api::stat.stat')
      .computeStats(startDate, endDate);

    ctx.body = stats;
  },
};
