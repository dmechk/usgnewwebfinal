# WebUSG Backend

Node.js Express API for clinic ultrasound management, with JWT authentication, role-based authorization, and OpenAPI docs.

## Setup

1. Copy [`.env.example`](.env.example) to `.env` and fill in real values. Do not commit `.env`.
2. Use a MongoDB user with least privilege for the application database. Enable TLS for Atlas/production (`mongodb+srv` already uses TLS).
3. Install dependencies:

```bash
npm install
```

Required environment variables:

- `MONGODB_URI`
- `JWT_SECRET` (at least 32 characters)
- `JWT_EXPIRES_IN` (seconds or a duration such as `15m`, `1h`, `7d`)
- `PORT`, `NODE_ENV`
- `BCRYPT_SALT_ROUNDS` (default 12)
- `JWT_ISSUER`, `JWT_AUDIENCE`
- `CORS_ORIGINS` (comma-separated; required for locked-down production browsers)
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed command only)

## Seed the initial administrator

Seeding is **not** run on server start. Configure the `ADMIN_*` variables, then:

```bash
npm run seed:admin
```

The command is idempotent: it will not create a second admin, will not reset an existing admin password, and will not promote a non-admin who already owns that email.

## Run

```bash
npm run dev
npm start
```

## Tests and lint

Tests use an in-memory MongoDB and never the production URI.

```bash
npm test
npm run lint
```

## Sign-in

`POST /api/v1/auth/signin`

JWT access tokens are bearer credentials. Send them only over HTTPS in production.

Request:

```json
{
  "email": "admin@example.com",
  "password": "replace-with-a-secure-password"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Sign-in successful",
  "data": {
    "user": {
      "id": "user-id",
      "name": "System Administrator",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "passwordChangeRequired": false,
      "lastLoginAt": "2026-10-18T12:00:00.000Z"
    },
    "accessToken": "signed-jwt-token",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

`expiresIn` is the configured lifetime in seconds. Invalid credentials return a generic `401`. Disabled accounts return `403` and no token.

## Swagger

- UI: `http://localhost:5000/api/docs`
- Spec: `http://localhost:5000/api/docs.json`

## Authorization strategy

A valid JWT is not enough on its own. `authenticate` reloads the user on every request so that:

- Disabled or deleted accounts are rejected.
- Tokens issued before `passwordChangedAt` are treated as revoked.
- Roles are taken from the current database record, not only from the token.
- `requirePasswordChanged` blocks patients/exams (and similar) until the user no longer has `passwordChangeRequired`. `GET /api/v1/auth/me` remains available so the client can see that flag.

`requireRole('admin')` is the extension point for later permissions. Clinic roles remain `admin`, `radiologist`, and `technician`.

Public self-registration is disabled. Creating users is admin-only (`POST /api/v1/auth/register`).

## Security notes

- Passwords are hashed with bcrypt (`BCRYPT_SALT_ROUNDS`). Prefer Argon2id if you later add native hashing.
- Sign-in is rate limited. Access tokens should be short-lived; a refresh-token flow is not implemented yet.
- CORS is origin-restricted when `CORS_ORIGINS` is set. In development with an empty list, any origin is allowed.
- Do not log tokens, passwords, or connection strings.
