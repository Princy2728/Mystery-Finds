# SPEC.md — AI Mystery Room

Version: 1.0 | Status: Source of truth for implementation

---

## 1. Project Overview

**AI Mystery Room** is a full-stack web application where players generate an AI-authored mystery from a premise, investigate suspects, discover clues, request hints, accuse a suspect, and receive a verdict with explanation and score.

The backend is authoritative for all game state: clue discovery, hint usage, accusation, and scoring. The culprit and solution never leave the server before an accepted accusation.

## 2. Problem Statement

Most AI "mystery generators" output a block of text. They have no interaction, no fairness guarantees, no persistent progress, and often leak or contradict the solution. This project delivers a structured, validated, replayable detective game with server-enforced rules.

## 3. Project Objectives

1. Generate structured, logically consistent, solvable mysteries with Gemini.
2. Enforce exact suspect/clue/hint counts per difficulty in backend code.
3. Keep the culprit and solution secret until an accusation is accepted.
4. Make clue discovery, hints, and accusation idempotent and concurrency-safe.
5. Calculate and persist scores exclusively on the server.
6. Provide a responsive, accessible, detective-themed UI.
7. Be deployment-ready (static frontend, Node backend, MongoDB Atlas).

## 4. Target Users

- Casual players who enjoy puzzle and detective games.
- Students and hackathon judges evaluating AI + full-stack engineering.
- Desktop, tablet, and mobile users; no account required.

## 5. Core Features

1. Premise + difficulty based mystery generation (Gemini).
2. Suspect cards (name, background, motive, alibi).
3. Explicit clue discovery with a persistent evidence log.
4. Sequential hint system with penalties.
5. Accusation flow with confirmation.
6. Results page with verdict, culprit, explanation, evidence, score breakdown.
7. Backend scoring engine.
8. Persistence in MongoDB; progress survives refresh.
9. Anonymous player sessions (HttpOnly cookie).

## 6. Optional Enhancements (not required for v1)

- Case history page per anonymous session.
- Generated avatars for suspects.
- Premise auto-suggestion ("surprise me").
- Sound/ambience toggle.
- Leaderboard (requires accounts; out of scope).

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router DOM, Axios, Lucide React |
| Styling | Tailwind CSS |
| Backend | Node.js, Express, dotenv, cors, express-rate-limit, cookie-parser |
| Database | MongoDB, Mongoose |
| AI | Google Gemini via `@google/genai` |
| Validation | Zod |
| Testing | Vitest + React Testing Library (frontend); Node test runner or Vitest + Supertest (backend) |
| Tooling | npm, Nodemon, ESLint |

Language: JavaScript (JSX) unless an existing project uses TypeScript.

## 8. System Architecture

```
React (Vite) ──Axios──▶ Express API ──▶ MongoDB (Mongoose)
                            │
                            └──▶ Gemini API (@google/genai)
```

Flow:
1. Client posts premise + difficulty.
2. Server builds a prompt using difficulty config, calls Gemini in JSON mode with a response schema.
3. Output is parsed, validated with Zod, then checked by consistency rules.
4. On success, the case is saved (public + private parts) and a public DTO is returned.
5. Client drives investigation via clue/hint endpoints; server updates progress atomically.
6. Accusation endpoint finalizes the case, computes the score, stores the result.
7. Result endpoint returns the stored result once the case is completed.

Layering: routes → controllers → services → models. Public DTO serializers are the only path by which case data leaves the API.

## 9. User Journey

1. Land on Home → "Start Investigating".
2. Create Mystery: enter premise, choose difficulty, generate.
3. Investigation Room: read story, review suspects, discover clues, request hints.
4. Open Accusation modal, select one suspect, confirm.
5. Results page: verdict, culprit, explanation, evidence, score.
6. Play Again or return Home.

## 10. Page Specifications

### 10.1 Home `/`
- Logo/name, hero headline: "Every Clue Matters. Every Suspect Has a Secret."
- Supporting text: "Enter a world of AI-generated mysteries, investigate suspicious characters, uncover hidden evidence, and solve the case before the truth disappears."
- Primary button "Start Investigating" → `/create`.
- How to Play (4 steps), three difficulty cards (suspects/clues/hints/base points), feature highlights, footer.

