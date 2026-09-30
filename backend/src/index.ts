import type { Core } from '@strapi/strapi';
import { errors, traverseEntity } from '@strapi/utils';
import { ADMIN_ROLE_TYPE } from './api/constants';
import { assignedRoleRefs } from './utils/user-role-input';

const USER_UID = 'plugin::users-permissions.user';
// Contact and account fields of other users that coworkers must not read.
// username is included because signup sets it to the email.
const PRIVATE_USER_FIELDS = ['email', 'username', 'phone', 'printerCode'];

const ROLE_UID = 'plugin::users-permissions.role';
const COWORKER_ROLE_TYPE = 'coworker';
const STRAPI_SUPER_ADMIN_CODE = 'strapi-super-admin';
const ROLE_WRITES = ['create', 'update', 'clone'];
const TARGET_WRITES = ['update', 'delete', 'clone', 'publish', 'unpublish', 'discardDraft'];

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

    // Admin panel accounts below Strapi super-admin (strapi-editor) may only hand
    // out the coworker role, and may not touch a super_admin account: changing its
    // email or password would hand them that account. Content API calls, lifecycles
    // and cron have no admin auth and pass through. Bulk delete runs one delete per
    // document, so it is covered too.
    strapi.documents.use(async (context, next) => {
      if (context.uid !== USER_UID) return next();
      const state = strapi.requestContext.get()?.state;
      if (state?.auth?.strategy?.name !== 'admin') return next();
      if (state.user?.roles?.some((role) => role.code === STRAPI_SUPER_ADMIN_CODE)) return next();

      // PolicyError is the one ForbiddenError whose message Strapi's authorize
      // middleware lets through; a plain ForbiddenError reaches the UI as "Forbidden".
      const params = context.params as any;
      let target = null;
      if (TARGET_WRITES.includes(context.action)) {
        if (!params.documentId) throw new errors.PolicyError('Action non autorisée.');
        target = await strapi.db.query(USER_UID).findOne({
          where: { documentId: params.documentId },
          populate: { role: { select: ['type'] } },
        });
        if (target?.role?.type === ADMIN_ROLE_TYPE) {
          throw new errors.PolicyError(
            'Seul un super-administrateur Strapi peut modifier ou supprimer un compte super administrateur.',
          );
        }
      }

      if (ROLE_WRITES.includes(context.action)) {
        const refs = assignedRoleRefs(params.data?.role);
        const types = refs
          ? await Promise.all(
              refs.map(async (where) => (await strapi.db.query(ROLE_UID).findOne({ where }))?.type),
            )
          : null;
        // A clone that leaves the role alone copies the source's role.
        if (types && !types.length && context.action === 'clone') types.push(target?.role?.type);
        if (!types || types.some((type) => type !== COWORKER_ROLE_TYPE)) {
          throw new errors.PolicyError('Vous ne pouvez attribuer que le rôle Coworker.');
        }
      }

      return next();
    });
  },

  bootstrap() {},
};
