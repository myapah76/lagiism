# LAGIISM Project Rules & Architecture Contract

> **MANDATORY:** Read and follow every rule in this file before creating, editing, or reviewing anything in **Backend (`lagiism-be/`)**, **Frontend (`lagiism-fe/`)**, **Database (PostgreSQL / Flyway)**, or **Infrastructure / CI/CD**.

---

## 1. System Topology & Monorepo Layout

```text
[Browser]
   ├── Frontend (https://yourdomain.com)
   │     Cloudflare Workers Static Assets (React 19 + Vite SPA)
   │     + worker.js reverse-proxy fallback for /api/* & /actuator/*
   │
   └── Backend API (https://api.yourdomain.com)
         Nginx (HTTPS / Let's Encrypt SSL reverse proxy)
            └── Docker Compose (VPS: 2 vCPU, 2GB RAM)
                  ├── Spring Boot 4.1 (Java 21) :8080 (internal/proxied)
                  └── PostgreSQL 16 :5432 (internal Docker network only)
                        ├── Cloudinary CDN (image uploads)
                        └── Dynamic SMTP (password recovery OTP emails)
```

### Monorepo Directory Structure (Canonical Names: `lagiism-be/` & `lagiism-fe/`)

All scripts, Dockerfiles, Cloudflare configs, and GitHub Actions MUST reference `lagiism-be/` and `lagiism-fe/` (never `be/` or `fe/`).

```text
lagiism/
├── lagiism-be/                               # Spring Boot Backend
│   ├── src/main/java/com/lagiism/
│   │   ├── auth/                             # SecurityConfig, HybridCsrfTokenRepository, Login/Logout/OTP Reset
│   │   ├── account/                          # Admin/Staff account CRUD & audit trail
│   │   ├── cms/                              # Public homepage aggregate + Admin CMS (hero, sections, reviews, header/footer)
│   │   ├── <domain>/                         # Core business modules (catalog/products, drops, categories, badges, settings)
│   │   ├── cloudinary/                       # CloudinaryService (upload, replace, delete)
│   │   ├── email/                            # Dynamic SMTP config (AES-256-GCM encrypted) + OTP email sender
│   │   ├── database/                         # Admin DB status, pg_dump export, preview, restore with rollback
│   │   └── shared/                           # ApiResponse<T>, GlobalExceptionHandler, OpenApiConfig, HealthController
│   ├── src/main/resources/
│   │   ├── application.yml                   # Base config + env var bindings
│   │   ├── application-dev.yml               # Local dev profile
│   │   ├── application-prod.yml              # Production hardening
│   │   └── db/migration/                     # Flyway SQL migrations (V1__..., V2__...)
│   ├── src/test/                             # JUnit 5 + MockMvc + H2 integration tests
│   ├── Dockerfile                            # Multi-stage Eclipse Temurin 21 (layered JAR extraction)
│   └── pom.xml                               # Maven build (Java 21, Spring Boot 4.1)
│
├── lagiism-fe/                               # React 19 + Vite Frontend
│   ├── public/
│   │   ├── favicon.ico                       # 48x48 1:1 square ICO (Google Search)
│   │   ├── favicon-48x48.png / 96x96 / 192x192 / apple-touch-icon.png
│   │   └── images/
│   ├── src/
│   │   ├── components/                       # Shared layout & UI (Navbar, Footer, Modals, LanguageSwitcher)
│   │   ├── constants/                        # API_BASE_URL, API_ENDPOINTS, app constants
│   │   ├── features/
│   │   │   ├── home/                         # Public landing page sections
│   │   │   ├── <domain>/                     # Public catalog/core pages
│   │   │   └── admin/                        # Dedicated Admin Portal (/admin, /admin/login)
│   │   ├── hooks/                            # Custom React hooks
│   │   ├── lib/                              # axios.ts (withCredentials + CSRF interceptor), api-client.ts
│   │   ├── services/                         # Domain API adapters (auth, cms, admin, <domain>, database)
│   │   ├── stores/                           # Zustand stores (auth.store.ts, ui.store.ts)
│   │   ├── types/                            # TypeScript DTOs & domain interfaces
│   │   └── utils/                            # Formatting, localization helpers
│   ├── index.html                            # SEO meta, OG tags, 1:1 favicons, JSON-LD schema
│   ├── wrangler.toml                         # Cloudflare Workers Static Assets config
│   ├── worker.js                             # Edge proxy for /api/* -> https://api.yourdomain.com
│   └── package.json
│
├── .github/workflows/
│   ├── ci.yml                                # PR/Push: Backend tests + Vite lint & build
│   └── deploy-backend.yml                    # Test -> Docker Hub push -> SSH deploy + healthcheck rollback
├── docker-compose.yml                        # Local full-stack dev
├── docker-compose.prod.yml                   # Production VPS (postgres + backend with memory limits)
├── wrangler.toml                             # Root Cloudflare Workers config (monorepo entry)
├── worker.js                                 # Root Cloudflare Worker script
├── package.json                              # Root build script delegating to lagiism-fe/
├── RULES.md                                  # This architecture & engineering ruleset
├── AGENTS.md                                 # Auto-loaded agent entrypoint referencing RULES.md
└── .env.example                              # Environment variable template (never commit .env)
```