### 10.2 Create Mystery `/create`
- Premise textarea with counter (min 10, max 500 chars). Premise is **required**; auto-premise is not supported in v1.
- Difficulty selector (Easy/Medium/Hard) with descriptions.
- Generate button; disabled while pending (prevents duplicate submit).
- Loading indicator with message; inline validation errors; retry on failure; back to Home.
- On success navigate to `/investigation/:id`.

### 10.3 Investigation Room `/investigation/:id`
- Title, story, difficulty badge.
- Progress: "N of M clues discovered".
- Suspect cards: name, background, motive, alibi. No visual distinction between suspects.
- Clue panel: each clue shows `title` and teaser `description`. Undiscovered clues show a "Discover" action; discovered clues show full `content`.
- Evidence log: discovered clues in discovery order.
- Hint panel: "Request Hint" button, hints received in order, remaining count; disabled at zero.
- Score panel: current points (see §23) and breakdown.
- Accuse button.
- State is always refetched from the backend on load/refresh.
- If case is completed, redirect to `/results/:id`.

### 10.4 Accusation (modal on Investigation Room)
- Radio selection of exactly one suspect.
- Warning: "This ends the investigation. Your verdict is final."
- Cancel and Submit buttons; explicit confirmation step; buttons disabled while pending.
- On success navigate to `/results/:id`.

### 10.5 Results `/results/:id`
- Verdict (correct/incorrect), accused suspect, actual culprit, title.
- Final score with breakdown (base, clue points, hint penalties).
- Clues discovered, hints used.
- Crime explanation and supporting evidence (titles + content).
- Buttons: Play Again (`/create`), Return Home.
- Data comes only from `GET /api/cases/:id/result`. If the case is active, show a "Case still open" state with a link back to the investigation.

### 10.6 Not Found `*`
- Friendly 404 with link Home.

## 11. UI States and Error Handling

Every data-driven view defines: loading, empty, error, success.

| Situation | UI behavior |
|---|---|
| Generation pending | Full-form loading state, button disabled |
| Gemini unavailable (502/503) | Friendly message + Retry |
| Validation error (400) | Inline field message |
| Rate limited (429) | "Too many requests, try again shortly" |
| Case not found (404) | NotFound state with link to Create |
| Case forbidden/unauthorized (401/403) | "This case belongs to another session" |
| Case already completed (409) on action | Redirect to results |
| Network failure | Banner with Retry (only for safe/idempotent retries) |

Accessibility: semantic HTML, focus-visible states, ARIA labels on modals, keyboard operable, color contrast ≥ WCAG AA.

Visual direction: charcoal/deep-navy backgrounds, restrained amber/gold accents, high-contrast type, evidence-card styling, subtle transitions, responsive from 320px up.

## 12. Frontend Folder Structure

```
client/
  src/
    main.jsx
    App.jsx
    api/            axiosClient.js, caseApi.js
    components/     Navbar, Footer, DifficultySelector, SuspectCard, ClueCard,
                    EvidenceLog, HintPanel, InvestigationProgress, ScoreDisplay,
                    AccusationModal, ResultSummary, LoadingState, ErrorMessage,
                    EmptyState, ConfirmDialog
    pages/          Home, CreateMystery, InvestigationRoom, Results, NotFound
    hooks/          useCase.js
    utils/          formatters.js
    styles/         index.css
    tests/
  .env.example
  package.json
```

Axios client: `baseURL` from `VITE_API_BASE_URL`, `withCredentials: true`, centralized error normalization to `{ code, message, status }`.

## 13. Backend Folder Structure

```
server/
  src/
    app.js
    server.js
    config/         database.js, env.js, difficulty.js
    models/         Case.js
    routes/         caseRoutes.js
    controllers/    caseController.js
    services/       geminiService.js, mysteryService.js, scoringService.js,
                    validationService.js, sessionService.js, serializers.js
    middleware/     errorHandler.js, validateRequest.js, rateLimiter.js, playerSession.js
    schemas/        caseSchemas.js, mysterySchemas.js
    utils/          apiError.js
  tests/
  .env.example
  package.json
```

