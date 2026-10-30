# Curriculum, authoring and scientific review

## Delivered curriculum

The database contains one astronomy programme, with the complete 12-stage/146-module roadmap:

| Stage | Scope                           | Modules | Teaching status                                        |
| ----- | ------------------------------- | ------: | ------------------------------------------------------ |
| 1     | Introduction to Astronomy       |       8 | 16 bilingual pilot lessons; pending independent review |
| 2     | Solar System                    |      16 | Roadmap only / planned                                 |
| 3     | Earth, Moon and Sun             |      10 | Roadmap only / planned                                 |
| 4     | Stars and Stellar Evolution     |      16 | Roadmap only / planned                                 |
| 5     | Galaxies                        |      11 | Roadmap only / planned                                 |
| 6     | Black Holes and Extreme Objects |      12 | Roadmap only / planned                                 |
| 7     | Physics for Astronomy           |      13 | Roadmap only / planned                                 |
| 8     | Mathematics for Astronomy       |      12 | Roadmap only / planned                                 |
| 9     | Cosmology                       |      13 | Roadmap only / planned                                 |
| 10    | Observational Astronomy         |      14 | Roadmap only / planned                                 |
| 11    | Modern Astronomy and Missions   |      11 | Roadmap only / planned                                 |
| 12    | Advanced Research               |      10 | Roadmap/capstone outline only                          |

The source of truth for all module titles and translations is `src/content/curriculum.ts`. Roadmap visibility does not imply completed teaching, reviewed research projects or available examinations for later stages.

Stage 1's eight modules are What Is Astronomy; Astronomy vs Astrophysics; History; Observable Universe; Celestial Objects; Scientific Methods; Astronomical Units; and Scale of the Universe. Each has two lessons. The content report records per-lesson word counts, question counts, sources and review status.

## Teaching and assessment design

Every pilot lesson includes objectives, a glossary, and ten section types:

`INTRO`, `CORE`, `INTERMEDIATE`, `ADVANCED`, `EXAMPLE`, `MISCONCEPTION`, `APPLICATION`, `WORKSHOP`, `CHECKPOINT`, `SUMMARY`.

The interface progressively exposes explanation levels, rather than replacing a substantive lesson with a short answer. The workshop provides an activity or quantitative investigation; estimated duration includes this work. Diagrams and simulated measurements are labelled as illustrative. Real image products have bilingual titles, captions and alt text, source credit, an original-source link and an observation/illustration classification.

The bank has 864 question records, with 108 per module and 52–56 per lesson. Many are concept variants, including deterministic definition/distractor variants. They are useful for varied practice, but should not be advertised as 864 independent research-quality questions. Review originality, coverage and pedagogical value, not just record counts.

Supported formats:

| Type                                | Answer contract | Notes                                                                             |
| ----------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| MCQ / TRUE_FALSE / SCENARIO / IMAGE | `choice`        | Opaque option ID, never an index or a visible answer-key marker                   |
| MULTI_SELECT                        | `set`           | Exact set; duplicates and extra choices are rejected                              |
| FILL                                | `text`          | Reviewed accepted EN/AR strings; normalized Unicode/case/Arabic diacritics        |
| MATCH                               | `match`         | Every row maps to an existing option ID; complete solution shown after submission |
| ORDER                               | `order`         | Exact permutation, keyboard-accessible move buttons and explicit confirmation     |
| NUMERIC / DIAGRAM / ADVANCED        | `number`        | Finite value and explicit absolute tolerance; units belong in the prompt          |
| REASONING                           | `rubric`        | Keyword-aided practice feedback only; provisional, not expert judgement           |

Numeric input supports standard decimal/scientific notation and Arabic/Persian digits. It deliberately rejects ambiguous thousands separators and numeric text containing arbitrary units. A `tolerance` is an absolute tolerance in the answer's stated unit, not a percentage.

The timed engine excludes `REASONING`, shuffles questions/options and targets 30% beginner, 40% intermediate and 30% advanced questions. If an edited pool lacks a difficulty, the selector can backfill from available items; editors should preserve adequate approved coverage. It prioritizes unseen records and distinct concept keys where possible, not an impossible guarantee of zero repetition from a finite pool.

Quick/standard/advanced lesson templates contain 10/20/30 items with 15/30/45 minutes; module exams contain 50/60 minutes; the stage final contains 100/120 minutes. The label “advanced exam” controls exam length; the current common 30/40/30 difficulty distribution still applies. The pass threshold and prerequisite setting are admin-configurable.

### Mastery is evidence, not clicks

`calculateMastery` uses the latest response per distinct concept and a Beta(2,2)-regularized score, rather than counting lesson views as mastery. At least 15 concept checks and activity across at least two UTC dates produces the `REINFORCED` confidence label. Otherwise evidence remains developing/unassessed. Up to the latest 500 non-reasoning answers per module are considered. This is a transparent educational heuristic, **not a calibrated psychometric measure**.

Lesson completion requires a passing qualifying lesson assessment. Module/stage progression comes from qualifying exams, with prerequisites enabled by default. Changing language or theme does not recreate the user or reset these records. XP is motivational, not a qualification. Certificates are generated only from earned stage progress and explicitly say non-accredited; there is no external accreditation or public certificate-verification service.

