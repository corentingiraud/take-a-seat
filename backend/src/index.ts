import type { Core } from '@strapi/strapi';
import { traverseEntity } from '@strapi/utils';
import { ADMIN_ROLE_TYPE } from './api/constants';

const USER_UID = 'plugin::users-permissions.user';
// Contact and account fields of other users that coworkers must not read.
// username is included because signup sets it to the email.
const PRIVATE_USER_FIELDS = ['email', 'username', 'phone', 'printerCode'];

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Runs at the end of every content-API sanitize.output, so it covers /users,
    // /users/:id and any populate path that reaches a user (bookings.user, …).
    strapi.sanitizers.add('content-api.output', (schema: any) =>
      traverseEntity(
        ({ data, key, schema }, { remove }) => {
          if (schema.uid !== USER_UID || !PRIVATE_USER_FIELDS.includes(key)) return;
          // No viewer means an auth response (login, register…) about the user themself.
          const viewer = strapi.requestContext.get()?.state?.user;
          if (!viewer || viewer.role?.type === ADMIN_ROLE_TYPE || viewer.id === data.id) return;
          remove(key);
        },
        { schema, getModel: strapi.getModel.bind(strapi) },
      ),
    );
  },

  bootstrap() {},
};
