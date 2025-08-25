import { Context } from "koa"

async function sanitizeEntity(
  entity: object,
  model,
  ctx: Context,
): Promise<unknown> {
  const schema = strapi.getModel(model)
  return strapi.contentAPI.sanitize.output(entity, schema, {
    auth: ctx.state.auth,
  })
}

function updateMeEndpoint(plugin) {
  plugin.controllers.user.updateMe = async (ctx: Context) => {
    try {
      const user = ctx.state.user
      if (!user) {
        return ctx.unauthorized("You must be logged in to update your profile.")
      }
      const data = ctx.request.body
      const updatedUser = await strapi
        .documents("plugin::users-permissions.user")
        .update({
          documentId: user.documentId,
          data,
        })

      return ctx.send(
        await sanitizeEntity(
          updatedUser,
          "plugin::users-permissions.user",
          ctx,
        ),
      )
    } catch (err) {
      strapi.log.error("Error updating user:", err)
      return ctx.badRequest("Unable to update user.")
    }
  }

  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/me",
    handler: "user.updateMe",
    config: {
      prefix: '',
    },
  })
}

export default (plugin) => {
  updateMeEndpoint(plugin)
  return plugin
}
