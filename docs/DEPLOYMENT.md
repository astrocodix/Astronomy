# Installation, deployment and operations

## GitHub Pages: static preview

The separate `github-pages/` app exports a static, bilingual learning preview and can be hosted by GitHub Pages without a database or server secrets. It is **not a deployment of the full application**: accounts, cross-device progress, assessments, certificates, the AI tutor, uploads and the content studio require the Node server and database described below. Reading marks are ungraded, browser-local convenience markers. The export uses the versioned seed content, not the mutable live database.

Stage 1 is an explicitly labelled, unreviewed pilot; stages 2–12 are curriculum outlines. The preview is public when deployed but sets `noindex` and does not replace independent scientific, Arabic, and media-rights review before a reviewed launch. GitHub Pages does not apply the full Node app's custom security headers; do not store secrets or private learner data in the export.

In repository settings, select **Pages → Build and deployment → GitHub Actions**. `.github/workflows/pages.yml` builds with Node 22, uses the Pages configuration action's base path (e.g. `/Astronomy` for this repository, empty for a custom domain or user site), tests the exported files, and deploys the artifact. The workflow runs for `main` and the initial Arena working branch; remove the latter trigger if it is no longer needed after merging. The site URL for this repository is expected to be <https://astrocodix.github.io/Astronomy/>; confirm the actual URL and successful run in the Pages settings and Actions tab. A repository environment or organization policy may require approval before deployment.

For an isolated local check, use `NEXT_PUBLIC_BASE_PATH=/Astronomy npm run pages:build`, then `NEXT_PUBLIC_BASE_PATH=/Astronomy npm run pages:serve`. Open `/Astronomy/` on port 4173. Use the same prefix when running the Pages tests; an empty prefix is valid for a domain-root site. The full-app instructions below are unchanged.

## 1. Choose a database and hosting model

**Recommended public deployment:** a maintained Node.js runtime (22 LTS recommended), PostgreSQL, HTTPS reverse proxy, persistent writable media volume, secret manager, monitoring and encrypted off-host backups.

SQLite is supplied for convenient local development and a small single-process pilot. Do not use a local SQLite file across multiple independent application instances. Do not deploy mutable SQLite or uploaded files onto an ephemeral/serverless filesystem and assume they will persist.

The full application is a Next.js **Node server**, not a static export. It needs database access and filesystem access to `storage/uploads/`. The AI endpoint streams responses; avoid a proxy/function timeout shorter than the configured upstream timeout.

### Local SQLite

```bash
npm ci
cp .env.example .env
# Edit .env: choose administrator credentials; keep DATABASE_URL=file:./academy.db.
npm run setup
npm run dev
```

`file:./academy.db` is relative to `prisma/schema.prisma`, so the file is `prisma/academy.db`. An absolute file URL such as `file:/srv/astroverse-data/academy.db` may be used for a mounted volume. The parent directory must already be writable by the service account.

### PostgreSQL

Provision a new PostgreSQL database and a limited application account. Use a direct database connection for migration execution, not an incompatible transaction-only proxy. Keep the connection string in a secret manager/environment; do not paste a real password into the source or shell history.

```dotenv
DATABASE_URL="postgresql://APP_USER:URL_ENCODED_PASSWORD@DB_HOST:5432/astroverse?schema=public&sslmode=require"
APP_URL="https://academy.your-domain.example"
CONTENT_PREVIEW="false"
ACADEMY_TEST_MODE="false"
```

Use your actual host and credentials. URL-encode special characters in credentials. Prefer verified TLS and provider-recommended CA settings for your environment.

```bash
npm ci
npm run setup
npm run build
npm run start
```

`scripts/database.mjs` automatically chooses:

| URL                                | Schema                            | Migration history               |
| ---------------------------------- | --------------------------------- | ------------------------------- |
| `file:…`                           | `prisma/schema.prisma`            | `prisma/migrations/`            |
| `postgresql://…` or `postgres://…` | `prisma/postgresql/schema.prisma` | `prisma/postgresql/migrations/` |