## 14. Database Schema (Mongoose `Case`)

```
Case {
  _id: ObjectId
  playerTokenHash: String (SHA-256 of session token, indexed, required)

  // Public
  title: String (required)
  premise: String (required, 10–500)
  story: String (required)
  difficulty: enum ['easy','medium','hard'] (required)
  suspects: [{ id: String, name, background, motive, alibi }]
  clues: [{
    id: String, title: String, description: String (teaser),
    content: String (private until discovered),
    significance: String (private until completed),
    relatedSuspectIds: [String]
  }]
  hints: [{ id: String, content: String }]   // private until requested
  totalClues: Number
  maxHints: Number
  status: enum ['active','completed'] default 'active'

  // Private solution
  solution: {
    culpritId: String,
    explanation: String,
    evidenceIds: [String],
    reasoningSummary: String
  }

  // Progress
  discoveredClueIds: [String]
  hintsUsed: Number default 0 (0..maxHints)
  accusedSuspectId: String | null
  verdict: enum ['correct','incorrect'] | null
  score: { base, cluePoints, hintPenalty, final }  | null
  completedAt: Date | null

  createdAt, updatedAt
}
```

Indexes: `{ playerTokenHash: 1, createdAt: -1 }`.

Data integrity (enforced in Zod + service layer + Mongoose validators):
- Suspect IDs unique; clue IDs unique; hint IDs unique.
- `solution.culpritId` ∈ suspect IDs.
- `solution.evidenceIds` ⊆ clue IDs.
- `discoveredClueIds` ⊆ clue IDs, no duplicates.
- `hintsUsed ≤ maxHints`.
- Accused suspect ∈ suspect IDs.
- Counts match difficulty config.

Status model: `active` → `completed`. An incorrect accusation also completes the case (one accusation per case). Completed cases reject clue discovery, hint requests, and accusations with `409`.

## 15. API Endpoint Contracts

Base path: `/api`. All bodies JSON. All errors use the format in §18 (error section). Cookie `mr_session` (HttpOnly) identifies the player; it is issued automatically on first request.

Common: all `:id` params validated as ObjectId (invalid → `400 INVALID_ID`). Case not owned by session → `403 FORBIDDEN`; missing session on case routes → `401 NO_SESSION` (session auto-created on `POST /cases`).

### 15.1 `POST /api/cases` — Generate mystery
Request:
```json
{ "premise": "A valuable diamond disappears from a museum.", "difficulty": "medium" }
```
Validation: `premise` string, trimmed, 10–500 chars; `difficulty` ∈ easy|medium|hard.
`201 Created`:
```json
{ "success": true, "data": { "case": <PublicCase> } }
```
Errors: `400 INVALID_REQUEST`, `429 RATE_LIMITED`, `502 AI_INVALID_RESPONSE`, `503 AI_UNAVAILABLE`, `500`.

### 15.2 `GET /api/cases/:id` — Retrieve case
`200`:
```json
{ "success": true, "data": { "case": <PublicCase> } }
```
Errors: `400`, `401`, `403`, `404 CASE_NOT_FOUND`.

### 15.3 `POST /api/cases/:id/clues/:clueId/discover`
No body. Atomic, idempotent.
`200`:
```json
{ "success": true, "data": {
  "clue": { "id": "clue_2", "title": "...", "content": "..." },
  "alreadyDiscovered": false,
  "progress": <Progress>
} }
```
Repeat call returns `200` with `alreadyDiscovered: true` and unchanged progress.
Errors: `400`, `401`, `403`, `404 CASE_NOT_FOUND | CLUE_NOT_FOUND`, `409 CASE_COMPLETED`.

### 15.4 `POST /api/cases/:id/hints`
No body.
`200`:
```json
{ "success": true, "data": {
  "hint": { "id": "hint_1", "index": 1, "content": "..." },
  "progress": <Progress>
} }
```
Errors: `409 NO_HINTS_REMAINING`, `409 CASE_COMPLETED`, plus common errors.

