# HireMate

Job portal platform with phased delivery.

## Current Status

- Frontend: Next.js scaffold exists in client app.
- Backend: Not implemented yet (placeholder only).
- Mobile: Not implemented yet (placeholder only).

## Roadmap Strategy

This roadmap is split into three planned releases:

- MVP: Core job marketplace flow for candidates, recruiters, and admin moderation.
- V1.1: Workflow depth, stronger communication, and quality improvements.
- V2: AI, monetization, enterprise controls, and mobile expansion.

Effort estimates are planning estimates, not commitments.

## Assumptions Behind Estimates

- Team shape: 2 engineers full-time + 1 designer part-time + 1 QA part-time.
- Sprint length: 2 weeks.
- Calendar estimates include basic QA and bug fixing.
- High-risk integrations can move features to the next release.

## MVP Roadmap

### MVP Goal

Deliver a reliable end-to-end hiring flow:

- Candidate can sign up, build profile, search jobs, save jobs, and apply.
- Recruiter can create company profile, post jobs, and manage applicants.
- Admin can moderate jobs and basic platform safety.

### MVP Scope

#### Public and Candidate

- Landing page and public job listing pages
- Search jobs by keyword and core filters (location, remote type, job type)
- Job detail page and shareable public URL
- Candidate auth and role-based onboarding
- Candidate profile management (basic fields)
- Save jobs and apply to jobs
- Application status tracking

#### Recruiter

- Recruiter registration and company profile setup
- Job CRUD (create, edit, publish, close)
- Applicant list per job
- Status updates through core pipeline stages

#### Admin

- Job moderation queue
- Approve/reject/takedown controls for suspicious posts

#### Platform

- Basic email notifications
- Basic audit logging for sensitive actions
- Core API documentation

### MVP Effort Estimate

| Workstream | Estimated Effort | Notes |
|---|---|---|
| Product and UX foundation | 1-2 weeks | IA, flows, wireframes |
| Frontend app shell and auth | 2-3 weeks | Role gates, protected routes |
| Backend API and database core | 3-4 weeks | Users, jobs, applications |
| Search and filter experience | 1-2 weeks | PostgreSQL-first approach |
| Apply flow and tracking | 2 weeks | Candidate and recruiter views |
| Admin moderation | 1 week | Basic moderation controls |
| QA hardening and release prep | 1-2 weeks | Regression and stabilization |

- Total engineering effort: about 12-16 engineer-weeks
- Expected calendar duration: about 8-12 weeks
- Confidence: Medium

## V1.1 Roadmap

### V1.1 Goal

Increase hiring workflow quality and reduce manual recruiter workload.

### V1.1 Scope

- Screening questions and knockout rules
- Recruiter notes, tags, and bulk applicant actions
- Candidate dashboard upgrades (timeline and recommendations)
- Saved searches and alerts
- Better notification preferences and digest emails
- Recruiter analytics baseline (views, applicants, conversion)
- Resume upload improvements and file handling hardening
- Interview scheduling foundations (calendar sync first pass)

### V1.1 Effort Estimate

| Workstream | Estimated Effort | Notes |
|---|---|---|
| Workflow enhancements | 2-3 weeks | Screening and pipeline quality |
| Communication and notifications | 1-2 weeks | Preferences, digests, templates |
| Analytics and reporting baseline | 1-2 weeks | Recruiter and admin metrics |
| Interview scheduling foundation | 2 weeks | Calendar integration first pass |
| QA, migration, rollout | 1-2 weeks | Data and UX stabilization |

- Total engineering effort: about 10-14 engineer-weeks
- Expected calendar duration: about 6-9 weeks
- Confidence: Medium

## V2 Roadmap

### V2 Goal

Expand into premium capabilities and enterprise readiness.

### V2 Scope

- AI-powered recommendations and scoring
- Resume parsing and profile enrichment
- Advanced recruiter analytics and funnel intelligence
- Billing/subscriptions and paid job promotion
- Enterprise controls (SSO/SAML, stronger audit, policy controls)
- Multi-company support and advanced permissions
- Mobile app implementation (Flutter)
- Ecosystem integrations (ATS/HRIS/webhooks)

### V2 Effort Estimate

| Workstream | Estimated Effort | Notes |
|---|---|---|
| AI features and model operations | 4-6 weeks | Cost and quality controls needed |
| Monetization and billing | 2-3 weeks | Plan, credits, invoices |
| Enterprise and compliance | 3-4 weeks | Access, retention, audit controls |
| Mobile app foundation | 4-6 weeks | Auth, listings, apply flow |
| Deep integrations | 2-4 weeks | Calendar, ATS, webhook strategy |
| QA and performance hardening | 2-3 weeks | Scalability and reliability |

- Total engineering effort: about 24-36 engineer-weeks
- Expected calendar duration: about 14-22 weeks
- Confidence: Low-Medium (depends on integration risk)

## Release Gates

Each release should pass these gates before launch:

- Functional completeness for planned scope
- Security checks on auth, permissions, and data handling
- Performance baseline for search and apply flows
- Regression suite passing in CI
- Observability dashboard and alert readiness

## Out of Scope for MVP

The following stay out of MVP unless they become a blocking business requirement:

- Full in-app chat
- Full enterprise SSO and white-labeling
- Advanced AI tooling and interview automation
- Complex billing plans and marketplace modules
- Native mobile production release