Both histories contain 001–005. Migration 005 includes a partial unique index allowing only one `IN_PROGRESS` exam per learner. Do not replace the migration histories with `db push`; it does not represent this partial-index invariant in the Prisma schema.

`PRISMA_SCHEMA` can explicitly override the selected schema for maintenance, but ordinarily leave it unset. **Build, generate and run with the same provider.** After changing providers, regenerate Prisma Client and rebuild; do not run a PostgreSQL-generated client against SQLite or vice versa.

A provider switch does **not** migrate existing accounts or progress. These are independently verified fresh-install schemas. Moving live SQLite data to PostgreSQL requires a separately rehearsed ETL/data-migration plan, preservation of IDs and hashes, validation of every relation, downtime/cutover planning, and rollback. The private learner export deliberately excludes credentials and is not a full database migration format.

PostgreSQL 17.11 was exercised with fresh migrations, seeding, JSON fields, simultaneous exam start, draft revisions, grading, prerequisite unlock, tutor provenance and profile persistence. See `tests/postgres-report.json`.

## 2. Build and process supervision

For a small-memory host, stop other heavy build/dev processes first:

```bash
NODE_OPTIONS=--max-old-space-size=650 npm run build
npm run start
```

Use your platform's supervised service manager, with automatic restart and graceful shutdown. `npm run start` binds `0.0.0.0:3000`. To select a different port with the underlying binary:

```bash
npx next start -H 0.0.0.0 -p 8080
```

The browser uses relative `/api/…` URLs; never replace them with browser-facing `localhost` calls in a hosted deployment. The development configuration permits the Arena preview host; public deployments should restrict dev access rather than expose a development server.

### Reverse-proxy requirements

- Terminate TLS, redirect HTTP to HTTPS, and set HSTS at the edge after verifying the domain setup.
- Forward the legitimate Host/protocol and client IP. Strip client-supplied forwarding headers before adding your own; origin validation, secure-cookie detection and IP rate limiting depend on trustworthy proxy headers.
- Preserve streaming on `/api/tutor`; disable response buffering and allow at least the configured AI timeout plus margin.
- Allow the documented upload size, but keep an edge request-size limit. The application separately bounds JSON and raster uploads.
- Do not CDN-cache authenticated JSON or learner HTML. Hashed scientific uploads and static assets can be cached.
- The preview intentionally permits embedding. On a standalone production domain, add a suitable `frame-ancestors` CSP directive to prevent unwanted framing. Do not add a blocking frame policy to the Arena preview.

## 3. Persistent data and secrets

Persist and back up:

1. PostgreSQL data or the SQLite database.
2. `storage/uploads/` — uploaded, re-encoded WebP images are served by `/api/media/<opaque-name>.webp`.
3. The deployed source/release revision, migrations and `public/images/attributions.json`.
4. Secret-manager configuration and recovery procedures, separately protected.

The bundled `public/images/` and `public/fonts/` are deployment assets. Runtime uploads are not placed into the compiled `public` directory. Upload URLs are publicly readable scientific resources, not an authenticated store for personal student documents.

For multiple application instances, use a shared durable media volume or implement a reviewed object-storage adapter; this pilot currently uses the filesystem adapter. Add storage lifecycle cleanup for orphaned uploads, which are retained rather than risking historical-image deletion.

Bootstrap administrator variables only create a missing account. Remove the bootstrap password from the long-running environment after successful setup and store recovery credentials securely. An existing email is not silently promoted or given a new password by a rerun of the seed.

## 4. External-service commissioning

### AI

