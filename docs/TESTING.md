# Verification and reproducible testing

## GitHub Pages static edition

These checks operate on the separate static export and do **not** need a database, credentials, or the full application test server. Test both the repository subpath and any domain-root deployment relevant to your Pages configuration:

```bash
npm ci
NEXT_PUBLIC_BASE_PATH=/Astronomy npm run pages:build
NEXT_PUBLIC_BASE_PATH=/Astronomy npm run test:pages
# Once Chromium and its platform libraries are installed:
NEXT_PUBLIC_BASE_PATH=/Astronomy npm run test:pages:browser
```

The first test checks the exported routes, asset prefixes, review notices and availability of the 12 stages and 16 lessons. The browser suite serves the actual export on a local test port, exercises deep links/reloads, local reading marks, search, English/Arabic and RTL, themes, mobile navigation and observatory controls, and samples automated accessibility checks. It does not certify accessibility or test the unavailable server features. Repeat with an empty prefix when deploying at the origin root. The Pages workflow runs the build and file-level checks; the browser suite can be run separately.

## Use an isolated development checkout

Tests create synthetic learners, scores, approvals and certificates **only in disposable databases**. These are software fixtures, not student activity or scientific approvals. Do not run the browser or PostgreSQL smoke suite against a live learner database. Stop application writers before making a SQLite fixture copy.

Start from the distributed source and a fresh local pilot:

```bash
npm ci
cp .env.example .env
# Use local SQLite for the unit/integration/browser suites.
npm run setup
```

The integration/browser preparation scripts copy `prisma/academy.db` into `.cache/`, clear copied user/review/audit/rate-limit records, and use only the copies for synthetic activity. They assume the authored pilot content exists. They are not a general regression fixture for an arbitrarily edited production curriculum.

## Unit and integration checks

```bash
npm test
npm run content:validate
npm run typecheck
npm run format:check
npm run build
```

On a small-memory system, run heavy checks sequentially and stop the app before compilation:

```bash
NODE_OPTIONS=--max-old-space-size=650 npm run build
```

### Unit scope

`tests/core.test.ts` contains 14 tests covering curriculum/module counts, substantial bilingual lesson structure, bank size/type coverage, question schemas, gold-answer grading across the authored bank, numeric/Arabic notation, exact matching/ordering/set contracts, difficulty selection, answer-key isolation, mastery regularization and import-bundle validation.

Gold-answer round trips prove that the grader accepts the configured keys; they do **not** independently establish that every key is scientifically correct.

### Integration scope

`tests/integration.test.ts` runs 15 nested scenarios (Node reports 16 tests including the parent):

- Real initial counts, guest sessions, RBAC, origin/client-header checks and registration identity preservation.
- Server-selected exam questions, balance, owner scoping and hidden answers.
- Revisioned draft persistence, stale-write rejection, language independence, idempotent submission and server expiry.
- Concurrent study-time credit protection; all 12 answer formats; provisional reasoning exclusion from mastery evidence.
- Reference tutor language, provenance, no-match handling, ownership and history.
- **Simulated** provider SSE success, usage, history/learner context, configuration invalidation, HTTP failure, truncated stream, cancellation after streaming starts and full-stream timeout.
- Full first-stage prerequisite sequence, all 16 lessons, module exams, 100-question final and genuine fixture certificate issuance.
- Editorial gates, reviewed-only filtering, versioning/immutable assessed questions, upload re-encoding and post-build media serving.
- Profile/preferences, export privacy, password rotation, session invalidation and simultaneous single-use recovery token claims.
- Offline content export, dry run and attributed draft-only import.

The deliberate provider-error scenario emits an expected diagnostic. Judge the test exit code/report, not the existence of that log line. No actual AI/mail service is called by these tests.

## Browser suite — separate test server

Install Chromium and required system libraries using Playwright's documented platform mechanism; on a compatible Linux development machine:

```bash
npx playwright install --with-deps chromium
```

Do not run a learner server on port 3000 while preparing the disposable browser database. In terminal 1:

```bash
npm run build
npm run test:browser:prepare
DATABASE_URL="file:$(pwd)/.cache/e2e.db" \
  CONTENT_PREVIEW=true ACADEMY_TEST_MODE=true npm run start
```

In terminal 2:

```bash
npm run test:e2e
```

The suite refuses to proceed unless `/api/health` reports test mode for a server configured with `ACADEMY_TEST_MODE=true` and an `…/e2e.db` file URL. This guard is additional protection, not permission to point test tooling at production. `E2E_BASE_URL` can select another local test origin, but the direct answer fixture database remains `.cache/e2e.db` in this checkout and must match the server.

Stop the test server after verification. Return to the intended learner database, without test mode:

```bash
# .env must point to your intended learner database, not .cache/e2e.db.
npm run start
```

The 10 browser workflows cover:

