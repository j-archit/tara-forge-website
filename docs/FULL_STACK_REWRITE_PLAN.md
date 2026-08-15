# TaraForge3D Full-Stack Rewrite Plan

Status: approved for implementation (amended to require a Python/pytest backend)

Target repository: `tara-forge-website`

Implementation branch: `feat/full-stack-rewrite`

## 1. Objective

Turn the existing static marketing site and separate intake-management application into one cohesive TaraForge3D product:

- one repository;
- one public website and origin;
- one deployment and operational runbook;
- public pages and quote workflow under `taraforge.in`;
- a protected administration area under `taraforge.in/admin`;
- a rewritten Python/FastAPI backend housed in the same repository and exposed only through the website's same-origin API boundary;
- a durable Python background worker for slicing and external synchronization;
- preservation of the current public visual design and user-facing content;
- preservation and migration of existing intake data and uploaded models.

The rewrite replaces the existing FastAPI implementation and separate Vite administration application after feature parity and migration are verified. The backend remains Python so its contract, worker, and integration behavior can be covered directly with pytest. The old intake application remains untouched and runnable until cutover is complete.

## 2. Product shape

```text
taraforge.in
├── /                     Public marketing site
├── /services             Public services
├── /gallery              Public gallery
├── /shop                 Public catalogue
├── /team                 Public team page
├── /quote                Public project intake
├── /admin/login          Administrator authentication
├── /admin                Operations dashboard
├── /admin/submissions    Submission management
├── /admin/clients        Client management
├── /admin/slicer         Slicer profiles and runs
├── /admin/templates      Email templates
├── /admin/system         Job, integration, and log status
└── /api/*                Same-origin application API
```

The browser sees one application and one origin. Internally, production runs the Next.js web process, a private FastAPI process, and a Python background-worker process from one repository and one Compose deployment. This separation keeps long-running CuraEngine and Google operations out of HTTP request handling without creating a second product or separately operated deployment.

## 3. Proposed technical baseline

These are the proposed defaults to approve before implementation begins.

| Concern | Proposed choice | Reason |
| --- | --- | --- |
| Application | Next.js App Router and TypeScript | Already used by the public site; supports pages and server endpoints in one codebase. |
| Runtimes | Node.js for Next.js; Python 3.12 for FastAPI and the worker | Preserves the existing UI stack while making backend behavior directly testable with pytest. |
| Database | PostgreSQL 17 through SQLAlchemy/Alembic | Supports concurrent workers, managed-content growth, stronger operational tooling, and future horizontal scaling. |
| Schema/migrations | SQLAlchemy 2 and Alembic | Mature Python data layer with explicit, versioned migrations and a straightforward path to PostgreSQL. |
| Upload format | Streaming `multipart/form-data` | Avoids the roughly 33% size expansion and memory duplication caused by the current Base64 JSON upload. |
| File storage | Local persistent volume behind a storage interface | Matches the current vault and single-host deployment; permits later S3-compatible storage without changing UI/API contracts. |
| Background work | Database-backed jobs plus a dedicated Python worker | Durable retries and restart recovery without adding Redis or a hosted queue. |
| Authentication | Single-admin credential login with hashed password and server-side session records | Simple initial operations model with proper revocation, expiry, and protected server routes. |
| Reverse proxy/TLS | Caddy or equivalent in the deployment stack | Automatic HTTPS, request-size limits, and one public origin. |
| Packaging | Separate web/backend images orchestrated by one Docker Compose project | One reproducible deployment for web, private API, worker, persistent data, and proxy. |
| Backend tests | pytest, pytest-asyncio, HTTPX, and isolated temporary databases | Covers API, services, jobs, integrations, and migration behavior in the backend's native runtime. |
| Frontend tests | Vitest, React Testing Library, and browser-flow QA | Covers components and client behavior while retaining the existing UI. |

PostgreSQL is the production database. Workers claim jobs with row locks and `SKIP LOCKED`; local pytest may use SQLite only as a fast disposable fallback, while CI validates the full suite against PostgreSQL 17.

## 4. Non-goals for this rewrite

