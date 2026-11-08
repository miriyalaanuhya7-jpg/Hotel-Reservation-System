# Aura Stays Hotel Reservation Management System

Aura Stays is a full-stack hotel operations dashboard with a React frontend, typed server procedures, Drizzle ORM, and MySQL. The included local setup runs MySQL in Docker and points the website at that local database.

## Local MySQL setup

### Prerequisites

Install Node.js 22+, pnpm, and Docker Desktop or Docker Engine with Compose.

### 1. Start MySQL

From the project root:

```bash
docker compose up -d mysql
```

This creates a local database named `hotel_reservations` and a local application user named `hotel_app`.

### 2. Configure the app

```bash
cp local.env.template .env
```

The default `local.env.template` connection is:

```text
DATABASE_URL=mysql://hotel_app:hotel_password@127.0.0.1:3306/hotel_reservations
```

Change the values in `.env` if your local MySQL credentials or port are different. Never commit `.env`.

### 3. Install dependencies and create tables

```bash
pnpm install
pnpm db:push
```

`pnpm db:push` generates the Drizzle migration from `drizzle/schema.ts` and applies it to the MySQL database configured by `DATABASE_URL`.

### 4. Run the website

```bash
pnpm dev
```

Open `http://localhost:3000`. The dashboard will now read and write against your local MySQL database. If the database is unavailable, the UI intentionally falls back to demo data so the interface remains usable.

## Useful commands

| Command                      | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `docker compose up -d mysql` | Start local MySQL                           |
| `docker compose down`        | Stop the database container                 |
| `docker compose down -v`     | Stop MySQL and delete its local data volume |
| `pnpm db:push`               | Generate and apply the current schema       |
| `pnpm dev`                   | Start the website locally                   |
| `pnpm check`                 | Run TypeScript checks                       |
| `pnpm test`                  | Run the unit test suite                     |
| `pnpm build`                 | Compile production bundle                   |

## Project Structure

The codebase is organized into dedicated `frontend` and `backend` modules:

```text
hotel-reservation-management/
├── frontend/                 # Client application (React + Vite + Tailwind/CSS)
│   ├── index.html            # Main HTML document & metadata
│   ├── public/               # Public static assets & favicon
│   └── src/                  # React source code
│       ├── components/       # UI & dashboard sections (Overview, Rooms, Reservations, Guests, Reports)
│       ├── pages/            # View pages (Home, NotFound)
│       ├── types/            # TypeScript interfaces & domain models
│       ├── lib/              # Client utilities & tRPC React query hooks
│       └── index.css         # Custom design tokens, animations, and styles
├── backend/                  # Server application (Node.js + Express + tRPC)
│   ├── _core/                # Express server entrypoint, Vite dev runner, auth & context
│   ├── __tests__/            # Backend unit tests (vitest)
│   ├── db.ts                 # Database queries, fallbacks, and reservation logic
│   ├── routers.ts            # Typed tRPC procedures and endpoints
│   ├── seed.ts               # Database seeder script
│   └── storage.ts            # Storage abstractions
├── drizzle/                  # Drizzle ORM schema & MySQL table migrations
├── flask_backend/            # Optional standalone Python Flask API
├── docker-compose.yml        # Local MySQL 8 container configuration
├── package.json              # Unified build and development scripts
├── tsconfig.json             # Root TypeScript path mappings (@ -> frontend/src)
└── vite.config.ts            # Vite bundler configuration
```

## Optional standalone Flask API

The `flask_backend/` directory contains a companion Flask + MySQL API. To run it separately, activate a Python virtual environment, install `flask_backend/requirements.txt`, set the `MYSQL_*` variables from `.env.example`, and run `python flask_backend/app.py`. The main website uses the integrated server procedures so it can run as one local process.

