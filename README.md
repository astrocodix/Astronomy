# ASTROVERSE ACADEMY

### Learn the Universe. Understand Everything.

A working, bilingual astronomy academy built with Next.js, React, TypeScript and Prisma. English and Arabic/RTL, persistent light/dark preferences, real learner records, an assessment engine, a protected content studio, and an optional server-side AI tutor.

**Delivery status: functional first-stage pilot, not a fully authored twelve-stage degree programme.** The roadmap contains all 12 stages and 146 modules. Stage 1 has 16 substantial bilingual lessons across 8 modules. Stages 2–12 are clearly marked as in development. All pilot teaching and questions still require independent scientific and Arabic editorial approval before public release.

[دليل البدء بالعربية](docs/START-AR.md) · [Deployment](docs/DEPLOYMENT.md) · [Testing](docs/TESTING.md) · [Content & review](docs/CONTENT.md) · [Security](docs/SECURITY.md) · [Sources & rights](docs/SOURCES-AND-RIGHTS.md)

## What works

- **Learning workspace:** dashboard, complete roadmap, courses/modules, lesson navigation, bookmarks, search, study goals, activity, notifications, profile and settings. Statistics start at zero and come from the database; there are no fabricated students or achievements.
- **Stage 1:** 16 lessons, each with 10 teaching sections, objectives, terms, beginner/intermediate/advanced explanations, worked examples, misconceptions, guided investigations, source links, summaries and linked assessment. Approximately 774–895 English words and 584–685 Arabic words of teaching per lesson; estimated 17–18 minutes includes activities.
- **Assessment bank:** 864 records, including concept variants; 108 per first-stage module and 52–56 per lesson. Twelve answer formats are rendered and graded. This is **not** a claim of 864 independently reviewed concepts. Free-response reasoning is labelled provisional practice and excluded from timed examinations and mastery evidence.
- **Exams:** lesson quick/standard/advanced 10/20/30; module 50; stage 100. Server-selected questions and shuffled options, a 30/40/30 difficulty target, repeat reduction, saved drafts, timer/expiry, flags, results, explanations, topic performance and revision guidance. Answers are not sent before submission. The default pass threshold is 70%.
- **Progress:** persisted attempts, study time, prerequisites, concept-based mastery with repeated-check confidence, genuine achievements, and downloadable non-accredited completion certificates. Registration upgrades the current guest identity instead of resetting its progress.
- **ASTRO AI:** server-only OpenAI-compatible Chat Completions/SSE integration, source context, learner context, five explanation modes, quotas, history and cancellation/error handling. **No live paid provider was configured or verified for this delivery.** Without a key, the working reference mode is explicitly labelled as retrieved academy excerpts, not generated AI. Provider success is shown only after a complete successful response from the current configuration.
- **Observatory:** interactive orbital schematic, planet comparison, Moon-phase model, constellation patterns/star search, galaxy morphology, cosmic-scale illustrations, Schwarzschild-radius control, and five locally cached attributed scientific image products. These are educational models, **not live ephemerides, an accurate planetarium, or a daily-image feed**.
- **Content studio:** Student/Instructor/Admin authorization; bilingual lesson and question authoring; all 12 question formats; curriculum editing; media uploads and metadata; references; review/publishing gates; user roles and settings for administrators; audit trail. Assessed questions are immutable—duplicate them to create a new version.
- **Database:** five migrations each for SQLite and PostgreSQL. PostgreSQL 17.11 fresh-install and application smoke verification passed. Database backup and isolated restore checks passed for both providers.

## Quick start — local SQLite

Use a maintained Node.js release (Node 22 LTS recommended) and npm. The verification environment used Node 20.20.2. No API key is needed to explore the lessons, exams, reference tutor or cached media.

```bash
npm ci
cp .env.example .env
```

Edit `.env`. Set a unique `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` of at least 12 characters if you want an administrator. **There is no public default admin password.** Do not put real credentials in source control.

```bash
npm run setup
npm run dev
```

Open `http://localhost:3000`.

- `/` — student dashboard; `/welcome` — public introduction.
- `/lesson/l-1-1` — first lesson.
- `/login` — sign in; `/register` — save the current guest journey.
- `/admin` — content studio, after signing in with your own instructor/admin account.

The default `DATABASE_URL="file:./academy.db"` resolves to **`prisma/academy.db`**, relative to the SQLite schema. `setup` generates Prisma Client, applies migrations and inserts missing seed content. Rerunning the seed does not overwrite existing accounts, progress, settings or editorial changes. Changing the bootstrap password in `.env` does **not** rotate an existing account's password; use Settings or the recovery workflow.

`CONTENT_PREVIEW=true` exposes the explicitly labelled, unreviewed pilot. Set it to `false` for a reviewed launch. With it disabled, pending lessons/questions are intentionally hidden until approved. Draft imports remain hidden even in preview mode.

