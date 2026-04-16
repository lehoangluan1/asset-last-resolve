# Asset Management Final - V1.2

Asset Management Final is a full-stack monorepo for a role-based asset lifecycle platform built with Spring Boot, PostgreSQL, Flyway, React, Vite, and Playwright.

It covers:

- asset inventory and ownership
- assignments and transfers
- borrow request workflows
- verification campaigns and discrepancy handling
- maintenance and disposal
- notifications, reporting, and audit visibility
- admin user/reference management
- backend-driven global search from the top header

## Local Defaults

- Frontend dev server: `http://localhost:5173`
- Backend API root: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`

## Project Overview

The system is designed as a role-aware operations platform rather than a simple CRUD dashboard. Different users see different scopes and actions depending on their role, while the backend remains the source of truth for authorization.

Primary roles:

- `admin`
- `officer`
- `manager`
- `employee`
- `technician`
- `auditor`

## Repository Layout

| Path | Purpose |
| --- | --- |
| `backend/` | Spring Boot API, security, services, Flyway migrations, Maven wrapper |
| `frontend/` | Vite + React + TypeScript SPA, Vitest tests, Playwright E2E |
| `scripts/` | Cross-platform helper scripts for backend, tests, and Docker orchestration |
| `.github/workflows/` | GitHub Actions CI |
| `docs/` | Software delivery, architecture, deployment, and landing-page documentation |

## Tech Stack

### Backend

- Java 21
- Spring Boot 4
- Spring Security with JWT
- Spring Data JPA
- Flyway
- PostgreSQL
- JUnit 5 + Testcontainers

### Frontend

- Node.js 23.11.0
- React 18
- TypeScript
- Vite 5
- TanStack Query
- shadcn/ui + Tailwind CSS
- Vitest + Testing Library
- Playwright

### Delivery tooling

- Maven Wrapper (`backend/mvnw`, `backend/mvnw.cmd`)
- npm
- Docker / Docker Compose
- GitHub Actions

## Prerequisites

Install the following on a fresh machine:

- Java 21
- Node.js 23.11.0 and npm
- PostgreSQL 16+ or Docker Desktop
- Git

Optional but recommended:

- Docker Desktop with `docker compose`
- pgAdmin, DBeaver, or another PostgreSQL client

## Local Environment Assumptions

This repo has been aligned for the current Windows PowerShell environment:

- shell: PowerShell
- backend port: `8080`
- frontend dev port: `5173`
- Java runtime: `21`
- Maven: use `backend\mvnw.cmd` on Windows
- frontend dependencies should already exist in this working copy, but a fresh clone should still run `npm --prefix frontend ci`

During normal local frontend development, leave `VITE_API_BASE_URL` unset so Vite proxies `/api/*` to the backend on `8080`.

## PostgreSQL Setup

### Option 1: Docker Compose

Start the full local stack:

```powershell
npm run docker:up
```

Stop and remove containers:

```powershell
npm run docker:down
```

### Option 2: Local PostgreSQL

Create a database and user matching the default local settings:

- Database: `asset_management`
- Username: `postgres`
- Password: `postgres`

Equivalent JDBC URL:

```text
jdbc:postgresql://localhost:5432/asset_management
```

## Environment Configuration

Two example files are included for reference:

- `backend/.env.example`
- `frontend/.env.example`

These files document the expected variables. The backend does not auto-load `.env` files by itself, so use PowerShell environment variables, Docker Compose, or your hosting platform's env configuration.

### Backend variables

| Variable | Default local behavior |
| --- | --- |
| `SERVER_PORT` | `8080` |
| `DB_URL` | full JDBC URL override |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `asset_management` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `JWT_SECRET` | demo secret for local/dev usage |
| `JWT_EXPIRATION_SECONDS` | `28800` |
| `JWT_ALLOW_DEMO_SECRET` | `true` locally |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | blank locally |

PowerShell example:

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="asset_management"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:JWT_SECRET="change-this-demo-jwt-secret-to-a-long-random-value-1234567890"
$env:JWT_ALLOW_DEMO_SECRET="true"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

### Frontend variables

| Variable | Default local behavior |
| --- | --- |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080` for Vite dev proxy |
| `VITE_API_BASE_URL` | unset for local proxy-based dev |
| `VITE_APP_BASE_PATH` | `/` |

Example `frontend/.env.local` for local dev:

```dotenv
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_APP_BASE_PATH=/
```

For split-host deployments, use:

```dotenv
VITE_API_BASE_URL=https://api.example.com
VITE_APP_BASE_PATH=/
```

## Backend Setup and Run

Start the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Important notes:

- Flyway runs automatically at startup
- Hibernate validates the schema instead of generating it
- the backend remains on port `8080`

## Frontend Setup and Run

Install dependencies on a fresh clone:

```powershell
npm --prefix frontend ci
```

Run the frontend:

```powershell
npm --prefix frontend run dev
```

Important notes:

- the Vite dev server is pinned to `5173`
- `strictPort: true` is enabled so Vite fails fast instead of choosing another port
- the router now supports `VITE_APP_BASE_PATH` for sub-path hosting

## Flyway Migration Behavior

Flyway is enabled automatically on backend startup.

- migration files live in `backend/src/main/resources/db/migration`
- `V1__init_schema.sql` creates the schema
- `V2__seed_demo_data.sql` loads demo departments, users, assets, workflows, notifications, and audit logs
- `spring.jpa.hibernate.ddl-auto=validate` ensures entity/schema alignment without generating tables automatically

## Demo Accounts

All seeded demo accounts use password `demo123`.

| Role | Username | Notes |
| --- | --- | --- |
| Admin | `admin` | Primary system administrator |
| Admin | `opsadmin` | Secondary admin |
| Officer | `officer` | Primary asset operations lead |
| Officer | `assetlead` | Secondary operations lead |
| Manager | `manager` | IT manager |
| Manager | `emily` | HR manager |
| Manager | `kevin` | Operations manager |
| Employee | `employee` | HR employee |
| Employee | `canderson` | IT employee |
| Employee | `rgreen` | Finance employee |
| Technician | `technician` | Maintenance technician |
| Technician | `mlopez` | Senior technician |
| Auditor | `auditor` | Verification auditor |
| Auditor | `qauditor` | Secondary auditor |
| Inactive test account | `inactivehr` | Expected login failure |

## Running Tests

### Backend unit tests

```powershell
npm run test:backend
```

### Backend integration tests

```powershell
npm run test:backend:integration
```

### Frontend unit tests

```powershell
npm run test:frontend
```

### Frontend production build

```powershell
npm --prefix frontend run build
```

### E2E smoke tests

Install the Playwright browser once if needed:

```powershell
npm run test:e2e:install
```

Run the smoke suite:

```powershell
npm run test:e2e
```

The Playwright config starts a clean Docker-backed stack through `node scripts/run-e2e-stack.mjs`, so each run gets a fresh seeded database.

Run the broader local E2E suite when needed:

```powershell
npm --prefix frontend run test:e2e:full
```

### Run all tests

```powershell
npm run test:all
```

## Docker / Compose

### Start the full stack

```powershell
npm run docker:up
```

### Stop the full stack

```powershell
npm run docker:down
```

### Container URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## CI

GitHub Actions is configured in `.github/workflows/ci.yml`.

The workflow runs automatically on:

- `push`
- `pull_request`

Current jobs:

- `Backend Tests`: `./backend/mvnw -f backend/pom.xml verify`
- `Frontend Unit Tests`: `npm --prefix frontend run test:unit`
- `Frontend Build`: `npm --prefix frontend run build`
- `End-to-End Smoke Tests`: `npm --prefix frontend run test:e2e`

This structure is suitable for branch protection and required status checks.

## Deployment Notes

### Recommended hosting patterns

Best fit:

- backend on Render or Railway
- PostgreSQL on a managed provider
- frontend on Render Static Site, Vercel, or Netlify

Supported deployment patterns:

- split-host deployment using `VITE_API_BASE_URL`
- same-origin deployment behind a reverse proxy using `/api`
- sub-path frontend hosting using `VITE_APP_BASE_PATH`

### Important production rules

- set `SPRING_PROFILES_ACTIVE=prod`
- set a real `JWT_SECRET`
- set `JWT_ALLOW_DEMO_SECRET=false`
- set `CORS_ALLOWED_ORIGINS` to the actual frontend origin
- optionally set `CORS_ALLOWED_ORIGIN_PATTERNS=https://*.onrender.com` if you want Render preview/static-site URLs to work without manually updating CORS for each generated hostname

### GitHub Pages caveat

GitHub Pages can only host the frontend. This app still requires an externally hosted backend, and BrowserRouter-based SPA hosting needs rewrite handling. It is therefore not the recommended primary deployment target.

Full deployment guidance is documented in `docs/deployment-readiness.md`.

### Render deployment pattern

This repo now includes [render.yaml](</c:/Users/LUAN/Downloads/asset_managemt_final/render.yaml>) as a Render Blueprint for:

- a backend web service
- a frontend static site
- a PostgreSQL database

Recommended Render settings:

- Backend:
  - `SPRING_PROFILES_ACTIVE=prod`
  - `JWT_SECRET=<set in Render dashboard>`
  - `JWT_ALLOW_DEMO_SECRET=false`
  - `CORS_ALLOWED_ORIGIN_PATTERNS=https://*.onrender.com`
  - `CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com`
- Frontend:
  - `VITE_API_BASE_URL=https://your-backend-name.onrender.com`
  - `VITE_APP_BASE_PATH=/`

The backend also exposes a public health check at `GET /api/health`, which is suitable for Render health checks.

## Common Troubleshooting

### The frontend still tries to use port 8080

- restart the Vite dev server after pulling the latest config
- the correct frontend dev URL is `http://localhost:5173`

### The frontend cannot reach the backend locally

- confirm the backend is running on `http://localhost:8080`
- for local `npm run dev`, leave `VITE_API_BASE_URL` unset
- if you changed the backend port, update `VITE_API_PROXY_TARGET` and backend `CORS_ALLOWED_ORIGINS`

### Flyway or database startup fails

- verify PostgreSQL is reachable on `localhost:5432`
- check the database name and credentials
- if the schema was changed manually, start from a clean local database

### The backend fails in a production-like environment

- confirm `JWT_SECRET` is set
- confirm `JWT_ALLOW_DEMO_SECRET=false`
- confirm `SPRING_PROFILES_ACTIVE=prod`

### The frontend build works but deployed routes fail

- confirm the host supports SPA rewrites
- confirm `VITE_APP_BASE_PATH` matches the deployed path prefix

### Playwright E2E tests cannot start the stack

- ensure Docker Desktop is running
- ensure either `docker compose version` or `docker-compose version` works
- the repo uses `node scripts/run-compose.mjs` to support both command styles

## Final Local URLs

- Frontend SPA: `http://localhost:5173`
- Backend API root: `http://localhost:8080/api`
- Login page: `http://localhost:5173/login`
- Global search example: `http://localhost:5173/search?q=ThinkPad`
- Playwright report after a run: `frontend/playwright-report/index.html`

## Documentation Package

Project documentation lives under `docs/`.

| File | Purpose |
| --- | --- |
| `docs/README.md` | Documentation index |
| `docs/software-overview.md` | Business context, scope, goals, assumptions, and NFRs |
| `docs/use-case-specification.md` | Detailed actor-centered use cases |
| `docs/functional-flows.md` | Workflow descriptions with diagrams |
| `docs/system-architecture.md` | Architecture, request lifecycle, and config strategy |
| `docs/database-design.md` | Schema rationale and relationship design |
| `docs/api-overview.md` | API surface overview |
| `docs/rbac-design.md` | Authorization model and role matrix |
| `docs/test-strategy.md` | Test types, CI gates, and coverage intent |
| `docs/runbook.md` | Operational run procedures and troubleshooting |
| `docs/deployment-readiness.md` | Hosting review and deployment guidance |
| `docs/delivery-package.md` | Risks, readiness, traceability, and roadmap |
| `docs/landing-page-brief.md` | Product narrative for presentation and marketing |
| `docs/lovable-landing-page-prompt.md` | Final Lovable-ready landing page prompt |
