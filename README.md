# Team Task Manager

A full-stack app for managing teams, members and tasks, with session-based authentication.

**Live demo:** _add your Cloud Run URL here after deploying_
**Repository:** https://github.com/Mehransangi/team-task-manager

## Features

- Register / log in securely (Passport.js local strategy, bcrypt, HTTP-only session cookie)
- Create, edit and delete teams; add members by email
- Create, assign, update and delete tasks inside teams (status, priority, due date, assignee)
- Search and filter tasks by text, team, assignee and status (filtering is done by the API)
- Dashboard with team list, task summary, due-soon list and a **due-date reminder shown at login**
- **Role-based access:** only team owners can edit/delete the team or add members; tasks can be edited by the owner, creator or assignee and deleted by the owner or creator
- **Email invites (stubbed):** inviting an unknown email stores a pending invite (logged, no SMTP); it is accepted automatically when that person registers
- Responsive UI (Tailwind CSS)

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express 5, express-validator, helmet, express-rate-limit |
| Auth | Passport.js (local), express-session, connect-pg-simple, bcrypt |
| Database | PostgreSQL (Cloud SQL on GCP; Neon also supported) |
| Hosting | Google Cloud Run (single container serving API + frontend) |

## Project structure

```
backend/
  db/schema.sql          database schema
  scripts/initDb.js      applies the schema (npm run db:init)
  src/
    config/              env, database pool, session, passport
    controllers/         request handlers (auth, teams, tasks)
    middleware/          auth guard, validation, rate limits, errors
    models/              shared SQL (task visibility + permissions, team membership)
    routes/              route definitions
    utils/               sanitising, date and filter helpers
    validators/          express-validator rules
  tests/                 unit tests (node:test)
frontend/
  src/
    components/          reusable UI (TaskCard, TaskModal, TaskFilters, ConfirmDialog, ...)
    context/ hooks/      auth state, data hooks (useTasks, useTaskEditor, ...)
    pages/               Login, Register, Dashboard, Teams, Team details, Tasks
    services/ utils/     API client and helpers
Dockerfile               production image (builds the frontend, serves it from Express)
DEPLOYMENT.md            step-by-step Google Cloud deployment
```

## Run it locally

Requirements: Node.js 20+ and a PostgreSQL database (local, Cloud SQL or Neon).

```bash
# 1. Backend
cd backend
cp .env.example .env          # then fill in DATABASE_URL and SESSION_SECRET
npm install
npm run db:init               # creates the tables
npm run dev                   # http://localhost:8080

# 2. Frontend (second terminal)
cd frontend
cp .env.example .env          # leave VITE_API_URL empty, the dev server proxies /api
npm install
npm run dev                   # http://localhost:5173
```

### Environment variables (backend)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `DATABASE_SSL` | no | `true` (default) for Neon / Cloud SQL public IP, `false` for local Postgres or a Cloud SQL socket |
| `SESSION_SECRET` | production | Long random string used to sign the session cookie |
| `SESSION_STORE` | no | `postgres` (default) or `memory` (local-dev fallback, sessions reset on restart) |
| `CLIENT_URL` | no | Allowed browser origin(s) when the frontend is on another origin (default `http://localhost:5173`) |
| `NODE_ENV` | no | Set to `production` to enable secure cookies and trust proxy |
| `PORT` | no | Defaults to `8080` |

## API

All routes except `/api/auth/register` and `/api/auth/login` require a logged-in session (401 otherwise).

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in (response includes due-date `reminders`) |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/teams` | Teams you belong to (with members) |
| POST | `/api/teams` | Create a team (you become its owner) |
| GET | `/api/teams/:id` | Team details and members |
| PUT | `/api/teams/:id` | Update a team (owner) |
| DELETE | `/api/teams/:id` | Delete a team and its tasks (owner) |
| POST | `/api/teams/:id/members` | Add a member by email, or store a pending invite (owner) |
| GET | `/api/tasks` | List tasks. Query: `team_id`, `assignee_id` (`me`, `unassigned` or a user id), `status`, `priority`, `search` |
| POST | `/api/tasks` | Create a task in one of your teams |
| GET | `/api/tasks/:id` | Task details |
| PUT | `/api/tasks/:id` | Update a task (owner, creator or assignee) |
| DELETE | `/api/tasks/:id` | Delete a task (owner or creator) |
| GET | `/api/health` | Health check |

Each task includes `team_name`, `assignee_name`, `can_edit` and `can_delete`.

## Security practices

- Passwords hashed with bcrypt; login does a constant-work comparison for unknown emails
- Session in PostgreSQL, `httpOnly` cookie, `secure` in production, `sameSite=lax`, session id regenerated on login
- Every non-auth route sits behind the auth middleware; task and team access is checked against team membership on every read and write
- Input validation with express-validator on auth, team and task endpoints, with HTML stripped from text fields; all SQL is parameterised
- `helmet` security headers, rate limiting (stricter on login/register), request body size limit
- Internal error details are never returned to the client
- Secrets live in environment variables / Secret Manager; `.env` files are git-ignored

## Tests

```bash
cd backend && npm test      # sanitising, date validation, task filter builder
cd frontend && npm test     # date/format helpers and form validators
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Cloud Run + Cloud SQL steps.