### 15.5 `POST /api/cases/:id/accuse`
Request: `{ "suspectId": "suspect_2" }`
`200`: `{ "success": true, "data": { "result": <Result> } }`
Errors: `400 INVALID_REQUEST`, `404 SUSPECT_NOT_FOUND`, `409 CASE_COMPLETED` (verdict/score unchanged), plus common errors.

### 15.6 `GET /api/cases/:id/result`
`200`: `{ "success": true, "data": { "result": <Result> } }`
`409 CASE_NOT_COMPLETED` if active. Always returns stored values, never recalculated.

### 15.7 `GET /api/health`
`200`: `{ "success": true, "data": { "status": "ok", "db": "connected" } }` (no secrets or infrastructure details).

### Response shapes

**PublicCase**
```json
{
  "id": "...", "title": "...", "premise": "...", "story": "...",
  "difficulty": "medium", "status": "active",
  "suspects": [{ "id": "suspect_1", "name": "...", "background": "...", "motive": "...", "alibi": "..." }],
  "clues": [
    { "id": "clue_1", "title": "...", "description": "...", "discovered": false },
    { "id": "clue_2", "title": "...", "description": "...", "discovered": true, "content": "..." }
  ],
  "hints": [{ "id": "hint_1", "index": 1, "content": "..." }],
  "progress": <Progress>,
  "createdAt": "..."
}
```
`hints` contains only already-requested hints. `content` appears only on discovered clues.

**Progress**
```json
{ "cluesDiscovered": 4, "totalClues": 7, "hintsUsed": 1, "hintsRemaining": 2, "maxHints": 3,
  "currentPoints": 10 }
```
`currentPoints = max(0, cluePoints − hintPenalty)` (a preview that excludes base points; the official score exists only after accusation).

**Result**
```json
{
  "caseId": "...", "title": "...", "verdict": "correct",
  "accusedSuspect": { "id": "...", "name": "..." },
  "culprit": { "id": "...", "name": "..." },
  "explanation": "...", "reasoningSummary": "...",
  "evidence": [{ "id": "clue_1", "title": "...", "content": "...", "significance": "..." }],
  "score": { "base": 150, "cluePoints": 20, "hintPenalty": 10, "final": 160 },
  "cluesDiscovered": 4, "hintsUsed": 1, "completedAt": "..."
}
```

## 16. Gemini Integration Requirements

- SDK: `@google/genai`. Key read from `GEMINI_API_KEY` (backend only). Model from `GEMINI_MODEL`.
- Request JSON output (`responseMimeType: "application/json"`) with a response schema where supported; always re-validate with Zod.
- Request timeout (default 30s, configurable). Map errors: timeout/network → `503 AI_UNAVAILABLE`; quota → `503 AI_UNAVAILABLE`; unusable output → `502 AI_INVALID_RESPONSE`.
- Prompt includes: premise (treated as untrusted data, delimited, never as instructions), difficulty counts, ID naming convention, clue design rules, hint rules, and "output JSON only".
- Retry policy: max **3 attempts**; on failure the corrective instruction lists the specific validation errors. After final failure, return an error and persist nothing.
- Do not log API keys, prompts containing the solution, or raw model output containing the solution.
- Tests mock the Gemini service; real-API tests are separate and opt-in.

## 17. AI-Generated Data Schema

```json
{
  "title": "string (3–100)",
  "premise": "string",
  "story": "string (200–3000)",
  "suspects": [{ "id": "suspect_N", "name": "", "background": "", "motive": "", "alibi": "" }],
  "clues": [{
    "id": "clue_N", "title": "", "description": "", "content": "",
    "significance": "", "relatedSuspectIds": ["suspect_N"]
  }],
  "hints": [{ "id": "hint_N", "content": "" }],
  "solution": {
    "culpritId": "suspect_N",
    "explanation": "",
    "evidenceIds": ["clue_N"],
    "reasoningSummary": ""
  }
}
```

Difficulty configuration (single source of truth in `config/difficulty.js`):

| Difficulty | Suspects | Clues | Hints | Base points | Min `evidenceIds` |
|---|---:|---:|---:|---:|---:|
| easy | 3 | 5 | 2 | 100 | 3 |
| medium | 4 | 7 | 3 | 150 | 4 |
| hard | 5 | 9 | 3 | 200 | 5 |

## 18. AI Validation Rules

