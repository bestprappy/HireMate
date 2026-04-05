# CLAUDE.md

## Project Identity

HireMate is a job portal monorepo with phased delivery.

Current implementation status:

- Frontend scaffold exists in client app.
- Backend is not fully implemented yet.
- Mobile is not fully implemented yet.

Roadmap and scope source of truth:

- README.md for MVP, V1.1, and V2 scope and effort.
- TECHSTACK.md for MVP vs Later stack decisions.

## Repository Layout

- client: Next.js frontend application.
- server: Go Fiber backend application area.
- mobile: Flutter application area.
- .claude/rules: coding and architecture rules.
- .claude/skills: reusable review and analysis skills.
- .claude/agents: specialized reviewer/refactor agents.

## Primary Build Scope

Prioritize MVP only unless explicitly requested otherwise.

MVP focus:

- Auth and role onboarding.
- Candidate profile and core job discovery.
- Recruiter job management and applicant flow.
- Admin moderation basics.
- Basic notifications and API reliability.

Keep V1.1 and V2 features out of implementation unless explicitly requested.

## Frontend Standards

Follow .claude/rules/client/code-style.md and .claude/rules/client/styling-guide.md.

Key requirements:

- Next.js App Router with TypeScript.
- Compound component pattern for complex UI.
- Reusable widgets over one-off page sections.
- Jotai for client UI state.
- TanStack Query for API and server state.
- Strong typing only. Avoid any.
- Place mock data in data.ts.
- Enforce accessibility and keyboard support.
- Use token-driven styling. Avoid default Tailwind palette for brand colors.

## Backend Standards

Follow .claude/rules/server/code-style.md, .claude/rules/server/api-conventions.md, and .claude/rules/server/testing.md.

Key requirements:

- Go 1.23+ with Fiber v2.
- Layered boundaries: handler, service, repository, domain.
- Centralized error handling.
- API versioning:
  - Public endpoints use /v1/.
  - Internal endpoints use /internal/v1/ when implemented.
- Internal endpoints require X-Internal-Auth.
- Correlation ID propagation using X-Correlation-Id.
- Error response format:
  - { status, error, message, correlationId, timestamp }
- OpenAPI is contract source of truth and must be updated with API changes.
- UTC timestamps and UUID or ULID compatible IDs.
- Use soft delete semantics in v1 where business-safe.

Production and deployment API requirements:

- Backward compatibility for active clients.
- Breaking changes require version bump and migration plan.
- Expand and contract migration strategy for zero-downtime rollouts.
- Liveness and readiness endpoints required.
- Graceful shutdown and timeout budgets required.
- Observability required: request logs and key metrics.
- Idempotency for duplicate-sensitive write operations where needed.
- Rollout safety with rollback notes for critical changes.

## Testing and Verification Standards

Frontend expectations:

- ESLint clean.
- Component and behavior tests for risky changes.
- End-to-end checks for critical flows.

Backend expectations:

- Use go test as default.
- Prefer table-driven tests.
- Add handler and integration tests where risk justifies it.
- Use testcontainers-go for realistic integration scenarios when needed.

Always verify:

- Auth and authorization behavior.
- Validation and status codes.
- Error payload contract.
- Correlation ID behavior.
- OpenAPI parity with implementation.

## Security and Secrets

- Never hardcode or commit secrets.
- Use environment variables for all sensitive values.
- Do not leak internal implementation details in API errors.

## Git and Branch Workflow

Follow .claude/rules/git-commit.md.

Key rules:

- Never commit directly to main.
- Branch from dev for feature and fix work.
- Pull latest dev before starting work.
- Commit format:
  - type(scope): short description

## Working Preferences for Agents

When making changes:

- Prefer minimal, targeted edits.
- Preserve existing architecture and style conventions.
- Update related docs when behavior or contracts change.
- Keep recommendations implementation-ready and production-safe.

When reviewing:

- Prioritize correctness, security, regression risk, and missing tests.
- Report high-confidence issues first with concrete fixes.
