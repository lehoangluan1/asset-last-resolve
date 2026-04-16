# Runbook

## Local Startup Checklist

1. Confirm Java 21 is available.
2. Confirm Node.js and npm are available.
3. Confirm PostgreSQL is available locally or start Docker Desktop.
4. Confirm frontend dependencies exist, or run `npm --prefix frontend ci`.
5. Decide whether the frontend will use the local Vite proxy or a direct backend URL.
6. Start the backend on `8080`.
7. Start the frontend on `5173`.

## Recommended Local Config

### Backend

The backend supports either a full JDBC URL or component-style database variables.

Common local values:

- `SERVER_PORT=8080`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=asset_management`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=postgres`
- `JWT_SECRET=change-this-demo-jwt-secret-to-a-long-random-value-1234567890`
- `JWT_ALLOW_DEMO_SECRET=true`
- `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`

### Frontend

Common local values:

- leave `VITE_API_BASE_URL` unset when using `npm --prefix frontend run dev`
- `VITE_API_PROXY_TARGET=http://localhost:8080`
- `VITE_APP_BASE_PATH=/`

## Standard Local Run Commands

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Frontend

```powershell
npm --prefix frontend run dev
```

### Full Docker stack

```powershell
npm run docker:up
```

## Verification Checklist After Startup

### Backend indicators

- login succeeds for `admin / demo123`
- Flyway completes before the app accepts traffic
- `/api/auth/me` returns the signed-in profile after login

### Frontend indicators

- login page loads at `http://localhost:5173/login`
- dashboard loads after sign-in
- header search navigates to `/search?q=...`
- asset and borrow pages show seeded data

## Release or Demo Smoke Test

1. Sign in as `admin`.
2. Open Assets and confirm data loads.
3. Use the top search bar for `PowerEdge` or `ThinkPad`.
4. Open Borrow Requests and confirm seeded rows exist.
5. Open Verification and confirm campaigns render.
6. Open User Management and confirm admin-only access.
7. Sign out and confirm protected routes redirect to login.

## Build and Test Validation

Run the most relevant checks before a handoff or deployment candidate:

```powershell
npm run test:frontend
npm --prefix frontend run build
npm run test:backend:integration
npm run test:e2e
```

## Deployment Preparation Checklist

Before a real deployment, confirm:

1. `JWT_SECRET` is replaced with a real secret.
2. `JWT_ALLOW_DEMO_SECRET` is set to `false`.
3. `CORS_ALLOWED_ORIGINS` matches the deployed frontend origin.
4. The frontend uses the correct `VITE_API_BASE_URL` when not same-origin.
5. `VITE_APP_BASE_PATH` is set when hosting under a sub-path.
6. Database credentials point to the managed PostgreSQL instance.

## Shutdown

### Local processes

- stop the frontend dev server with `Ctrl+C`
- stop the backend with `Ctrl+C`

### Docker stack

```powershell
npm run docker:down
```

## Incident and Failure Handling

### Backend fails to start

- check database credentials
- check whether port `8080` is already in use
- check Java version
- inspect Flyway migration errors first
- confirm production-like environments are not still using the demo JWT secret with `JWT_ALLOW_DEMO_SECRET=false`

### Frontend fails to start

- check whether port `5173` is already in use
- check for stale `VITE_API_BASE_URL` values in `frontend/.env.local`
- confirm `VITE_APP_BASE_PATH` is a valid path value such as `/` or `/asset-management/`

### Frontend builds but API calls fail

- confirm the browser origin is present in backend `CORS_ALLOWED_ORIGINS`
- confirm the frontend is pointing at the right backend origin
- for local `npm run dev`, leave `VITE_API_BASE_URL` unset unless you intentionally want direct backend calls

### GitHub Actions passes backend tests but deployment still fails

- confirm deployment env vars match the values documented in `README.md`
- confirm the frontend bundle was built with the correct `VITE_API_BASE_URL` and `VITE_APP_BASE_PATH`
- confirm the hosting platform supports SPA rewrites when BrowserRouter is used

### E2E stack fails

- confirm Docker is running
- confirm `docker compose version` or `docker-compose version` works
- use `node scripts/run-compose.mjs up --build postgres backend frontend` directly to troubleshoot stack startup