Zod schema + service checks. A mystery is accepted only if ALL pass:

1. All required fields present, correct types, length limits respected.
2. Suspect/clue/hint counts exactly match the difficulty.
3. IDs match `suspect_N` / `clue_N` / `hint_N` and are unique within their lists.
4. `culpritId` refers to an existing suspect.
5. Every `evidenceIds` and `relatedSuspectIds` entry refers to an existing clue/suspect.
6. `evidenceIds` has at least the minimum count for the difficulty, with no duplicates.
7. `explanation` and `reasoningSummary` mention the culprit's name, and do not name any other suspect as the culprit.
8. Hints do not contain the culprit's name or ID (case-insensitive).
9. Teaser `description` fields do not contain the culprit's name in an accusatory form and do not duplicate `content`.
10. Every suspect appears in at least one clue's `relatedSuspectIds`.
11. Text fields are non-empty after trimming and contain no raw markup/HTML (stripped/escaped).

Optional quality review: a second, low-cost Gemini call asks "Is the culprit uniquely determined by the evidence? Any contradictions?" returning `{ solvable: boolean, issues: [] }`. If `solvable` is false, count as a failed attempt. This step may be disabled via `ENABLE_QUALITY_REVIEW=false` to control latency and quota.

Error codes:
- `AI_INVALID_RESPONSE` (502) — output failed validation after max attempts.
- `AI_UNAVAILABLE` (503) — upstream failure.

## 19. Mystery Consistency Requirements

- Exactly one culprit; the explanation must follow from the stored clues.
- At least one clue must implicate or exonerate each suspect.
- Alibis and clues must not contradict the story timeline except where the contradiction is the intended evidence.
- Not all clues must point to the culprit; some may exonerate others or be red herrings, but a red herring must never contradict the solution.
- Automated checks cannot guarantee narrative logic; representative generated samples are reviewed manually and recorded in the test report.

## 20. Clue Discovery Behavior

- Clue content is stored server-side; undiscovered clues expose only `id`, `title`, and the teaser `description`.
- Discovery uses a single atomic update:
  `findOneAndUpdate({ _id, playerTokenHash, status: 'active', 'clues.id': clueId, discoveredClueIds: { $ne: clueId } }, { $addToSet: { discoveredClueIds: clueId } })`.
- If the clue was already discovered, return `200` with `alreadyDiscovered: true`; no change to score.
- Clue points are derived from `discoveredClueIds.length × 5`, so they cannot be double-counted.
- Progress survives refresh (stored in MongoDB).

## 21. Hint Behavior

- Hints are returned strictly in order: `hints[hintsUsed]`.
- Atomic claim: `findOneAndUpdate({ _id, playerTokenHash, status: 'active', hintsUsed: { $lt: maxHints } }, { $inc: { hintsUsed: 1 } }, { new: true })`; the returned document's `hintsUsed` determines which hint is returned (`hints[hintsUsed - 1]`).
- If the filter fails because the limit was reached → `409 NO_HINTS_REMAINING`.
- Already-requested hints are re-delivered in `GET /api/cases/:id` without further cost.
- Hints never state the culprit; final hint may narrow possibilities.

## 22. Accusation Behavior

1. Validate `suspectId` and case ownership.
2. Atomic completion: update only where `status: 'active'`, setting `accusedSuspectId`, `verdict`, `score`, `completedAt`, `status: 'completed'` in one operation, with the score computed from the document read in that same operation window (use a transaction or an optimistic filter on `discoveredClueIds`/`hintsUsed` values read; retry on mismatch).
3. If the case is already completed → `409 CASE_COMPLETED`, stored verdict untouched.
4. Return the full Result (culprit, explanation, evidence, score).
- One accusation per case; an incorrect accusation ends the case.

## 23. Scoring Algorithm

Implemented only in `scoringService.js`. Integer math.

```
basePoints   = (accusation correct) ? BASE[difficulty] : 0     // easy 100, medium 150, hard 200
cluePoints   = uniqueDiscoveredClues × 5
hintPenalty  = hintsUsed × 10
finalScore   = max(0, basePoints + cluePoints − hintPenalty)
```

