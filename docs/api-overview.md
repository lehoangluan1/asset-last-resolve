# API Overview

## API Style

- REST-style JSON API under `/api`
- JWT bearer authentication after login
- Backend-enforced permission checks through Spring Security and service rules

## Endpoint Groups

### Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

### Profile

- `GET /api/profile`
- `PUT /api/profile`

### Dashboard

- `GET /api/dashboard`

### Assets

- `GET /api/assets`
- `GET /api/assets/{assetId}`
- `POST /api/assets`
- `PUT /api/assets/{assetId}`
- `DELETE /api/assets/{assetId}`

### Assignments

- `GET /api/assignments`

### Borrow Requests

- `GET /api/borrow-requests`
- `GET /api/borrow-requests/{requestId}`
- `POST /api/borrow-requests`
- `POST /api/borrow-requests/{requestId}/approve`
- `POST /api/borrow-requests/{requestId}/reject`

### Verification

- `GET /api/verification/campaigns`
- `GET /api/verification/campaigns/{campaignId}`
- `POST /api/verification/campaigns`

### Discrepancies

- `GET /api/discrepancies`
- `GET /api/discrepancies/{discrepancyId}`
- `POST /api/discrepancies/{discrepancyId}/reconcile`
- `POST /api/discrepancies/{discrepancyId}/escalate`
- `POST /api/discrepancies/{discrepancyId}/maintenance`

### Maintenance

- `GET /api/maintenance`
- `POST /api/maintenance`

### Disposal

- `GET /api/disposal`
- `POST /api/disposal/{disposalId}/approve`
- `POST /api/disposal/{disposalId}/reject`
- `POST /api/disposal/{disposalId}/defer`

### Notifications

- `GET /api/notifications`
- `POST /api/notifications/read-all`
- `POST /api/notifications/{notificationId}/read`

### Reports

- `GET /api/reports/summary`
- `GET /api/reports/audit-logs`

### Reference Data

- `GET /api/reference/departments`
- `GET /api/reference/locations`
- `GET /api/reference/categories`
- `GET /api/reference/users`
- `POST /api/reference/categories`
- `PUT /api/reference/categories/{categoryId}`
- `DELETE /api/reference/categories/{categoryId}`

### User Management

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/{userId}`
- `POST /api/users/{userId}/reset-password`
- `POST /api/users/{userId}/toggle-status`

### Global Search

- `GET /api/search?q=keyword`

Purpose:

- returns grouped search results for the modules the current user may access
- uses existing service scoping instead of bypassing authorization rules
- currently groups assets, users, borrow requests, assignments, maintenance, discrepancies, disposal, and verification campaigns where permitted

## Error Handling

Validation and domain errors are returned as structured JSON through the shared exception handler.

Typical responses:

- `400` invalid payload or invalid state transition
- `401` missing or invalid authentication
- `403` authenticated but not permitted
- `404` missing record

## API Design Notes

- List endpoints generally accept `search`, filters, `page`, and `size`
- The UI relies on backend paging responses shaped as `items`, `totalItems`, `page`, `size`, and `totalPages`
- Search is intentionally lightweight and aggregated from existing module services to keep behavior consistent with the rest of the app
