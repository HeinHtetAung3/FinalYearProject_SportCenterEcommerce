# How to run the SportsHub frontend

Pick the track that matches what you want to do.

> Note for Windows / PowerShell users: the snippet `cp .env.local.example .env.local` is Unix-only. On PowerShell use `Copy-Item` (shown below).

---

## 1. Quickest: UI only with demo data

You will see a fully populated shop (12 sample products with real images). No Java, MySQL or Docker required. Useful for design review and frontend iteration.

```powershell
cd .frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Open **http://localhost:5173/** (Vite is configured with `strictPort: true`, so it always uses 5173).

A small demo banner appears at the top of the page while the backend is offline. It auto-disappears once the backend is running.

---

## 2. Full stack with Docker (recommended for the real backend)

Requires Docker Desktop. Spins up MySQL + Spring Boot + the built frontend.

```powershell
docker compose up -d --build
```

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:8080>

Stop everything with:

```powershell
docker compose down
```

If the database was ever created with a **different** MySQL root password, reset the volume once so credentials match `docker-compose.yml`:

```powershell
docker compose down -v
docker compose up --build
```

---

## 3. Backend without Docker (for backend developers)

Requires a local MySQL 8 with database `sports_ecommerce`, plus JDK 21 and Maven.

```powershell
cd .backend
Copy-Item .env.local.example .env.local
# Edit .env.local with your local DB credentials if needed
mvn spring-boot:run
```

Then start the frontend in a second terminal as in track #1.

---

## Troubleshooting

- **Shop page shows "Something went wrong" / no products**
  The frontend can't reach the backend. Either start the backend (track 2 or 3) or just keep using demo mode (track 1) — the redesign now falls back automatically.

- **CORS errors in the browser console once the backend is running**
  The backend allows any `http://localhost:*` origin out of the box, so Vite on 5173, 5174, etc. all work.

- **Port 5173 is already in use**
  1. If Docker is running the full stack, open the UI at **http://localhost:3000** instead, or run only DB + API: `docker compose up db backend` and use Vite on 5173.
  2. Or stop whatever holds 5173. PowerShell: `netstat -ano | findstr :5173` then end that PID in Task Manager, or `Stop-Process -Id <pid> -Force`.

- **Firebase Storage images**
  Set `VITE_FIREBASE_STORAGE_BUCKET` in `.frontend/.env.local` to enable Firebase-hosted product images. When unset, the UI uses curated category-based fallbacks (running shoes, footballs, gym gear) so it always looks complete.
