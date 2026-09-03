# Take a seat

Booking application for a coworking space. Coworkers book a seat on one of the space's services within the
hours the space publishes, pay with prepaid cards, and get a confirmation email. Admins manage users, bookings, payments
and prepaid cards, and read usage stats.

Two apps in one repo, shipped as two Docker images:

| Path | What it is |
| --- | --- |
| `backend/` | Strapi 5 (TypeScript) on Postgres. Owns every business rule. |
| `frontend/` | Next.js 16 App Router, React 19, shadcn/ui, Tailwind v4, TanStack Query. |
| `scripts/` | Postgres init script, dev dump/restore helpers, prod backup script. |
| `db-dumps/` | `.dump` files consumed by the restore script. |
| `docker-compose.prod.yml` | Production stack: Postgres + the two images. |
| `.github/workflows/` | Build, push and deploy on every push to `main`. |

## Requirements

- Node 22
- Docker with Compose

## Run it locally

```bash
cp backend/.env.dev.example backend/.env       # dev defaults work as-is

cd backend && docker compose up -d             # Postgres on :5432, mailcatcher on :1025 (SMTP) / :1080 (web UI)
./scripts/dev/restore-db.sh --recreate         # optional: load the dump from db-dumps/ (dev accounts below)

cd backend && npm install && TZ='UTC' npm run develop   # Strapi on :1337
cd frontend && npm install && npm run dev               # Next.js on :3000
```

`TZ='UTC'` is required: booking timestamps are stored as UTC and production runs in UTC.

The frontend needs no env file by default. To override, create `frontend/.env.local`:

| Variable | Default |
| --- | --- |
| `NEXT_PUBLIC_STRAPI_API_URL` | `http://localhost:1337/api` |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | the key hardcoded in `frontend/config/site.ts` |
| `NEXT_PUBLIC_HCAPTCHA_DISABLED` | unset. Set to `true` together with `HCAPTCHA_DISABLED=true` in `backend/.env` to skip the captcha on auth routes. |

Emails sent in development land in mailcatcher at <http://localhost:1080>.

### Dev accounts

Restoring the dump gives you these accounts (password = email):

| Where | Role | Email |
| --- | --- | --- |
| App, <http://localhost:3000> | admin | `Admin1@fake.com` |
| App | coworker | `Coworker1@fake.com` |
| App | coworker | `Coworker2@fake.com` |
| Strapi admin, <http://localhost:1337/admin> | admin | `Admin1@fake.com` |

## Strapi configuration is versioned

Roles, route permissions and content-manager views are mirrored into `backend/config/sync/*.json` by
`strapi-plugin-config-sync`. Anything changed in the Strapi admin UI only reaches other environments through those files:

```bash
cd backend && npx config-sync export   # after changing permissions/roles in the admin UI
cd backend && npx config-sync import   # after pulling someone else's changes
cd backend && npx config-sync diff
```

The confirm-email and reset-password redirect URLs are excluded on purpose and must be set in each environment's admin panel.

## Checks

```bash
cd frontend && npm run lint
cd backend && node --experimental-strip-types --test 'src/**/*.test.ts'
```

There is no test framework. A few pure helpers ship a `node --test` self-check next to them. Everything else is verified
by running both servers.

## Database dumps

```bash
./scripts/dev/dump-db.sh                              # dump the running container's DB into db-dumps/
./scripts/dev/restore-db.sh --recreate                # restore the latest dump
./scripts/dev/restore-db.sh -f db-dumps/<file>.dump --recreate
```

Options for `restore-db.sh`: `-f <file>` picks a dump (default: latest in `db-dumps/`), `-d <name>` picks the database
(default: `DATABASE_NAME` from `backend/.env`), `--recreate` drops and recreates the database first. The
`take-a-seat-database` container must be running.

`scripts/prod/backup-db.sh` is meant to run from cron on the production host.

## Deploy

Pushing to `main` runs [docker-build-push.yml](.github/workflows/docker-build-push.yml): it bumps a `vX.Y.Z` tag, builds
`ghcr.io/corentingiraud/take-a-seat:backend-latest` and `:frontend-latest` for amd64 and arm64, then SSHes to the host to
switch Caddy to the maintenance page, pull and restart the stack, and switch back.

On the host, the stack reads a `.env` next to `docker-compose.prod.yml`. `.env.prod.example` lists the keys.

Manual fallback:

```bash
# maintenance on
cd /etc/caddy && sudo cp Caddyfile.maintenance Caddyfile && sudo systemctl restart caddy

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f

# maintenance off
cd /etc/caddy && sudo cp Caddyfile.prod Caddyfile && sudo systemctl restart caddy
```

## Conventions

- User-facing copy (UI, emails, toasts) is French. Code, identifiers, comments and commit messages are English.
- This repository is public. Never commit production data: no real names, emails, phone numbers or booking history in
  code, fixtures, dumps, issues or PRs.

Architecture notes for contributors live in [CLAUDE.md](CLAUDE.md) and [frontend/CLAUDE.md](frontend/CLAUDE.md).
