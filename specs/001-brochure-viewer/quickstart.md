# Quickstart: Brochure Viewer

**Date**: 2025-01-12 (Updated: 2026-01-13)
**Branch**: `001-brochure-viewer`
**App Name**: Open Brochure | **Domain**: openbrochure.com

This guide helps developers get Open Brochure running locally.

---

## Prerequisites

- **Node.js**: 20.x LTS
- **pnpm**: 8.x (or npm/yarn)
- **Supabase CLI**: For local development
- **Cloudflare account**: For R2 storage (or use Supabase Storage for dev)

---

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone <repo-url>
cd tri-fold

# Install dependencies
pnpm install
```

### 2. Set Up Supabase

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push
```

### 3. Configure Environment

```bash
# Copy example env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit with your Supabase keys (shown after `supabase start`)
```

**Required environment variables:**

```env
# frontend/.env.local
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# backend/.env
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_KEY=<your-service-key>
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY=<r2-access-key>
R2_SECRET_KEY=<r2-secret-key>
R2_BUCKET_NAME=openbrochure-dev
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev
```

Open http://localhost:5173

---

## Project Structure

```
tri-fold/
├── frontend/           # SvelteKit app
│   ├── src/
│   │   ├── lib/        # Shared components, utilities
│   │   ├── routes/     # SvelteKit routes
│   │   └── app.html    # HTML template
│   └── package.json
│
├── backend/            # Fastify API
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Business logic
│   │   └── index.ts    # Entry point
│   └── package.json
│
├── shared/             # Shared types
│   └── types/
│
├── supabase/           # Database migrations
│   └── migrations/
│
└── specs/              # Feature specifications
```

---

## Key Commands

### Frontend

```bash
cd frontend

pnpm dev          # Start dev server (port 5173)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm test         # Run unit tests
pnpm test:e2e     # Run Playwright tests
pnpm check        # Type check
```

### Backend

```bash
cd backend

pnpm dev          # Start dev server (port 3000)
pnpm build        # Compile TypeScript
pnpm start        # Run production build
pnpm test         # Run tests
```

### Database

```bash
supabase start        # Start local Supabase
supabase stop         # Stop local Supabase
supabase db push      # Apply migrations
supabase db reset     # Reset database
supabase gen types    # Generate TypeScript types
```

---

## Development Workflow

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/my-feature`
2. Run `/speckit.specify` to create specification
3. Run `/speckit.clarify` to resolve ambiguities
4. Run `/speckit.plan` to create implementation plan
5. Run `/speckit.tasks` to generate task list
6. Implement tasks, checking off as you go
7. Run tests: `pnpm test` and `pnpm test:e2e`
8. Create PR

### Running Tests

```bash
# All tests
pnpm test

# Frontend unit tests
cd frontend && pnpm test

# E2E tests
cd frontend && pnpm test:e2e

# Accessibility audit
cd frontend && pnpm test:a11y
```

### Database Changes

1. Create migration: `supabase migration new <name>`
2. Edit `supabase/migrations/<timestamp>_<name>.sql`
3. Apply: `supabase db push`
4. Generate types: `supabase gen types typescript --local > shared/types/database.ts`

---

## Common Issues

### "Supabase connection refused"

```bash
# Make sure Supabase is running
supabase status
supabase start
```

### "R2 credentials invalid"

For local development without Cloudflare R2:
1. Use Supabase Storage instead (built-in)
2. Set `USE_SUPABASE_STORAGE=true` in backend/.env

### "Port already in use"

```bash
# Kill process on port
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SvelteKit Frontend                      │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐       │   │
│  │  │ Viewer3D  │  │ PanelEdit │  │  Library  │       │   │
│  │  │(CSS 3D)   │  │  (DnD)    │  │  (Grid)   │       │   │
│  │  └───────────┘  └───────────┘  └───────────┘       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Fastify Backend                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  Upload   │  │ Brochures │  │   Share   │               │
│  │  Service  │  │  Service  │  │  Service  │               │
│  └───────────┘  └───────────┘  └───────────┘               │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│       Supabase          │     │      Cloudflare R2          │
│  PostgreSQL + Auth      │     │  File storage + CDN         │
└─────────────────────────┘     └─────────────────────────────┘
```

---

## External Services Setup

### Supabase (Production)

1. Create project at https://supabase.com
2. Run migrations against production DB
3. Configure OAuth providers in Dashboard > Authentication
4. Copy production keys to deployment env vars

### Cloudflare R2

1. Create R2 bucket in Cloudflare Dashboard
2. Create API token with R2 read/write permissions
3. Configure bucket CORS for your domain
4. Set up custom domain for CDN delivery (optional)

### OAuth Providers

**Google:**
1. Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `https://openbrochure.com/auth/callback`
4. Add to Supabase Dashboard > Authentication > Providers

**Apple:**
1. Apple Developer Account > Certificates > Services IDs
2. Create Service ID with Sign in with Apple
3. Configure domain and return URL
4. Add to Supabase Dashboard

**Microsoft:**
1. Azure Portal > App Registrations > New registration
2. Add redirect URI and configure ID tokens
3. Add to Supabase Dashboard as Azure provider

---

## Deployment

### Vercel (Frontend)

```bash
cd frontend
vercel deploy
```

### Railway/Render (Backend)

```bash
cd backend
# Configure via platform dashboard
# Set environment variables for production
```

### Production Checklist

- [ ] Set production environment variables
- [ ] Configure custom domain (openbrochure.com)
- [ ] Set up SSL certificates
- [ ] Enable Supabase RLS policies
- [ ] Configure R2 bucket permissions
- [ ] Set up monitoring (optional)
- [ ] Configure CDN caching headers
