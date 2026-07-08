# Parole Visit Portal

An internal police department application for scheduling and verifying parole
compliance visits. Officers record GPS location + a photo when visiting a
parolee; the backend checks the officer's location against the offender's
registered address and flags mismatches for supervisor review. Includes a
granular, frontend-manageable role/permission system, criminal record & risk
classification, and seized-item (weapons/substances) inventory tracking.

See [`.cursor/plans`](.) history for the original design plan and rationale
(data model normalization notes, permission catalog, etc.) if available in
your workspace.

## Stack

- **Backend**: Django 5 + Django REST Framework, `djangorestframework-simplejwt`
  (JWT auth), `django-simple-history` (audit trail), `django-filter`.
- **Frontend**: React 19 + TypeScript (Vite), Tailwind CSS v4, TanStack Query,
  React Router, Leaflet/OpenStreetMap for the location picker.
- **Database**: PostgreSQL in Docker; SQLite by default for local (non-Docker)
  development.

## Repository layout

```
backend/            Django project
  config/            settings, urls
  apps/
    core/            shared base model, haversine geo util, permission plumbing
    accounts/        custom User, Role, Permission (RBAC), JWT auth endpoints
    geography/        District, PoliceStation
    offenders/        Offender registry
    criminal_records/ Crime history + risk_level signal, InventoryItem (evidence)
    visits/           VisitSchedule, VisitRecord + geofence verification
frontend/           React app (Vite)
  src/
    api/             axios client + per-resource request functions
    context/hooks/   auth context, usePermissions, useAuth
    components/      shared UI kit, layout, route guards
    features/        auth, dashboard, offenders, roles, visits
docker-compose.yml   Postgres + backend + frontend, for a consistent full stack
```

## Getting started (local, no Docker)

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # or `source venv/bin/activate` on macOS/Linux
pip install -r requirements-dev.txt
copy .env.example .env       # already uses SQLite by default for local dev
python manage.py makemigrations
python manage.py migrate
python manage.py seed_rbac        # permission catalog + Admin/Supervisor/Officer roles
python manage.py seed_geography   # sample districts/stations
python manage.py createsuperuser
python manage.py runserver
```

Frontend (separate terminal):

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Visit `http://localhost:5173`. Log in with the superuser you created, or
create additional users/roles from the "Roles & Access" screen once logged in
as an Admin (assign the seeded `Admin` role to your own user via the Django
admin at `/admin/` the first time, since a fresh superuser has no roles/role
permissions - superusers bypass permission checks entirely, but non-superuser
staff need an assigned role to see anything beyond login).

## Getting started (Docker Compose)

```bash
docker compose up --build
```

This starts Postgres, runs migrations, seeds RBAC + sample geography data, and
starts both the backend (`:8000`) and frontend (`:5173`). Create a superuser
with:

```bash
docker compose exec backend python manage.py createsuperuser
```

## A note on the local Windows environment used to build this

On the machine this was built on, `manage.py makemigrations` (with
`DATABASE_URL` pointed at Postgres on `localhost:5432`) hung indefinitely
with no error, even though `manage.py check` and `pytest` (non-DB tests)
returned instantly. This is almost certainly because newer Django versions
have the migration loader check applied-migration state against the
configured database even for `makemigrations`, and something on that host
(likely endpoint security/firewall software) was silently dropping the
outbound TCP connection instead of failing fast, rather than any bug in this
project's code. Two mitigations are baked in:

- **Local dev defaults to SQLite** (`backend/.env`) so there is no Postgres
  dependency at all when running outside Docker.
- **Docker Compose still uses Postgres** via its own `DATABASE_URL` env var
  (which takes precedence over `.env`), so the "real" dev/prod path is
  unaffected.

If you hit a similar hang against a real Postgres instance, check
firewall/EDR rules for outbound connections from your Python interpreter, or
run everything inside Docker instead.

## Testing

Backend (pytest + pytest-django, included in `requirements-dev.txt`):

```bash
cd backend
pytest
```

Covers: haversine distance math, permission/role checks, risk-level
recalculation signal, visit geofence verified/flagged logic, and schedule
auto-completion.

Frontend: no test runner is wired up yet (kept the surface area lean for the
first pass) - `vitest` + `@testing-library/react` are the natural next
addition (`npm install -D vitest @testing-library/react jsdom`).

## Key design decisions / deviations worth knowing about

- **Authorization**: a flat, seeded `Permission` catalog (e.g. `offender.create`,
  `visit.review`) grouped by category, with `Role`s as a many-to-many bundle
  of permissions and `User`s holding one or more roles. `GET /api/permissions/`
  returns the catalog grouped by category specifically so the frontend can
  render a checkbox matrix without any hardcoded knowledge of what
  permissions exist.
- **Geofencing**: "flag, don't block" - a visit report always saves; if the
  officer's GPS is further than `VISIT_GEOFENCE_RADIUS_METERS` (default 150m)
  from the offender's registered lat/lng, `location_status` is set to
  `flagged` instead of `verified`, and it shows up in the dashboard's review
  queue.
- **Risk level**: `Offender.risk_level` is a cached column recalculated by a
  signal whenever a `Crime` record is added/removed (thresholds in
  `settings.RISK_LEVEL_LOW_MAX_CRIMES` / `RISK_LEVEL_MEDIUM_MAX_CRIMES`), so
  offender lists can filter/sort by risk without an expensive per-request
  aggregation.
- **Face matching**: intentionally **not implemented**. The visit-record photo
  is still captured today so a future matching service (self-hosted,
  recommended, to keep biometric data in-house) can be added without
  reworking the data model.
- **JWT storage**: for simplicity, access/refresh tokens are stored in
  `localStorage` rather than an httpOnly cookie. This is a reasonable MVP
  trade-off but is worth hardening (httpOnly cookie + CSRF token flow) before
  any real production deployment, given the sensitivity of this data.
- **UI kit**: hand-rolled a small Tailwind component set (`Button`, `Input`,
  `Card`, `Badge`, `Modal`, etc.) instead of pulling in shadcn/ui's CLI, to
  avoid an extra network-dependent setup step. Swapping to shadcn/ui later is
  straightforward since the components share similar prop shapes.

## Default seeded roles

| Role | Permissions |
|---|---|
| Admin | everything |
| Supervisor | view offenders/crimes/inventory, schedule + review visits, view users/roles/geography/dashboard |
| Officer | view offenders/crimes/inventory, submit visit reports |

Edit these anytime from **Roles & Access** once logged in as an Admin.
