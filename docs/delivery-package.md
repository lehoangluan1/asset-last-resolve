# Delivery Package

## Feature Inventory

| Area | Delivered capability |
| --- | --- |
| Auth | JWT login, session restore, profile access, password change |
| Dashboard | Role-aware KPIs, recent activity, quick actions |
| Assets | Inventory browsing, detail view, create/edit/delete for privileged roles |
| Assignments | Transfer history and scoped visibility |
| Borrow Requests | Request creation, approval, rejection, workflow status tracking |
| Verification | Campaign creation, progress tracking, task visibility |
| Discrepancies | Investigation, reconciliation, escalation, maintenance handoff |
| Maintenance | Record creation, technician assignment, status tracking |
| Disposal | Disposal review workflow with scoped reviewer access |
| Notifications | Per-user notification feed and read actions |
| Reports | Summary metrics and audit log search |
| Admin | User management and reference data maintenance |
| Search | Top-bar backend-driven global search results |

## Assumptions and Constraints

- PostgreSQL remains the target persistence engine.
- Seed data is intentionally kept because it supports demos and automated tests.
- Authorization remains backend-owned even when the frontend hides routes or actions.
- The project favors focused hardening over broad UI redesign.
- Frontend static hosting still requires an externally hosted backend when the app is not same-origin.

## Non-Functional Requirements

| Area | Expectation |
| --- | --- |
| Reliability | Startup paths and seeded demos should be repeatable locally and in CI |
| Security | RBAC must be enforced by the backend |
| Maintainability | Small, explicit, review-friendly code changes |
| Portability | Environment-sensitive values must be configurable |
| Delivery confidence | CI should fail on regressions and support required status checks |

## Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Frontend/backend port drift breaks local development | High | Fixed default ports and documented them clearly |
| Demo JWT secret accidentally reaches deployment | High | Added `JWT_ALLOW_DEMO_SECRET` guard and production profile override |
| Split-host frontend points to the wrong API | High | Added `VITE_API_BASE_URL` and documented deployment scenarios |
| Sub-path hosting breaks routing | Medium | Added `VITE_APP_BASE_PATH` and router basename support |
| Search could bypass module-level RBAC | High | Search reuses existing scoped services and grant checks |
| CI could diverge from local tooling | Medium | CI uses Java 21, Node 23.11.0, Maven wrapper, frontend build, and existing test scripts |
| Full E2E suite becomes flaky | Medium | CI uses a stable smoke suite and keeps full suite available locally |

## Definition of Done

The current phase is considered done when:

1. frontend and backend no longer collide on ports
2. top search performs a real backend-driven result flow
3. RBAC is still enforced by the backend
4. environment-sensitive values are documented and configurable
5. README and docs support fresh local setup and deployment planning
6. CI runs on push and pull request with meaningful gates
7. build and relevant tests have been rerun successfully

## Release Readiness Checklist

### Code and config

- [ ] backend env vars reviewed for target environment
- [ ] frontend env vars reviewed for target environment
- [ ] `JWT_SECRET` replaced for deployment
- [ ] `JWT_ALLOW_DEMO_SECRET=false` in deployment
- [ ] `CORS_ALLOWED_ORIGINS` matches deployed frontend

### Validation

- [ ] backend `verify` passes
- [ ] frontend unit tests pass
- [ ] frontend production build passes
- [ ] Playwright smoke suite passes

### Documentation

- [ ] README matches actual commands and ports
- [ ] deployment notes reflect chosen hosting model
- [ ] demo credentials and seed assumptions are still correct

## Traceability Snapshot

| Requirement or concern | Implementation area | Verification |
| --- | --- | --- |
| Distinct frontend/backend local ports | `frontend/vite.config.ts`, backend config, README | local startup, smoke tests |
| Top search must trigger real results | `AppHeader`, `SearchResultsPage`, `/api/search` | frontend test, backend integration, Playwright smoke |
| RBAC remains backend-owned | security config, authorization service, scoped services | backend tests, Playwright coverage |
| Deployment-sensitive values must be configurable | `frontend/src/lib/env.ts`, backend properties, env example files | frontend build, backend verify, docs review |
| CI must support required checks | `.github/workflows/ci.yml` | GitHub Actions |

## Iteration Summary

This hardening pass focused on delivery quality rather than feature sprawl:

- resolved local port collisions
- introduced a real, grouped, RBAC-aware global search flow
- aligned Java runtime expectations to Java 21 across Maven, Docker, and CI
- externalized more deployment-sensitive configuration
- added frontend production build validation to CI
- expanded the documentation package into a more realistic team handoff set

## Known Limitations

- Search is intentionally lightweight and aggregated; it is not a full-text indexing engine.
- The frontend production bundle still emits a large chunk warning.
- GitHub Pages is not a turnkey host for this app because it cannot host the backend and BrowserRouter needs rewrite support.
- The full Playwright suite remains broader than the CI smoke gate and may require additional stabilization over time.

## Roadmap and Future Improvements

- split large frontend bundle chunks for faster initial load
- extend deep-linking between list filters and URL query params
- add more end-to-end coverage for non-smoke pages
- introduce deployment-specific examples for Render or Railway if a real target environment is chosen
- consider richer asset search or reporting once performance requirements justify it
