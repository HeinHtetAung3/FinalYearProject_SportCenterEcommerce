# Environment Matrix (Backend + Frontend)

| Environment | Backend URL | Frontend URL | DB URL | Notes |
|---|---|---|---|---|
| local | http://localhost:8080 | http://localhost:5173 (Vite) or http://localhost:3000 (Docker nginx) | jdbc:mysql://localhost:3306/sports_ecommerce | Local developer machine |
| dev | https://api-dev.sportshub.example | https://dev.sportshub.example | jdbc:mysql://db-dev:3306/sports_ecommerce | Shared development |
| staging | https://api-staging.sportshub.example | https://staging.sportshub.example | jdbc:mysql://db-staging:3306/sports_ecommerce | UAT / pre-release |

## Required env vars
### Backend
- `SERVER_PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

### Frontend
- `VITE_API_BASE_URL`