- Redesigning the public marketing UI.
- Rebranding or rewriting approved website copy.
- Building customer accounts or a customer-facing order portal.
- Adding payments, checkout, inventory, or fulfilment management.
- Implementing a full CRM.
- Supporting multiple application servers during the first production release.
- Deleting the old intake-management repository before successful cutover and rollback-window completion.

## 5. Target domain model

The initial schema should include:

### `admins`

- id
- email or username
- password hash
- active flag
- created and updated timestamps
- last-login timestamp

### `sessions`

- opaque session identifier hash
- administrator id
- expiry timestamp
- created timestamp
- last-seen timestamp

### `clients`

- id
- normalized unique email
- display name
- phone, if added later
- created and updated timestamps

### `submissions`

- UUID
- client id
- project type
- requested material
- description
- original filename
- stored-file key/path
- media type and byte size
- file checksum
- overall status
- slicer status and latest estimates
- Drive and Sheets synchronization statuses
- created and updated timestamps

### `slicer_profiles`

- id
- material
- profile name
- version
- configuration JSON
- active flag
- created and updated timestamps

### `slicer_runs`

- id
- submission id
- slicer-profile version
- effective settings JSON
- print time
- filament usage
- CuraEngine output summary
- status and error
- created and completed timestamps

### `jobs`

- id
- type
- submission id, when applicable
- payload JSON
- status
- attempt count and maximum attempts
- available-at timestamp
- lease owner and lease expiry
- last error
- created, started, and completed timestamps

### `email_templates`

- key
- subject template
- body template
- version
- updated timestamp and administrator id

### `audit_events`

- id
- administrator id, when applicable
- event type
- entity type and id
- safe metadata JSON
- timestamp

Secrets, uploaded model content, credentials, and complete email bodies must not be written to audit metadata.

## 6. API boundaries

### Public API

`POST /api/intake`

- accepts `multipart/form-data`;
- validates text fields and a single optional model file;
- enforces an explicit byte limit at both proxy and application levels;
- normalizes and sanitizes the original filename;
- verifies allowed extensions and inspects file signatures where practical;
- stores the file under a generated identifier, never under a user-supplied path;
- creates the client, submission, and first processing job transactionally;
- returns a submission reference and safe status only;
- supports an idempotency key to reduce duplicate submissions;
- is protected by honeypot, rate limiting, and a deploy-time-selectable challenge mechanism.

### Authentication API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

Sessions use `HttpOnly`, `Secure`, and appropriate `SameSite` cookies. Login responses must not reveal whether a particular administrator account exists.

### Protected administration API

- `GET /api/admin/submissions`
- `GET /api/admin/submissions/:id`
- `POST /api/admin/submissions/:id/slice`
- `GET /api/admin/submissions/:id/runs`
- `GET /api/admin/clients`
- `GET /api/admin/clients/:id`
- `GET /api/admin/slicer/profiles`
- `GET /api/admin/slicer/profiles/:material/:name`
- `PUT /api/admin/slicer/profiles/:material/:name`
- `DELETE /api/admin/slicer/profiles/:material/:name`
- `GET /api/admin/templates`
- `PUT /api/admin/templates`
- `GET /api/admin/email/:submissionId`
- `GET /api/admin/jobs`
- `POST /api/admin/jobs/:id/retry`
- `GET /api/admin/system/health`

Every administration handler checks the server-side session. Mutating handlers additionally apply same-origin/CSRF protection and create audit events.

## 7. Background processing model

The HTTP request ends after durable submission and job creation. A worker claims and processes jobs using leases so an interrupted job becomes available again.

Initial job stages:

1. Validate the stored file and determine whether it can be sliced.
2. Run CuraEngine with an immutable snapshot of the selected profile.
3. Parse and persist print-time and material estimates.
4. Upload the original file to Google Drive.
5. Append or update the Google Sheets record.
6. Mark the submission complete or record a partial-failure state.

Requirements:

- each stage is idempotent;
- retries use bounded exponential backoff;
- permanent and retryable failures are distinguished;
- job leases recover after worker termination;
- the administration UI can inspect and manually retry failures;
- external identifiers are saved immediately after successful external calls;
- a repeated job does not create duplicate Drive files or Sheets rows where preventable;
- worker shutdown completes or safely releases the current lease.

