# AI Mystery Room 🕵️‍♂️🔍

An AI-powered detective mystery game where players generate custom mysteries from any premise, investigate suspects, uncover physical evidence, request sequential hints, and deliver a formal accusation with server-authoritative scoring.

---

## Architecture Overview

```
React (Vite) ──Axios──▶ Express API (:3000) ──▶ CaseStore (Atomic State)
                            │
                            └──▶ Google Gemini (@google/genai)
```

- **Zero Solution Leakage**: The culprit identity and solution explanation are strictly sealed server-side and never returned in `GET /api/cases/:id`. Only after a formal accusation is accepted does `GET /api/cases/:id/result` reveal the culprit.
- **Fair-Play Consistency Engine**: Every generated case is validated against 11 consistency rules (exact suspect/clue/hint counts, ID formatting, cross-references, no premature culprit name leaks in hints or teasers).
- **Authoritative Server Scoring**: Integer scoring is calculated exclusively on the backend and stored immutably upon accusation.

---

## Scoring Formula

```
basePoints   = (accusation correct) ? BASE[difficulty] : 0  // easy: 100, medium: 150, hard: 200
cluePoints   = uniqueDiscoveredClues × 5
hintPenalty  = hintsUsed × 10
finalScore   = max(0, basePoints + cluePoints - hintPenalty)
```

During investigation:
```
currentPoints = max(0, cluePoints - hintPenalty)  // preview excluding base bounty
```

---

## Difficulty Configuration

| Difficulty | Suspects | Clues | Hints | Base Bounty | Min Evidence IDs |
|---|---:|---:|---:|---:|---:|
| **Easy** | 3 | 5 | 2 | 100 pts | 3 |
| **Medium** | 4 | 7 | 3 | 150 pts | 4 |
| **Hard** | 5 | 9 | 3 | 200 pts | 5 |

---

## API Endpoints

- `GET /api/health` — Health check status
- `POST /api/cases` — Generate mystery from premise (`{ premise, difficulty }`)
- `GET /api/cases/:id` — Retrieve public case dossier (undiscovered clues hidden, solution sealed)
- `POST /api/cases/:id/clues/:clueId/discover` — Discover physical clue (+5 pts, idempotent)
- `POST /api/cases/:id/hints` — Claim next sequential hint (-10 pts penalty)
- `POST /api/cases/:id/accuse` — Submit irrevocable accusation (`{ suspectId }`)
- `GET /api/cases/:id/result` — Retrieve official post-game verdict, culprit, and explanation

---

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Set GEMINI_API_KEY
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Build for production:
   ```bash
   npm run build
   npm start
   ```