- Set `OPENAI_API_KEY` and HTTPS `AI_BASE_URL` in the server environment.
- `AI_MODEL`/`AI_DAILY_LIMIT` are initial-seed defaults. Change existing runtime settings in the protected admin studio.
- The client sends no provider key. The server sends the learner's message, recent conversation, selected academy-authored context, completed-lesson titles, weakest assessed topics and study goal to the provider.
- The provider must support Chat Completions, SSE deltas, `[DONE]`, and the request parameters in `src/lib/tutor.ts`. A different “OpenAI-compatible” provider may require adapter changes.
- Test EN and AR, all explanation modes, source display, history, failure, quota and cancellation with the selected model. Success with a simulated server is not verification of a real provider.
- `AI_TIMEOUT_MS` defaults to 45,000; the application clamps it between 1,000 and 90,000 milliseconds for the full response. Daily quota counts attempted AI requests; failures can consume quota. A verified indicator describes a previous complete response for the current endpoint/model/key hash, not an uptime guarantee or scientific accuracy rating.
- Set provider-side budget limits. Guest accounts are not a sufficient global spending-abuse defense; restrict provider access to registered/verified users or add global/tenant budgets before a large public launch.

### Recovery mail

Configure `RESEND_API_KEY`, a verified `MAIL_FROM`, and the correct HTTPS `APP_URL`. Send to an address you own and test token expiry, one-time use and session invalidation. Successful HTTP simulation does not prove inbox delivery. An unconfigured service returns an unavailable response; tokens are not revealed as a development convenience.

## 5. Backup and restore

```bash
npm run db:backup
```

The command creates private timestamped files in `backups/`:

- SQLite: Python's consistent backup API, followed by `PRAGMA integrity_check`. Requires Python 3.
- PostgreSQL: `pg_dump --format=custom`; install a PostgreSQL client compatible with the server version. Credentials are passed by environment, not command-line arguments. TLS follows the URL's `sslmode` plus the process's PostgreSQL environment settings.

Backups contain personal information and password hashes. Encrypt them, restrict access, copy them off-host, rotate retention, and monitor job failures. A database backup alone does not back up uploaded media.

### Safe restoration rehearsal

**Never restore over the current live database merely to test a backup.** Stop test writers and restore into a new disposable destination. First ensure you have the relevant database client and an independently protected current backup.

SQLite example, using chosen file paths:

```bash
cp backups/YOUR_BACKUP.db /srv/restore-check/academy.db
python3 - <<'PY'
import sqlite3
c = sqlite3.connect('/srv/restore-check/academy.db')
assert c.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
assert not c.execute('PRAGMA foreign_key_check').fetchall()
print(c.execute('SELECT count(*) FROM Lesson').fetchone())
PY
```

For PostgreSQL, use environment/secret-manager connection variables for a **new empty restore database**, then:

```bash
createdb YOUR_NEW_RESTORE_DATABASE
pg_restore --exit-on-error --no-owner --no-privileges \
  --dbname=YOUR_NEW_RESTORE_DATABASE backups/YOUR_BACKUP.pgdump
```

Match credentials/host/port to your environment. Do not use `--clean` against the live database. Verify migrations, row counts, foreign keys and application login/learning flows; restore the matching media snapshot; then rehearse the documented cutover and rollback procedure.

This delivery successfully restored both database formats into disposable destinations and verified 12 stages, 146 modules, 16 lessons, 864 questions, 57 exam templates and 5 migrations; SQLite integrity and foreign-key checks also passed. This was **not** an off-host infrastructure-loss or media-volume restore drill. Evidence: `tests/backup-report.json`.

## 6. Release gates and remaining operational work

- Independent science, Arabic and rights review; no bulk “human reviewed” flags merely to unlock content.
- Complete intended first-stage approvals, test with `CONTENT_PREVIEW=false`, and confirm no draft or pending content leaks.
- Provider/mail commissioning if enabled; privacy policy and appropriate handling of minors.
- Manual assistive-technology and real-device checks, Firefox/Safari coverage, and expected-concurrency/load tests.
- Backups, alerts, expiry/retention housekeeping, storage cleanup, database pool sizing and incident response.
- CSP nonce/hash hardening and deployment-specific security review; optional MFA/SSO.
- Analytics currently aggregate a learner's full answer/study history for accurate totals; at substantial scale, introduce tested rollups/pagination rather than returning unbounded histories. The CMS question list is already paginated.

No hosted-cloud deployment, high-concurrency benchmark, penetration test or accreditation is claimed by this delivery.
