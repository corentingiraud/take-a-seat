# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two apps in one repo, deployed as two Docker images:

- `backend/` — Strapi 5 (TypeScript) + Postgres. Owns all business rules.
- `frontend/` — Next.js 16 App Router (React 19). Has its own [CLAUDE.md](frontend/CLAUDE.md) with frontend-specific detail.
- `scripts/` — Postgres init (`init-databases-and-users.sh`) and dev/prod dump & restore helpers.
- `db-dumps/` — local `.dump` files consumed by the restore script.

## Commands

```bash
./launch.sh                       # opens an iTerm2 window with docker + backend + frontend panes

cd backend && docker compose up   # postgres (5432) + mailcatcher (1025 smtp / 1080 web)
cd backend && TZ='UTC' npm run develop   # Strapi on :1337  — TZ=UTC is required, see Dates below
cd frontend && npm run dev        # Next.js on :3000
cd frontend && npm run lint       # ESLint

nvm use 22 && cd backend && node --experimental-strip-types --test 'src/**/*.test.ts'

./scripts/dev/dump-db.sh                       # dump the running container's DB into db-dumps/
./scripts/dev/restore-db.sh --recreate         # restore the latest dump (add -f <file> for a specific one)
```

There is no test framework. A few pure helpers carry a `node --test` self-check next to them
(`backend/src/utils/prepaid-card.test.ts`); `tsconfig.json` excludes `**/*.test.*` from the build.
Everything else is verified by running both servers.

Env files are gitignored; `backend/.env.dev.example` and `.env.prod.example` list the keys.

## Strapi config is committed, not just the code

`strapi-plugin-config-sync` mirrors admin-panel state (user roles, route permissions, content-manager
views, i18n locales) into `backend/config/sync/*.json`. Anything toggled in the Strapi admin UI —
notably granting a role access to a new custom route — only reaches other environments through those files:

```bash
cd backend && npx config-sync export   # after changing permissions/roles in the admin UI
cd backend && npx config-sync import   # after pulling someone else's changes
cd backend && npx config-sync diff
```

Adding a custom route without exporting means it returns 403 everywhere but your machine.

## Domain model

`CoworkingSpace` → `Service` → `Availability`, with `Booking` and `PrepaidCard` hanging off users.

- **Availability** is a date range plus a `weeklyAvailabilities` JSON blob (`{monday: [{start, end}], …}`),
  a seat count, and a `prepaidCardOnly` flag. The backend only ever matches the *date range*; the weekly
  time slots are expanded client-side (`frontend/models/availability.ts`, `hooks/use-calendar.ts`).
- **Unavailability** belongs to a coworking space and blocks slots across all its services.
- Two roles only: `super_admin` and `coworker` (`RoleType` in [role.ts](frontend/models/role.ts),
  `ADMIN_ROLE_TYPE` in [constants/index.ts](backend/src/api/constants/index.ts)).

## Booking creation goes through one endpoint

`POST /bookings/bulk-create` ([booking.ts](backend/src/api/booking/controllers/booking.ts)) is the validated
path — the frontend never POSTs to the core `bookings` route. It checks, in order: target user (only a
super_admin may book for someone else), unavailability overlap, an availability whose date range contains the
slot, `prepaidCardOnly`, seat count vs. non-cancelled overlapping bookings, and prepaid-card ownership,
balance, paid status and validity window (`src/utils/prepaid-card.ts`, shared with the lifecycle). It then
creates every booking in one transaction, debits the card, and sends a user + admin email.
Any new booking rule belongs here, not in a caller.

## Prepaid-card balance is mutated in two places

`remainingBalance` is a stored number, not a derived one. It is debited in `bulkCreate` and adjusted in
[lifecycles.ts](backend/src/api/booking/content-types/booking/lifecycles.ts) — refunded on cancel/delete,
debited when a card is attached to a `PENDING` booking. That lifecycle path is reachable by any coworker
through a plain `PUT /bookings/:id`, so it repeats the ownership, balance and validity checks itself.
Changing the accounting means touching both, or balances drift.

## Authorization pattern

There is no policy layer. Controllers override the core actions and compare
`ctx.state.user.role.type` to `ADMIN_ROLE_TYPE`:

- `booking.findOne` / `update`, `prepaid-card.findOne` — owner-or-admin, else `unauthorized`.
- `prepaid-card.find` — injects `filters.user = user.id` for non-admins before calling `super.find`.
- `coworking-space.calendar` — masks other users down to first name + last initial for non-admins.

New endpoints that expose user-scoped data must repeat this check explicitly.

## Custom routes are ordered by filename

Strapi loads route files alphabetically, so custom routes live in `01-customs.ts` and the core router in
`02-core.ts` (`booking`, `service`, `coworking-space`). A custom path such as `/services/:id/calendar`
registered after the core router is shadowed by the core `:id` handler. Keep the numeric prefixes.

## Dates and timezone

Strapi `date` columns (`validFrom`, `expirationDate`, availability `startDate`/`endDate`) store the literal
`YYYY-MM-DD` prefix of whatever string is sent and read back as raw strings — no timezone conversion.
Compare those lexicographically rather than reaching for date arithmetic, and send date-only strings.
`datetime` columns (booking `startDate`/`endDate`) are real timestamps; the server must run with `TZ=UTC`
(set in `backend/Dockerfile` and `launch.sh`) for them to line up with production.

Moment is imported from `@/lib/moment` on the frontend, which sets the `fr` locale globally.

## hCaptcha

The users-permissions extension ([strapi-server.ts](backend/src/extensions/users-permissions/strapi-server.ts))
injects a verification middleware onto `/auth/local`, `/auth/local/register`, `/auth/forgot-password` and
`/auth/reset-password`, reading an `x-hcaptcha-token` header. The same file also adds `PUT /users/me`.
To disable it locally both sides must agree: `HCAPTCHA_DISABLED=true` (backend) and
`NEXT_PUBLIC_HCAPTCHA_DISABLED=true` (frontend).

## Emails

EJS templates in `backend/emails/`, rendered by `src/utils/render-template.ts`. Nodemailer → mailcatcher in
development, Mailgun in production (`config/env/*/plugins.ts`). A cron in
[cron-tasks.ts](backend/config/cron-tasks.ts) runs every 15 minutes and mails an admin summary of bookings
auto-cancelled for non-payment.

## Frontend runtime env

The image is built once and configured at boot: `next-runtime-env` is used, so read public vars through
`env("NEXT_PUBLIC_…")` in [config/site.ts](frontend/config/site.ts) rather than `process.env`, and keep
`<PublicEnvScript />` in the root layout.

## Deploy

Pushing to `main` triggers [docker-build-push.yml](.github/workflows/docker-build-push.yml): it bumps a
`vX.Y.Z` git tag, builds and pushes `ghcr.io/corentingiraud/take-a-seat:{backend,frontend}-latest`, then
SSHes to the host to flip Caddy into maintenance mode, `docker compose -f docker-compose.prod.yml pull && up -d`,
and flip back.

## Conventions

User-facing copy (UI strings, emails, toasts) is French. Code, identifiers, comments and commit messages
are English.