## 8. Delivery phases

Each phase ends with tests, documentation, and a reviewable commit. Later phases do not silently broaden the agreed scope.

### Phase 0 — Baseline and safety net

Goal: establish reproducible evidence that the existing public UI is preserved.

Work:

- document current routes, environment inputs, API behavior, data files, and deployment assumptions;
- capture responsive screenshots of the public pages and quote states;
- record the current SQLite schema and counts without modifying data;
- inventory vault files and record checksums;
- identify and rotate the tracked Google service-account credential before production use;
- add lint, type-check, unit-test, and build commands to the expected verification workflow;
- define supported Node.js, CuraEngine, and Docker versions.

Acceptance criteria:

- public-route and visual baselines are stored;
- old data can be inventoried repeatedly;
- no secret is required in source control;
- implementation can be compared objectively with the current application.

Estimate: 1–2 working days.

### Phase 1 — Dynamic single-site application skeleton

Goal: turn the static Next.js project into a deployable application with a private FastAPI service, without changing the public UI.

Work:

- remove static-export mode;
- add production standalone-output configuration;
- add typed environment validation;
- introduce a `backend/` package for the private API, database access, storage, jobs, and integrations;
- add health/readiness endpoints;
- create multi-stage Docker packaging and a local production-like Compose stack;
- ensure public routes retain metadata, canonical URLs, analytics, and asset behavior.

Acceptance criteria:

- all current public pages render with no intended visual differences;
- development, test, and production builds succeed;
- server-only modules cannot be imported into client bundles;
- health and readiness checks distinguish process health from dependency readiness.

Estimate: 1–2 working days.

### Phase 2 — Database, migrations, and repository layer

Goal: create the new durable data foundation.

Work:

- implement the approved schema and initial migration;
- configure PostgreSQL connection health, migrations, constraints, and transactional helpers;
- implement typed repositories for clients, submissions, profiles, runs, jobs, templates, sessions, and audit events;
- seed default PLA and TPU profiles and the estimate email template;
- add database backup and restore commands;
- test transactions, uniqueness rules, job claiming, and concurrent access.

Acceptance criteria:

- a clean database can be created entirely from migrations;
- backups can be restored and verified;
- job claiming does not allow two workers to own the same lease;
- repository tests do not depend on production data.

Estimate: 2–3 working days.

### Phase 3 — Authentication and administration shell

Goal: establish a protected `/admin` area before exposing operational data.

Work:

- implement administrator bootstrap/reset procedure;
- implement password hashing, sessions, login, logout, expiry, and revocation;
- add route protection for admin pages and APIs;
- port the existing dashboard shell, navigation, and visual styling into the Next.js application;
- make the admin layout responsive enough for tablet use while preserving its visual identity;
- add audit events for authentication and administrative mutations.

Acceptance criteria:

- anonymous users cannot retrieve admin HTML data or call admin APIs;
- session cookies use production security attributes;
- logout and forced revocation invalidate access;
- login is rate-limited;
- dashboard navigation works under `/admin` without a second frontend application.

Estimate: 2–3 working days.

### Phase 4 — Public intake and secure file storage

Goal: replace the Base64 relay with a robust same-origin upload flow.

Work:

- implement `POST /api/intake` using multipart upload handling;
- create the local persistent storage adapter;
- update the existing quote UI to submit multipart data while preserving its appearance and analytics events;
- enforce server and proxy size limits;
- validate names, email, material, project type, description, filename, extension, media type, and file content where possible;
- add honeypot, rate limiting, idempotency, and optional challenge hooks;
- provide accessible progress, success, and failure states;
- transactionally create submission and initial job records.

Acceptance criteria:

- supported files can be uploaded from the unchanged quote UI;
- oversize and unsupported files fail safely with useful messages;
- interrupted or duplicate requests do not produce inconsistent records;
- user-supplied paths cannot escape the vault;
- no server credential is included in the browser bundle.

Estimate: 2–3 working days.

### Phase 5 — Python slicing and durable worker