---

## 2. Backend Rules (`lagiism-be/`)

- **Stack & Architecture:** Java 21, Spring Boot 4.1, Maven (`lagiism-be/pom.xml`), layered modular monolith (`controller → service → repository → entity → dto → mapper`).
- **Unified API Envelope (`ApiResponse<T>`):**
  - Every REST controller MUST return `ApiResponse<T>` with shape `{ success, message, data, timestamp }`.
  - Never expose JPA `@Entity` classes directly in controller request/response signatures; always map via DTOs.
- **Global Exception Handling:**
  - All validation, auth, domain, and unexpected errors MUST be handled centrally in `@RestControllerAdvice GlobalExceptionHandler` and returned using `ApiResponse`.
- **API Documentation:**
  - Use SpringDoc OpenAPI (`swagger-ui`) and keep request/response DTOs accurately annotated.
- **Public Homepage Aggregate:**
  - Expose a single `GET /api/public/homepage` endpoint aggregating hero, sections, reviews, and settings in one round trip.
- **Admin Bootstrap:**
  - `AdminInitializer` seeds the initial admin account on startup from `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables **only if no admin exists**.
  - Never hardcode admin credentials in source code or migration scripts.

---

## 3. Auth, JWT, Redis Blacklist & Security Rules

- **Hybrid Auth with JWT + Redis Blacklist (Approved Architecture):**
  - Supports **Customer (`ROLE_USER`)**, **Staff (`ROLE_STAFF`)**, and **Admin (`ROLE_ADMIN`)** accounts.
  - Users can **register** (`POST /api/auth/register`), **log in** (`POST /api/auth/login`), or authenticate via **Google OAuth / Google ID Token** (`POST /api/auth/google`).
  - Issues signed **JWT Access Tokens** (with `sub`, `uid`, `role`, `jti`, `iat`, `exp`) and **Refresh Tokens** (`POST /api/auth/refresh`), while preserving `BCrypt` password hashing.
  - **Redis Token Blacklist (MANDATORY):** On `POST /api/auth/logout`, password change, or token revocation, the token's `jti` MUST be blacklisted in Redis (`jwt:blacklist:<jti>`) with TTL matching the token's remaining lifetime. `JwtAuthenticationFilter` MUST reject any blacklisted token with `401 Unauthorized`.
  - Standard auth endpoints:
    - `POST /api/auth/register` (creates `ROLE_USER` account)
    - `POST /api/auth/login` (email/password -> JWT access + refresh tokens)
    - `POST /api/auth/google` (Google ID token verification -> auto-register/link `ROLE_USER` -> JWT tokens)
    - `POST /api/auth/refresh` (rotates/refreshes access token)
    - `GET /api/auth/me` (returns current authenticated user + role)
    - `POST /api/auth/logout` (blacklists current JWT in Redis)
    - `GET /api/auth/csrf`, password change & OTP password recovery endpoints.
- **Role-Based Access Control (RBAC):**
  - `/api/public/**` and auth login/register/google/refresh/OTP endpoints: public.
  - `/api/user/**`: authenticated (`USER`, `STAFF`, `ADMIN`).
  - `/api/admin/**`: restricted to `ADMIN` and `STAFF` roles.
- **CORS Whitelist:**
  - Configure CORS strictly from `CORS_ALLOWED_ORIGINS` with `allowCredentials = true`. Never use wildcard `*` origins with credentials.

---

## 4. Database & Flyway Rules (PostgreSQL 16)

- **Database Engines:**
  - PostgreSQL 16 for local dev and production.
  - H2 in-memory database for automated tests (`test` profile).
- **Flyway-First Migrations:**
  - Every schema or seed change MUST be authored as a versioned SQL file in `lagiism-be/src/main/resources/db/migration/` named `V<version>__<snake_case_description>.sql`.
  - **NEVER modify an already-applied migration file.** Always create a new `V<next>__...sql` migration.
  - Production JPA `ddl-auto` MUST be `validate` (never `update` or `create-drop`).
- **Network Isolation:**
  - In `docker-compose.prod.yml`, PostgreSQL `:5432` MUST be bound only to the internal Docker network and NEVER exposed to the public internet.
- **Admin Database Operations:**
  - `database` module handles DB status, `pg_dump` export, preview, and restore with rollback safety. Never run destructive DB commands without explicit confirmation and backup/rollback handling.

---

## 5. Media (Cloudinary) & Email (Dynamic SMTP) Rules

- **Cloudinary Safe Replacement (`cloudinary-http5`):**
  - When replacing an image, **always upload the new image first**.
  - Delete `oldPublicId` **only after** the new upload succeeds and the DB update is ready/committed. Never delete the old asset before confirming the new upload succeeded.
- **Dynamic SMTP & OTP Emails (Spring Mail + Thymeleaf):**
  - Store SMTP credentials in PostgreSQL encrypted with **AES-256-GCM**; allow updating them via the Admin UI.
  - Never log plaintext SMTP passwords, encryption keys, or OTP codes.

---

## 6. Frontend Rules (`lagiism-fe/`)

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Axios.
- **Axios Client (`lagiism-fe/src/lib/axios.ts`):**
  - `baseURL`: `import.meta.env.VITE_API_BASE_URL` (PROD fallback: `https://api.yourdomain.com/api`, DEV fallback: `http://localhost:8080/api`).
  - `withCredentials: true`.
  - Default `timeout: 30000` (30s).
  - Multipart image upload calls MUST explicitly set `timeout: 90000` (90s) because Cloudinary uploads can exceed 15s.
  - Request interceptor MUST attach `X-XSRF-TOKEN` on `POST`, `PUT`, `PATCH`, and `DELETE`.
  - Response interceptor MUST cache any refreshed `x-xsrf-token` response header in memory.
- **Service Layer Abstraction:**
  - UI components and hooks MUST ONLY call `src/services/*.service.ts`.
  - Never invoke raw `axios` or `fetch` directly inside React components.
- **State Management:**
  - Keep Zustand stores minimal and focused: `auth.store.ts` (session/user) and `ui.store.ts` (language/modals/filters).
- **Strict Public vs. Admin Separation:**
  - Public storefront MUST contain **zero** admin links, buttons, or hints.
  - Admin Portal lives strictly under `/admin` and `/admin/login`.
  - **NEVER** render or prefill hardcoded default admin credentials in production UI.
- **SEO & Favicons (`lagiism-fe/index.html` & `lagiism-fe/public/`):**
  - Maintain 1:1 square favicons (`favicon.ico` 48x48, `favicon-48x48.png`, `96x96`, `192x192`, `apple-touch-icon.png`), Open Graph tags, and JSON-LD structured data.

---

## 7. Deployment, Infrastructure & CI/CD Rules

- **Cloudflare Workers Static Assets (Frontend):**
  - Root `wrangler.toml`:
    - `main = "worker.js"`
    - `[build]` `command = "npm --prefix lagiism-fe install && npm --prefix lagiism-fe run build"`
    - `[assets]` `directory = "./lagiism-fe/dist"`, `not_found_handling = "single-page-application"`, `run_worker_first = ["/api/*", "/actuator/*"]`
  - `worker.js` proxies `/api/*` and `/actuator/*` to `https://api.yourdomain.com`.
  - **FORBIDDEN:** Never add a Netlify-style `lagiism-fe/public/_redirects` containing external `200` proxy URLs (Cloudflare rejects this with error `100324`).
- **VPS Docker Compose (`docker-compose.prod.yml`):**
  - Sized for 2 vCPU / 2GB RAM VPS:
    - `postgres`: memory limit `384M`
    - `backend`: memory limit `1024M` with `JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=70.0"`
  - Nginx reverse proxy with Let's Encrypt SSL: `client_max_body_size 50M`, `proxy_read_timeout 120s`.
- **GitHub Actions (`.github/workflows/`):**
  - `ci.yml`: Run backend tests + frontend lint/typecheck & build on every PR and push.
  - `deploy-backend.yml`:
    - Run tests → Docker Buildx push to `${{ secrets.DOCKERHUB_USERNAME }}/<image-name>` (**never hardcode a Docker Hub username**).
    - Tag current running image as `:previous`, deploy immutable `${{ github.sha }}`, poll `/actuator/health`, and automatically roll back to `:previous` if the healthcheck fails.

---

## 8. Git Commit Hygiene & Verification Checklist

### Atomic Git Commits (MANDATORY)
- **Commit only related logic together.** Never combine unrelated features, refactors, backend + frontend + infra changes, or multiple modules into a single giant commit.
- Split work into focused, atomic commits scoped to one logical concern (e.g., `chore(infra): ...`, `feat(be-auth): ...`, `feat(be-cms): ...`, `feat(be-catalog): ...`, `feat(fe-admin): ...`, `test(be): ...`).
- Each commit should leave the repository in a coherent, reviewable state.

### Verification Checklist
Before finishing any change:
1. **Secrets Hygiene:** Verify no `.env`, API keys, SMTP secrets, or passwords are committed.
2. **Backend Changes:** Run the test suite (`lagiism-be`) and verify Flyway migrations apply cleanly on a fresh database.
3. **Frontend Changes:** Run TypeScript check (`tsc --noEmit`) and production build (`vite build`) in `lagiism-fe/`.
4. **Cross-Layer Contract:** Verify DTO field names, `ApiResponse<T>` envelope, CSRF header handling, and upload timeouts stay aligned between `lagiism-be/` and `lagiism-fe/`.
