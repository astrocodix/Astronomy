# Security, privacy and known limits

This document describes implemented controls and remaining work. It is not a penetration-test report or a guarantee that deployment is secure.

## Implemented controls

### Authentication and authorization

- Salted scrypt password hashes; minimum 12-character passwords; timing-safe comparison.
- Random session tokens, stored hashed in the database, with expiry; HttpOnly/SameSite=Lax cookies and Secure on detected HTTPS.
- Guest sessions persist learning, and registration upgrades the same learner ID. Public registration cannot choose a privileged role.
- Server-side Student/Instructor/Admin checks. The studio is not secured merely by hiding its navigation link. Instructor authoring privileges are distinct from administrator user/settings controls. The studio API does not return the learner account list to instructors.
- Ownership checks for attempts, answers, conversations, progress, exports and certificates; cross-user resources return not-found or unauthorized responses.
- Password changes invalidate prior sessions. Recovery tokens are random, hashed, expire after 30 minutes, and are claimed transactionally; simultaneous use is tested to allow only one reset. Recovery invalidates sessions and remaining tokens.

### Request handling

- Origin/host checks for mutations and a required `x-astroverse-client: academy` header. SameSite cookies complement these controls. No permissive cross-origin API policy is supplied.
- Zod input schemas, request-body limits, strict answer types and explicit public question payload allowlists.
- Database-backed rate-limit buckets for authentication, practice, exam starts and AI usage. Trusted forwarded headers are required at the edge; do not expose spoofable client-IP headers directly.
- Prisma parameterized database operations. Rendered lesson/user text is handled as text through React; no raw administrator HTML is executed as lesson content.
- Generic bilingual client errors for unexpected exceptions; operator-side error logging, plus database audit logs for editorial/administrative actions. Keep logs private; driver exceptions can still contain operational identifiers.
- CSP, no-sniff, referrer and permissions headers. Production omits `unsafe-eval`; inline scripts/styles remain for the current Next.js/theming implementation. Stronger nonce/hash CSP is remaining hardening work.

### Assessment integrity

- Questions/options are selected on the server; the pre-submission API does not expose answer keys, explanations, concept keys or arbitrary private metadata.
- Draft compare-and-swap revisions reject stale writes. Exam ownership, expiry and one-active-attempt constraints are server-enforced, including a partial unique database index.
- Submission is recorded atomically and repeated submissions return the existing result. After the deadline, grading uses only the stored draft, not a late replacement payload.
- Tutor and practice access are blocked while an unexpired exam is active. This is not remote proctoring and cannot prevent off-platform help.
- Assessed questions are immutable through the editor; duplication creates a new pending version.
- Heartbeat credit uses a compare-and-swap update and a bounded interval, preventing simultaneous tabs from double-crediting the same reading interval.

### Uploads and secrets

- Educator-only uploads, bounded raster file/body/pixel sizes, re-encoding to WebP through Sharp, random server-selected names, and no arbitrary SVG/HTML upload execution.
- Uploaded media is served as `image/webp` with no-sniff and caching. These are publicly readable resources by URL; do not upload personal identity documents or private learner records.
- Provider keys and mail credentials stay on the server and out of public configuration/export payloads. The provider verification hash is not sent as a key to the browser.
- Credentials, databases, backups, private uploads and import receipts are excluded from the distributed source archive and from version-control defaults.

## AI-specific boundaries

Reference mode is a keyword retrieval of academy-authored lesson excerpts, clearly labelled non-AI. With a provider enabled, learner messages, recent history, selected teaching excerpts and limited learning context are sent to that provider. This is personal-data processing: obtain the required consent/legal basis, select an appropriate provider agreement and retention policy, and explain it to learners.

The system instructs the tutor to treat retrieved text as data, avoid invented sources, distinguish evidence from speculation and not give exam keys. These instructions reduce risk; they do not guarantee immunity to prompt injection or scientific error. Generated responses are attributed to ASTRO AI, not to source institutions. A source link is not a citation-level factual verification system.

Daily quotas are per learner identity/timezone; anonymous account creation can defeat a purely per-user budget. Before a public paid-AI launch, add a global/tenant spending limit, anti-abuse controls, verified-account eligibility and provider-side budget alerts. Consider a fixed quota boundary rather than a user-editable timezone if budget enforcement requires it. Reference retrieval currently scans the small published lesson set; large catalogues should move to a reviewed indexed retrieval design.

The browser provides cancellation and the stream aborts upstream after response streaming begins; the integration suite tests that path and a full-stream timeout. Cancellation while still waiting for upstream headers, actual proxy streaming behavior and live-provider quota/cancellation behavior require deployment-specific testing. No live-provider verification was performed for this delivery.

## Data lifecycle

The database stores accounts/profiles, sessions, learning/answer history, exam drafts/results, study time, study plans, bookmarks, notifications, tutor conversations/usage, achievements, certificates and administrative audit records.

- Settings offers a private learner JSON export without password hashes or session/recovery tokens.
- Tutor conversations can be deleted through the interface.
- Account erasure, retention schedules, expiry housekeeping, legal holds and backup expiry must be operated under the deployment's privacy policy. A complete self-service account-erasure workflow is not included.
- Set a guest-retention policy. Guest access relies on a browser cookie; clearing it without registering loses the browser's access to that guest identity, not a magical recoverable cloud login.
- Define how certificate/history retention and corrected assessment content are handled before accepting real public students.
- If serving children, commission the relevant parental-consent and safeguarding/privacy design. The pilot does not implement age verification or parental consent.

## Additional public-release work

- MFA/SSO, email verification and breached-password controls if required by your threat model.
- A two-person scientific publication policy where appropriate; current authorized educators can attest their own review.
- Stronger CSP and production framing policy, hardened proxy/header configuration, dependency updates and external penetration testing.
- Bounded/archived analytics, global rate-limit/storage budgets, DB pool sizing and contention/load testing. Large-scale simultaneous-submit stress has not been performed.
- Monitoring and alerts for 5xx responses, auth abuse, provider spending/errors, storage consumption, backup jobs and database health.
- Automated pruning of expired sessions/recovery tokens, old rate-limit buckets, abandoned guests and orphaned uploads under an approved retention policy.
- Rehearsed off-site restoration, with both database and media. Current backup tests are isolated database archive restores, not a disaster-recovery certification.

Do not deploy test administrator credentials, run browser tests against a live learner database, expose `.env` or backups through the web server, or advertise this pilot as accredited/independently reviewed. For a suspected incident, revoke affected sessions/keys, preserve restricted logs, isolate the service as necessary, and follow a documented incident-response process.
