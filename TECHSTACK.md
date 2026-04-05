# HireMate - Tech Stack (MVP vs Later)

Last updated: 2026-04-05

## Current Repository Baseline

The current frontend scaffold in this repository is:

- Next.js 16.2.2
- React 19.2.4
- React DOM 19.2.4
- Tailwind CSS 4.x
- TypeScript 5.x

This document reflects those corrected versions.

## MVP Stack (Build Now)

### Frontend (Web)

| Technology      | Version Target    | Purpose                                    |
| --------------- | ----------------- | ------------------------------------------ |
| Next.js         | 16.2.x            | App Router frontend framework              |
| React           | 19.2.x            | UI runtime                                 |
| TypeScript      | 5.x               | Type safety                                |
| Tailwind CSS    | 4.x               | Utility-first styling                      |
| shadcn/ui       | latest compatible | Accessible, reusable UI components         |
| Clerk           | latest compatible | Authentication and user/session management |
| React Hook Form | latest compatible | Form state handling                        |
| Zod             | latest compatible | Schema validation                          |
| TanStack Query  | latest compatible | Server state and data fetching             |
| Jotai           | latest compatible | Lightweight client state                   |
| lucide-react    | latest compatible | Icon set                                   |
| next-themes     | latest compatible | Theme switching                            |

### Backend (API)

| Technology              | Version Target    | Purpose                             |
| ----------------------- | ----------------- | ----------------------------------- |
| Go                      | 1.23+             | Core backend language               |
| Fiber                   | v2.x              | HTTP API framework                  |
| PostgreSQL              | 16+               | Primary relational database         |
| pgx                     | v5.x              | PostgreSQL driver and pooling       |
| sqlc                    | latest stable     | Type-safe DB access code generation |
| golang-migrate          | v4.x              | Database migrations                 |
| go-playground/validator | v10.x             | Request and domain validation       |
| Clerk Go SDK            | latest compatible | Token verification and auth context |
| caarlos0/env            | v11.x             | Environment config parsing          |
| log/slog                | stdlib            | Structured logging                  |

### Platform Services (MVP)

| Service         | MVP Decision                           | Purpose                                      |
| --------------- | -------------------------------------- | -------------------------------------------- |
| Email           | Resend                                 | Transactional emails (verification, updates) |
| Storage         | S3-compatible bucket                   | Resume and media uploads                     |
| Security edge   | Arcjet (optional in MVP)               | Rate limiting and bot protection             |
| Background jobs | In-process worker or lightweight queue | Async emails, cleanup tasks                  |
| API docs        | OpenAPI 3 + oapi-codegen               | Contract-first API docs and codegen          |
| Observability   | OpenTelemetry (minimal)                | Traces and metrics baseline                  |

### Dev Experience and Quality (MVP)

| Area              | Tooling                                         |
| ----------------- | ----------------------------------------------- |
| Frontend linting  | ESLint                                          |
| Frontend tests    | Vitest + React Testing Library                  |
| E2E tests         | Playwright                                      |
| Backend tests     | Go test (table-driven), integration tests       |
| Local environment | Docker Compose (db, cache, supporting services) |
| CI                | GitHub Actions (lint, test, build)              |

## Later Stack (After MVP)

### V1.1 Candidates

- Inngest for event-driven workflows once job volume grows
- UploadThing if upload flow complexity grows faster than expected
- Stronger notification pipeline for digest and batched delivery
- Search enhancements beyond PostgreSQL full-text (if relevance quality is not enough)

### V2 Candidates

- Flutter mobile app stack (version targets below)
- Advanced AI services for recommendation, resume scoring, and interview prep
- Billing and subscription platform integration
- Multi-tenant enterprise controls (SSO/SAML, advanced audit, retention policies)
- Deeper observability and SLO tooling

### Mobile (V2 Version Targets)

| Technology | Version Target                        | Purpose                                   |
| ---------- | ------------------------------------- | ----------------------------------------- |
| Flutter    | 3.x (stable channel, pinned with FVM) | Cross-platform mobile app framework       |
| Dart       | 3.x (from pinned Flutter SDK)         | Mobile language runtime                   |
| Riverpod   | 3.x                                   | State management and dependency injection |

## Stack Governance Rules

- Keep MVP stack lean. Do not add new infrastructure unless it removes a clear blocker.
- Favor compatibility with Next.js 16 and React 19 for all frontend dependencies.
- Any major new dependency must include: use case, owner, rollback plan, and operating cost.