Goal: replace the Python slicing/background-task path.

Work:

- implement the Python worker command and lease loop;
- invoke CuraEngine through a constrained child process without shell interpolation;
- port profile selection, overrides, output parsing, time estimation, and filament estimation;
- version profile snapshots used by each run;
- persist output, warnings, status, and failures;
- implement retries and manual retry support;
- add fixtures for representative CuraEngine output;
- bound execution time, captured output size, and temporary-file lifetime.

Acceptance criteria:

- estimates match the old implementation within an agreed tolerance on reference models;
- a worker restart recovers leased jobs;
- failed slicing does not prevent later Drive/Sheets processing unless explicitly configured;
- malicious filenames or profile values cannot alter the executed command;
- temporary artifacts are cleaned after success and failure.

Estimate: 3–5 working days.

### Phase 6 — Google Drive and Sheets integration

Goal: replace the legacy Google integration with idempotent, tested Python integrations.

Work:

- load service-account credentials only from deployment secrets;
- implement Drive upload with persisted external identifiers;
- implement Sheets append/update with a stable submission identifier;
- define retryable Google API errors;
- add integration status and diagnostic metadata without leaking secrets;
- implement test doubles and optional sandbox integration tests.

Acceptance criteria:

- successful submissions reach Drive and Sheets once;
- retries do not create uncontrolled duplicates;
- partial failures are visible and recoverable from admin;
- production credentials never appear in logs, fixtures, commits, or client code.

Estimate: 1–2 working days.

### Phase 7 — Administration feature parity

Goal: complete the integrated administration experience using the existing UI as the visual baseline.

Work:

- submissions list, filtering, sorting, status, and detail view;
- clients list and client submission history;
- manual slicing and historical slicer runs;
- slicer profile list, create, update, and delete;
- email-template editor and estimate generation;
- job/failure inspection and manual retry;
- useful system health and integration status;
- replace ad hoc browser alerts with consistent feedback;
- add empty, loading, unauthorized, and error states.

Acceptance criteria:

- every existing useful dashboard function has an equivalent integrated workflow;
- the two currently missing backend contracts—submission listing and profile deletion—are implemented and tested;
- administrative changes are audited;
- no admin request targets the retired FastAPI application.

Estimate: 3–4 working days.

### Phase 8 — Production operations and hardening

Goal: make the single application safe to operate on one small persistent host.

Work:

- complete Compose services for reverse proxy, web, and worker;
- configure named persistent volumes for database, vault, and backups;
- configure HTTPS, security headers, body-size limits, and log rotation;
- add scheduled database and vault backups with retention;
- add health monitoring and disk-space checks;
- document install, deploy, upgrade, backup, restore, credential rotation, and disaster recovery;
- run dependency, container, and application security checks;
- perform accessibility and responsive regression checks.

Acceptance criteria:

- a new host can be deployed from the repository and documented secrets;
- web and worker restarts do not lose accepted work;
- a backup can be restored into a clean deployment;
- admin and uploads work through the production reverse proxy;
- the public website remains available if the worker is temporarily unhealthy.

Estimate: 2–3 working days.

### Phase 9 — Data migration and rehearsal

Goal: migrate existing operational data with evidence and a rollback path.

Work:

- write a repeatable importer for the old SQLite database, profiles, templates, and vault;
- map legacy status values and normalize client emails;
- preserve original submission identifiers where safe;
- copy files using generated destination keys and verify checksums;
- produce a migration report containing counts, rejected rows, missing files, and checksum results;
- rehearse against a copy of production data;
- perform admin acceptance testing on migrated records.

Acceptance criteria:

- source and destination record counts reconcile or every difference is documented;
- all expected uploaded files verify by checksum;
- the migration can be rerun safely against a fresh destination;
- the old system is not modified by the importer;
- rollback steps are tested before cutover.

Estimate: 2–3 working days.

### Phase 10 — Cutover and retirement

Goal: switch production safely and retire obsolete application surfaces after a defined observation period.

Work:

- announce and enforce a short intake freeze;
- take final database and vault backups;
- run the final migration and reconciliation;
- deploy the dynamic application and update DNS;
- run public intake, admin, slicing, Drive, Sheets, email, restart, and backup smoke tests;
- monitor errors, disk, jobs, and submission completion closely;
- retain the old stack in a stopped, recoverable state during the rollback window;
- after approval, archive the old intake frontend/backend and remove dead relay/static-deployment configuration.

Acceptance criteria:

- the public site and admin area use one production origin;
- a real controlled submission completes end-to-end;
- no new data is written to the retired stack;
- rollback criteria and the rollback deadline are explicit;
- retirement happens only after owner approval.

Estimate: 1–2 working days plus the observation window.

## 9. Test strategy

### Backend tests with pytest

- API contracts, validation, and normalization;
- filename and storage-key safety;
- email-template rendering;
- CuraEngine output parsing;
- status transitions and retry classification;
- authentication/session helpers;
- Google payload construction;
- migration mapping;
- authentication, authorization, and CSRF behavior;
- isolated database fixtures and transaction behavior.

### Frontend tests

- Vitest for utilities, validation, API clients, and state transitions;
- React Testing Library for the quote form and administration components;
- accessibility-oriented queries for interactive controls;
- mocked network tests for success, validation, unauthorized, and retry states.

### Repository and integration tests

- migrations and transactional intake creation;
- job claiming, leasing, expiry, and retry;
- storage adapter behavior;
- route handlers with authenticated and unauthenticated requests;
- worker execution using a fake CuraEngine binary;
- Google integrations using test doubles;
- migration importer against a sanitized legacy fixture.

### Browser tests

- public navigation and responsive rendering;
- quote submission with and without a file;
- invalid and oversize upload behavior;
- admin login/logout and session expiry;
- submission/client browsing;
- profile editing and manual slicing;
- job inspection and retry;
- visual comparisons for the preserved public UI.

### Production smoke tests

- health/readiness;
- controlled intake submission;
- persisted upload after restart;
- completed slicing estimate;
- Drive and Sheets synchronization;
- admin access and unauthorized denial;
- backup creation and sample restore.

## 10. Migration and rollback principles

- The old intake-management application is read-only during final migration and remains recoverable during the rollback window.
- Migration scripts are committed, repeatable, and produce machine-readable reports.
- No destructive schema conversion is run against the original database.
- DNS changes are the last step after rehearsal and validation.
- Rollback restores the old routing and reopens the old application only if data written to the new system is reconciled deliberately.
- The Google credential currently present in repository history is considered compromised until rotated.

## 11. Expected repository structure

```text
tara-forge-website/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── jobs/
│   │   ├── storage/
│   │   ├── slicing/
│   │   └── integrations/
│   ├── migrations/
│   └── tests/
├── docs/
├── scripts/
│   ├── backup/
│   └── migrate-legacy/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   │   ├── public/
│   │   └── admin/
│   └── test/
├── Dockerfile.web
├── Dockerfile.backend
└── compose.yaml
```

The final layout may be adjusted to follow existing project conventions, but server-only code, browser code, and worker entry points must remain clearly separated.

## 12. Estimated total effort

Expected implementation effort: **19–30 focused working days**, approximately **4–6 calendar weeks** with review time and production observation.

The main uncertainty is CuraEngine equivalence across real models and profiles. Data migration and Google idempotency are the next-largest risks. The public UI itself is a low-risk part of the rewrite because it remains in place.

## 13. Review gates

Implementation should not begin until the owner approves:

1. the proposed technical baseline, especially PostgreSQL, SQLAlchemy/Alembic, and single-host deployment;
2. whether administration is single-user initially;
3. maximum upload size and supported file formats;
4. whether bot protection beyond honeypot and rate limiting is required at launch;
5. whether Google Drive and Sheets remain authoritative integrations or become secondary exports;
6. the required rollback observation window;
7. the expected hosting budget and target provider;
8. whether the `/shop` area remains informational during this rewrite. Resolved: listings and availability are managed from the rebuilt admin workspace.

Once approved, implementation starts at Phase 0 and proceeds through reviewable phase branches/commits. No legacy service is retired until the final cutover gate.