## Editorial workflow

1. Bootstrap your own administrator and sign in at `/login`; open `/admin`.
2. Create/import drafts or duplicate a question to create a new version. Editing existing questions that have been assessed is blocked. Do not rewrite the answer key underlying historical marks.
3. Check English and Arabic together, including prompts, distractors, matching rows, units, explanations, alt text and source metadata.
4. Review numerical answers independently; reproduce calculations; verify evidence/theory/hypothesis/speculation labels. Resolve disputed facts, terminology and media rights before approval.
5. Approve questions with a meaningful review note and an explicit human-review acknowledgement. The acknowledgement is an attestation by the operator, **not an automated scientific review**.
6. Review and approve the lesson only after its structural/media/reference/length and approved-question gates pass. A lesson requires at least 20 approved items and substantial bilingual teaching. A module publication gate requires at least 100 approved items and approved teaching. The stage gate checks module availability/readiness.
7. Test the learner journey with `CONTENT_PREVIEW=false`. Do not bulk-approve just to remove a preview warning.

The seed uses `PUBLISHED/PENDING` for the authored pilot, exposed only when preview is enabled. Normal new imports are `DRAFT/PENDING` and remain hidden even in preview. Production filtering requires `PUBLISHED/APPROVED`. The ordinary seed only inserts missing records; it does not replace editorial work.

Media/reference edits invalidate associated lessons for renewed review; lesson edits return the lesson to draft/pending. Existing completed learning records are not automatically retracted when teaching is edited. If a correction invalidates an assessment, plan a documented migration/reassessment rather than silently changing historical grades.

The studio supports question filtering/pagination, all answer formats, bilingual sections, curriculum labels/status, media/reference associations, translations, review decisions and audit records. Only administrators can manage roles or platform settings; instructors can author/review content. The pilot does not enforce a separate two-person approver from the author—use an organizational review policy or add that control before a regulated release.

## Repeatable draft pipeline

### Offline export

```bash
npm run content:generate -- --export-seed --module m-1-1 --out drafts/module-1.json
```

This exports two authored lessons and 108 questions without a provider call. The file conforms to the version-1 bilingual bundle schema in `src/lib/content-bundle.ts`. Existing output files are not overwritten.

### Explicit AI drafts

Configure the server-side key and a suitable HTTPS Chat Completions endpoint/model. Generation is opt-in and may incur costs:

```bash
# Questions for an existing lesson.
npm run content:generate -- --ai --lesson l-1-1 --count 20 \
  --max-requests 2 --out drafts/lesson-1-extra-questions.json

# One substantial new lesson in an existing planned module.
npm run content:generate -- --ai --module m-2-1 --kind lesson \
  --references nasa-solar --out drafts/solar-formation-lesson.json
```

Limits: at most 200 question items, batches of at most 10, at most 20 requests, default request cap 10, 90 seconds per provider request. New lessons are generated one per file. Validate chosen source IDs before use. Only existing registered references and cached image keys may be used; a valid ID is not proof a claim is supported.

The tool validates structure, bilingual fields, type-specific answers and duplicate prompts, checks complete provider responses, saves validated partial output between batches, and never publishes. It uses academy-authored text and reference metadata; it does not scrape or ingest linked third-party textbooks. A provider failure is not silently relabelled as successful generation. The live generation path has not been tested with a paid provider in this delivery.

### Dry run, backup, then apply

```bash
npm run content:import -- --file drafts/module-1.json
npm run db:backup
npm run content:import -- --file drafts/module-1.json \
  --apply --actor-email YOUR_EXISTING_EDUCATOR_EMAIL
```

The importer:

- Limits a file to 8 MB and validates the full schema before mutation.
- Requires an existing parent module and valid source/lesson associations.
- Requires an existing Admin/Instructor email for audit attribution on apply. This is a trusted operator CLI with database access, not a public authentication mechanism.
- Uses a database transaction; creates new IDs and remaps all option keys, including matching and ordering.
- Inserts only new draft/pending content, appends lesson order and records an audit event.
- Writes an adjacent receipt containing the mapping and actor ID. Preserve this review trail privately.

It is not an upsert or content-merge tool. Avoid applying the same content twice, including under a new filename. After an uncertain crash or receipt-write error, inspect the database/audit trail before retrying. A committed import may exist even if the subsequent receipt write failed.

### Validate and expand

```bash
npm run content:validate
npm run test:unit
```

`content:validate` checks the source pilot; review gates validate edited database content. Software validation cannot verify a scientific assertion, a translation, copyright permission or educational quality. Expand one module at a time, write/review enough genuinely varied questions, test its progression and examinations, then release the module/stage through the gates.

`scripts/refresh-pilot.ts` is a guarded maintenance tool for the original unreviewed pilot. It backs up first and rejects unsafe overwrites when assessments or approvals exist. It is **not** a normal production update command; do not use it as a substitute for versioned editorial work.

## Required human review record

For each released module, retain: reviewer identities/roles, date, lesson/question version IDs, independent calculation checks, bilingual terminology checks, source URLs/access dates, exact image credit/permission evidence, accessibility checks, curriculum coverage, and explicit publication approval. The delivered `PENDING` flags must remain until this review genuinely happens.
