# Copilot Instructions for Denuel Auto Codebase

## Overview
- **Monorepo**: Node/Express backend (TypeScript, Prisma) and Next.js frontend (TypeScript, React, Tailwind).
- **Multi-tenant**: Tenant isolation is enforced in API routes and database models.
- **AI/Automation**: AI prompt templates and endpoints in backend (see `src/routes/ai.routes.ts`, `prisma/seed-ai-templates.ts`).

## Key Directories
- `src/` — Backend app logic (Express, routes, middleware)
- `frontend/` — Next.js app (public catalog, admin UI)
- `prisma/` — Prisma schema, migrations, and seed scripts
- `pages/api/` — Next.js API routes (some legacy endpoints)
- `scripts/` — Utility scripts for build, export, and deployment

## Developer Workflows
- **Backend dev**: `npm run dev` (auto-reloads with ts-node-dev)
- **Frontend dev**: `cd frontend && npm run dev`
- **Build**: `npm run build` (backend), `cd frontend && npm run build` (frontend)
- **Test**: `npm test` (backend), `cd frontend && npm test` (frontend)
- **Prisma**: `npm run prisma:migrate` (migrate), `npm run seed` (seed data)
- **Static Export**: `cd frontend && npm run export` (for Imbra/Vercel deploy)

## CI/CD
- **GitHub Actions**: `.github/workflows/ci.yml`, `ci-cd.yml`, `deploy-vps-ssh.yml`, `package-frontend.yml`
- **Docker**: `Dockerfile` (backend), `frontend/Dockerfile` (frontend), `docker-compose.yml`
- **Deploy**: See `DEPLOYMENT.md` for VPS, AWS ECS, and Vercel/Imbra packaging

## Project Conventions
- **RBAC**: Role-based access in API (see `requireTenantRole` in API routes)
- **Validation**: Uses Zod for schema validation in API endpoints
- **AI Integration**: AI endpoints require tenant and plan checks; prompt templates are in `prisma/seed-ai-templates.ts`
- **Testing**: Jest for backend and frontend; E2E via Playwright (see `e2e/`)
- **Env Vars**: See `.env.example` and `DEPLOYMENT.md` for required variables
- **Frontend**: Uses Tailwind, Headless UI, and custom hooks/components

## Integration Points
- **Payments**: Airtel Money integration (see `README-AIRTEL-MONEY.md`)
- **External APIs**: Banking, accounting, insurance (see `WORLD_CLASS_ANALYSIS.md` for roadmap)
- **Document Generation**: Invoice and print templates in `frontend/lib/documents/`

## Patterns & Tips
- **Tenant Context**: Always pass tenant ID in API and DB queries
- **Agent Portal**: Agent-specific logic in `pages/api/tenants/[slug]/admin/agents/`
- **AI Usage**: Use `src/routes/ai.routes.ts` as reference for prompt execution and logging
- **Frontend Data Fetching**: Use `/api/hq/public/` endpoints for shared data

## References
- `README.md`, `DEPLOYMENT.md`, `WORLD_CLASS_ANALYSIS.md`, `README-AIRTEL-MONEY.md`
- Example: To add a new AI prompt, update `prisma/seed-ai-templates.ts` and reference in `ai.routes.ts`

---
For unclear or missing conventions, check the above files or ask for clarification.