### Production build

```bash
npm run build
npm run start
```

On a small-memory machine, stop the development server first:

```bash
NODE_OPTIONS=--max-old-space-size=650 npm run build
```

The server binds to `0.0.0.0:3000`; the application uses same-origin API URLs. Build and run with the same database provider. See the deployment guide for PostgreSQL, persistent uploads, TLS, backups and release gates.

## Optional external services

### AI tutor

Set `OPENAI_API_KEY` and `AI_BASE_URL` on the **server**, then restart. The provider must support the Chat Completions streaming contract used in `src/lib/tutor.ts`; production requires HTTPS. `AI_MODEL` and `AI_DAILY_LIMIT` initialize database settings on the first seed only. For an existing installation, set the runtime model and quota in the admin studio. The separate draft-generation CLI uses `AI_MODEL` when supplied, otherwise the stored model.

Test an English and an Arabic conversation, history, cancellation and provider failure against your actual provider before announcing live AI availability. Linked sources do not imply that NASA, OpenStax or another publisher wrote, approved or endorsed an AI response. Respect provider privacy terms and spending controls.

### Password recovery email

Set `RESEND_API_KEY`, a verified `MAIL_FROM`, and the externally reachable `APP_URL`. Recovery uses expiring, hashed, single-use tokens and invalidates sessions on reset. Unconfigured delivery produces an honest unavailable response, not a fake “email sent.” **Real delivery was not tested here.**

## Verification

```bash
npm test                 # unit + isolated integration tests
npm run content:validate
npm run typecheck
npm run build
```

Browser tests require a **separate disposable test server**, not the learner database. See [Testing](docs/TESTING.md) for the safe commands and recorded scope.

Verification artifacts include `tests/test.log`, `tests/build.log`, `tests/browser-report.json`, `tests/browser-findings.json`, `tests/postgres-report.json`, `tests/backup-report.json` and `docs/content-report.json`. Screenshots are in `tests/screenshots/`. A fresh source-archive installation also passed dependency installation, all five SQLite migrations/seeding, standalone typechecking, unit/integration tests and the production build (`tests/fresh-install-report.json`). Automated checks are not an independent scientific review, an accessibility certification, or a security penetration test.

## Draft generation and review

```bash
# Offline, original authored pilot export; no provider calls.
npm run content:generate -- --export-seed --module m-1-1 --out drafts/module-1.json

# Validate an import without modifying the database.
npm run content:import -- --file drafts/module-1.json

# Explicit, bounded paid generation; never automatically publishes.
npm run content:generate -- --ai --lesson l-1-1 --count 20 --out drafts/questions.json
```

Imports require explicit `--apply --actor-email <existing-educator-email>` to create **new DRAFT/PENDING** records, and always require subsequent human review. Offline export of an existing module followed by an applied import creates a second draft version; it is not an update command. See [Content & review](docs/CONTENT.md).

## Project map

```text
src/app/                    Next routes, layout, theme and responsive styles
src/components/             Bilingual learner experience and protected editor
src/content/                Authored curriculum, lessons, glossary, questions, references
src/lib/                    Auth, validation, learning, examinations, tutor and API
prisma/schema.prisma        SQLite development schema
prisma/migrations/          SQLite migration history (001–005)
prisma/postgresql/           PostgreSQL schema and separate migration history (001–005)
prisma/seed.ts              Preservation-only seed/bootstrap
public/images/              Cached scientific media + canonical attribution registry
public/fonts/               Local Inter/Cairo fonts + OFL license notices
storage/uploads/            Runtime uploaded media; persist and back up this volume
scripts/                    Database, backups, validation, draft and test tooling
tests/                      Unit, integration, browser and PostgreSQL verification
docs/                       Operation, editorial, security, rights and audit reports
```

## Before a public launch

1. Complete independent scientific, pedagogical, Arabic and media-rights review; publish through the review gates, then disable content preview.
2. Configure and genuinely verify the intended AI/email providers, or clearly retain reference-only and unavailable-email modes.
3. Deploy to HTTPS with PostgreSQL, persistent media storage, encrypted off-host backups and monitoring. Perform your own full disaster-recovery drill.
4. Review security hardening, data-retention/privacy policy, account deletion procedures and policies for minors; add MFA/SSO if your deployment requires them.
5. Conduct manual keyboard/screen-reader, cross-browser, real-device and load testing. Later-stage teaching, capstone evaluation and accredited certification are **not** completed by this pilot.

The source package excludes private databases, backups, credentials, user uploads, caches and dependencies. Fresh installation reconstructs the authored pilot from the source and migrations. Third-party media and fonts retain their own terms; see [Sources & rights](docs/SOURCES-AND-RIGHTS.md).
