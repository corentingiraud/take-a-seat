// src/extensions/users-permissions/strapi-server.ts
import type { Context } from "koa";

/* ----------------------------------------------------------
   Shared helpers
---------------------------------------------------------- */

async function sanitizeEntity(entity: object, model, ctx: Context) {
  const schema = strapi.getModel(model);
  return strapi.contentAPI.sanitize.output(entity, schema, {
    auth: ctx.state.auth,
  });
}

async function verifyHCaptcha(token: string | null, ip?: string) {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    strapi.log.error("[hCaptcha] Missing HCAPTCHA_SECRET");
    return { ok: false as const, reason: "misconfigured" };
  }
  if (!token) return { ok: false as const, reason: "missing_token" };

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", String(token));
  if (ip) body.append("remoteip", ip);

  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json() as any;
  const expected = process.env.HCAPTCHA_VERIFY_HOSTNAME;
  const hostnameOk = expected ? data?.hostname === expected : true;

  if (!data?.success || !hostnameOk) {
    strapi.log.warn("[hCaptcha] verification failed", {
      success: data?.success,
      "error-codes": data?.["error-codes"],
      hostname: data?.hostname,
    });
    return { ok: false as const, reason: "failed" };
  }

  return { ok: true as const };
}

/* ----------------------------------------------------------
   Your existing /users/me endpoint
---------------------------------------------------------- */
function updateMeEndpoint(plugin) {
  plugin.controllers.user.updateMe = async (ctx: Context) => {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("You must be logged in to update your profile.");
      }
      const data = ctx.request.body;
      const updatedUser = await strapi
        .documents("plugin::users-permissions.user")
        .update({
          documentId: user.documentId,
          data,
        });

      return ctx.send(
        await sanitizeEntity(
          updatedUser,
          "plugin::users-permissions.user",
          ctx,
        ),
      );
    } catch (err) {
      strapi.log.error("Error updating user:", err);
      return ctx.badRequest("Unable to update user.");
    }
  };

  plugin.routes["content-api"].routes.unshift({
    method: "PUT",
    path: "/users/me",
    handler: "user.updateMe",
    config: { prefix: "" },
  });
}

function injectHCaptchaOnAuth(plugin) {
  const routes = plugin.routes?.["content-api"]?.routes || [];

  const addCaptchaMw = (routePath: string, routeHTTPMethod: "PUT" | "POST") => {
    const r = routes.find(
      (rt) => rt.method === routeHTTPMethod && rt.path === routePath,
    );
    if (!r) {
      strapi.log.warn(`[hCaptcha] route not found: POST ${routePath}`);
      return;
    }

    const captchaMw = async (ctx: Context, next) => {
      try {
        const headers = ctx.request.headers || {};
        const headerToken =
          (headers["x-hcaptcha-token"] as string) ||
          null;

        const result = await verifyHCaptcha(headerToken, ctx.request.ip);
        if (!result.ok) {
          const msg =
            result.reason === "missing_token"
              ? "Captcha token is required"
              : result.reason === "misconfigured"
              ? "Captcha misconfigured"
              : "Captcha verification failed";
          return ctx.badRequest(msg);
        }

        return next();
      } catch (e) {
        strapi.log.error("[hCaptcha] middleware error", e);
        return ctx.badRequest("Captcha verification failed");
      }
    };

    r.config = r.config || {};
    r.config.middlewares = [captchaMw, ...(r.config.middlewares || [])];
    strapi.log.info(`[hCaptcha] enabled on POST ${routePath}`);
  };

  addCaptchaMw("/auth/local", "POST");
  addCaptchaMw("/auth/local/register", "POST");
  addCaptchaMw("/auth/forgot-password", "POST");
  addCaptchaMw("/auth/reset-password", "POST");
}

/* ----------------------------------------------------------
   Export extension
---------------------------------------------------------- */
export default (plugin) => {
  updateMeEndpoint(plugin);
  injectHCaptchaOnAuth(plugin);
  return plugin;
};