1. 23 requested route variants at desktop size, navigation readiness, no root horizontal overflow and no uncaught page error.
2. Language/theme persistence across reload, unchanged learner ID/progress, Arabic RTL layouts at mobile/tablet widths and navigation.
3. Substantial lesson rendering, explanation levels, persistent bookmarks and keyboard-closable search.
4. All 12 answer controls, server-scored feedback and complete matching solutions.
5. Exam autosave, reload, locale switch, hidden solutions, submission and recorded results.
6. Reference tutor provenance/history, conversation deletion and honest no-match behavior.
7. Observatory controls, planet comparison, Moon phase and attributed archive.
8. Registration, preferences, logout/login and protected editorial/question controls.
9. 320px English/Arabic dark layouts, complex question formats, keyboard/Escape navigation and all eight Arabic observatory tabs.
10. 31 axe page/theme/language samples: representative desktop dark routes, light variants, and Arabic mobile light pages.

The suite uses Chromium, one worker, no retries and reduced-motion emulation for deterministic rendering. Widths include 320, 390, 768 and 1440 pixels. These are real browser tests with viewport emulation, not tests on physical phones/tablets.

Axe runs WCAG 2 A/AA and 2.1 A/AA tags. A clean result means **no automated violations detected in the sampled rendered states**; it is not a WCAG certification, nor coverage of every interaction/state. Manual keyboard/screen-reader, zoom, contrast-on-imagery and real-device checks remain necessary. Firefox/WebKit were not included.

Artifacts:

- `tests/browser.log` — final run log.
- `tests/browser-report.json` — Playwright results.
- `tests/browser-findings.json` — collected page errors and axe findings.
- `tests/screenshots/` — representative dark/light dashboard, RTL and feature screenshots.
- `test-results/` — failure traces/screenshots when applicable; generated/ignored, not a distributed data store.

## PostgreSQL smoke

Use a local disposable PostgreSQL instance and a database named **`astroverse_verification`**. The test refuses another host/database name. Never substitute a production name just to bypass that check.

With the disposable URL exported in your shell:

```bash
export DATABASE_URL='postgresql://YOUR_LOCAL_TEST_USER@127.0.0.1:5433/astroverse_verification'
export CONTENT_PREVIEW=true
npm run setup
npm run test:postgres
```

Choose real local test credentials/port. The script checks fresh schema/content, JSON round trips, the simultaneous-active-attempt constraint, draft revision conflict, grading/progress, prerequisite unlock, reference tutor provenance and profile persistence. The delivered run used PostgreSQL 17.11 and all five migrations. A deliberate simultaneous-start race can log an expected unique-constraint collision while successfully returning the same active attempt.

**Restore the intended provider's Prisma Client afterwards:** unset the temporary URL or set the intended environment, then `npm run db:generate` and rebuild before restarting the application. A client generated for PostgreSQL cannot be used by the SQLite integration/browser suite.

## Backup and source checks

Both database backup formats were restored into disposable destinations and checked for expected schema/content counts; SQLite integrity/foreign-key checks also ran. Evidence: `tests/backup-report.json`. This does not replace a full off-site database-plus-media disaster-recovery rehearsal. See [Deployment](DEPLOYMENT.md).

`docs/content-report.json` records structural/content-length/type checks. `source-link-audit.json`, `additional-source-link-audit.json`, `source-audit-media.json` and `planet-fact-audit.json` record scoped source/media/value checks. `dependency-audit.json` records the dependency scanner's result at delivery; it is not a permanent security guarantee.

## Evidence and unverified areas

Final outcomes are recorded in the generated `tests/verification-report.json` and the per-suite artifacts. The production build includes TypeScript checking. Original learner records are not used as synthetic successful tests.

Not verified by this delivery: live paid AI responses; real recovery-email delivery; actual proxy behavior under slow/disconnected AI streams; pre-header cancellation; high-concurrency load or exhaustive simultaneous-submit stress; all browser engines/assistive technologies; a hosted-cloud deployment; a full off-site/media restore; independent scientific, Arabic or rights clearance. Do not convert these into “passed” claims without performing the corresponding work.

## Recorded final outcomes — 30 October 2026

| Verification                                      | Outcome                                                         |
| ------------------------------------------------- | --------------------------------------------------------------- |
| Production build + TypeScript                     | Passed                                                          |
| Unit tests                                        | 14 passed, 0 failed                                             |
| Integration scenarios                             | 15 passed (16 including parent), 0 failed                       |
| Browser workflows                                 | 10 passed, 0 failed, 0 skipped                                  |
| Sampled axe audits                                | 31 samples; 0 automated violations                              |
| Uncaught browser page errors                      | 0 recorded in the passing run                                   |
| PostgreSQL 17.11 migration/seed/application smoke | Passed                                                          |
| SQLite and PostgreSQL archive restores            | Passed in isolated destinations                                 |
| Fresh source ZIP install                          | npm ci, setup, typecheck, tests and production build all passed |
| Dependency audit                                  | 0 known vulnerabilities reported at the recorded audit          |

The fresh-install log/report are `tests/fresh-install.log` and `tests/fresh-install-report.json`. These outcomes apply to the scopes above, not to the explicitly unverified areas.