Examples:
- Medium, correct, 4 clues, 1 hint: 150 + 20 − 10 = **160**.
- Medium, incorrect, 4 clues, 1 hint: 0 + 20 − 10 = **10**.
- Easy, incorrect, 0 clues, 2 hints: max(0, 0 + 0 − 20) = **0**.

Rules:
- Client-supplied scores are ignored (endpoints accept no score fields).
- Final score and breakdown are persisted at accusation and returned unchanged thereafter.
- During play, `currentPoints = max(0, cluePoints − hintPenalty)` is a non-authoritative preview.

## 24. Security Requirements

**Solution protection**
- Public responses are built only through explicit serializer functions (`toPublicCase`, `toResult`); a raw Mongoose document is never returned.
- Queries for public routes use projection to exclude `solution`, undiscovered `clues.content`, `clues.significance`, and unrequested `hints.content` where practical; serializers are the second line of defense.
- Culprit appears only in `toResult`, which runs only for completed cases.
- Error messages, logs, and debug output never contain solution data.

**Input validation**: Zod on every body/param; ObjectId validation; body size limit 10kb; premise limits.

**API protection**
- CORS allowlist from `CLIENT_URL` (comma-separated), `credentials: true`.
- Rate limits: `POST /api/cases` — 10 per hour per IP (configurable); all other routes — 120 per 15 minutes per IP.
- Helmet security headers.
- Central error handler; stack traces hidden when `NODE_ENV=production`.

**Secrets**: `.env` files git-ignored; `.env.example` has placeholders only; API key backend-only, never in `VITE_*` variables.

**Prompt-injection**: premise is passed as quoted data; output is always schema-validated; the premise cannot change schema, counts, or scoring.

**Anonymous sessions**
- On first request, server issues a random 32-byte token in cookie `mr_session` (`HttpOnly`, `SameSite=Lax` — use `SameSite=None; Secure` when frontend and backend are on different sites in production, `Secure` in production).
- The server stores only the SHA-256 hash of the token on each case. Case routes require a matching hash; mismatch → `403`.
- Case IDs are not treated as authorization. No tokens in localStorage.
- Limitation: clearing cookies loses access to in-progress cases (documented, §29).

**Database**: updates use explicit field paths and operators; no client-supplied object is merged into a document.

## 25. Testing Strategy

**Backend unit tests**: difficulty config; mystery schema validation (counts, duplicate IDs, bad culprit, bad evidence refs, hint leakage); scoring (correct, incorrect, clue points, hint penalties, floor at 0).

**Backend integration tests** (Supertest, in-memory MongoDB, mocked Gemini): request validation; public retrieval contains no `solution`, no undiscovered clue `content`, no unrequested hints; clue discovery and repeat; hint sequencing and limit; concurrent hint/clue requests (parallel `Promise.all`); invalid suspect; correct/incorrect accusation; result before/after completion; repeated accusation unchanged; session ownership (401/403); error response format.

**Frontend tests**: Home navigation; premise validation and counter; difficulty selection; loading and error states; suspect selection; clue discovery UI; hint request/disable; accusation confirmation; results rendering.

**Manual E2E checklist** (Easy, Medium, Hard): home → create → generate → inspect → discover clues → hint → refresh (progress preserved) → accuse → verify verdict/score → open `/results/:id` directly → play again.

**Rules**: Gemini is always mocked in automated tests. Real Gemini and MongoDB Atlas are verified manually and reported honestly as tested/untested.

## 26. Acceptance Criteria

**Generation**: Easy 3/5/2, Medium 4/7/3, Hard 5/9/3; schema-valid; invalid output rejected or regenerated within 3 attempts, never persisted.
**Investigation**: story and suspects render; clues discoverable; progress persists across refresh; repeat discovery gives no extra points; hints sequential and capped; hint usage persists.
**Security**: no culprit/solution before accusation; undiscovered clue content never returned; no API key in client bundle; client scores ignored; completed cases immutable.
**Scoring**: matches §23 for all examples; never negative; persisted and consistent on repeated reads.
**Results**: correct verdict, culprit revealed, explanation consistent with the stored solution, correct breakdown, available after reload.
**Deployment**: frontend builds; backend starts with valid config; MongoDB connects; Gemini generation works with valid credentials; frontend ↔ backend works via configured URLs; a full session works in production.

