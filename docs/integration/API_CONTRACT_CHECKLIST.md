# API Contract Checklist (Integration Phase 1)

## Base Conventions
- Base URL: `http://localhost:8080`
- API Prefix: `/api`
- Auth header: `Authorization: Bearer <accessToken>`
- Content type: `application/json`
- Error shape: `{ timestamp, status, error, message, path, validationErrors[] }`

## Authentication Contracts
### POST `/api/auth/register`
- Request: `{ email, password, fullName }`
- Validation: `email` format, all fields required
- Success 200: `{ accessToken, refreshToken, tokenType, expiresInSeconds }`
- Failure: 400 validation, 409 duplicate email

### POST `/api/auth/login`
- Request: `{ email, password }`
- Success 200: `{ accessToken, refreshToken, tokenType, expiresInSeconds }`
- Failure: 401 invalid credentials

### POST `/api/auth/refresh`
- Request: `{ refreshToken }`
- Success 200: `{ accessToken, refreshToken, tokenType, expiresInSeconds }`
- Failure: 401 invalid/expired refresh token

### POST `/api/auth/logout`
- Request: `{ refreshToken }`
- Success 204 no content

## CORS and Security Alignment
- Allowed origins (env-driven): frontend local/dev/staging domains
- Stateless JWT security enabled
- Public routes: `/api/auth/**`, `/actuator/health`
- All other routes require authenticated access

## Frontend Integration Checklist
- [x] Axios instance uses env `VITE_API_BASE_URL`
- [x] Request interceptor injects bearer token
- [x] Response interceptor attempts token refresh on 401 once
- [x] Refresh failure clears auth storage
- [x] Error normalization maps API payload message + validation errors