## 27. Deployment Architecture

- Frontend: static host (e.g., Vercel/Netlify/Cloudflare Pages), SPA fallback rewrite to `index.html`.
- Backend: Node host (e.g., Render/Railway/Fly.io), `npm start`, health check `/api/health`, `trust proxy` enabled behind the platform proxy.
- Database: MongoDB Atlas with IP/network allowlist and a least-privilege DB user.
- Config via environment variables only.
- Cross-site cookies: if frontend and API are on different registrable domains, use `SameSite=None; Secure` and HTTPS everywhere; prefer a shared parent domain where possible.
- Deployment is "complete" only after an actual deployed session is verified; otherwise deliver config + manual steps.

## 28. Environment Variables

**server/.env.example**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
CLIENT_URL=http://localhost:5173
GEMINI_TIMEOUT_MS=30000
MAX_GENERATION_ATTEMPTS=3
ENABLE_QUALITY_REVIEW=false
GENERATION_RATE_LIMIT_PER_HOUR=10
```

**client/.env.example**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

The backend validates required variables (`MONGODB_URI`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CLIENT_URL`) at startup and exits with a clear, non-sensitive message if any is missing.

## 29. Known Limitations

- Anonymous sessions: clearing cookies or switching devices loses access to cases; no accounts or cross-device sync in v1.
- AI logic: schema and reference validation cannot fully guarantee narrative solvability; some generated mysteries may be weak or ambiguous.
- Generation latency depends on Gemini (typically several seconds; retries add more).
- One accusation per case; no "second chances".
- Rate limits are per-IP and can affect shared networks.
- Teaser descriptions rely on prompt rules and heuristic checks to avoid leaking the answer.
- No leaderboard, case history, or multiplayer in v1.

## 30. Final Deliverables

1. `SPEC.md` (this document)
2. `IMPLEMENTATION_PLAN.md` — checklist with progress
3. `README.md` — setup, run, test, build, deploy, troubleshoot, API docs
4. `client/` — React application
5. `server/` — Express application
6. Mongoose model and Zod schemas
7. Gemini service with structured-output validation
8. Secure API endpoints
9. Scoring service
10. Automated tests (backend + frontend)
11. `.env.example` files
12. `.gitignore`
13. Deployment configuration
14. API contracts (this spec + README)
15. Final acceptance-test report (tested vs. unverified)

---

## Appendix A — Implementation Checklist

- [ ] Step 1: Inspect workspace; finalize SPEC.md
- [ ] Step 2: Project foundation (client/server init, scripts, env examples, .gitignore)
- [ ] Step 3: Backend foundation (app, env validation, DB, errors, model, validators, sessions)
- [ ] Step 4: Gemini integration, schemas, validation, retries, serializers
- [ ] Step 5: Game logic (retrieve, discover, hints, accuse, result, scoring, concurrency)
- [ ] Step 6: Backend tests passing
- [ ] Step 7: Frontend (design system, 5 pages, API wiring)
- [ ] Step 8: Frontend tests passing
- [ ] Step 9: Integration (real MongoDB, real Gemini, privacy verification)
- [ ] Step 10: Production prep (build, lint, security review, README, acceptance report)

## Appendix B — Error Format

```json
{ "success": false, "error": { "code": "INVALID_REQUEST", "message": "Please provide a valid mystery premise." } }
```

| Status | Codes |
|---|---|
| 400 | INVALID_REQUEST, INVALID_ID |
| 401 | NO_SESSION |
| 403 | FORBIDDEN |
| 404 | CASE_NOT_FOUND, CLUE_NOT_FOUND, SUSPECT_NOT_FOUND |
| 409 | CASE_COMPLETED, CASE_NOT_COMPLETED, NO_HINTS_REMAINING |
| 422 | UNPROCESSABLE_CONTENT |
| 429 | RATE_LIMITED |
| 500 | INTERNAL_ERROR |
| 502 | AI_INVALID_RESPONSE |
| 503 | AI_UNAVAILABLE, DB_UNAVAILABLE |
