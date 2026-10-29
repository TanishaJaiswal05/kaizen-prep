# Kaizen Prep

**Kaizen Prep** turns a job description into a personalised interview strategy. Paste the role, add a resume (or describe yourself in a few lines), and get back a match score, the technical and behavioural questions you are likely to face, the skill gaps that matter, a day-by-day study plan, and a resume rewritten for that specific job.

> _"Kaizen"_ — continuous, incremental improvement. The app is built around one loop: measure the gap, then close it.

---

## Features

- **Match analysis** — a 0–100 score showing how well the profile fits the role, plus severity-ranked skill gaps.
- **Question bank with intent** — technical and behavioural questions, each with the interviewer's intention and a model answer, not just a list.
- **Day-wise preparation plan** — concrete tasks per day instead of generic advice.
- **Tailored resume PDF** — a rewritten, ATS-friendly resume generated from the same inputs and downloaded as a PDF.
- **Saved history** — every report is stored per account and can be revisited from the dashboard.
- **Cookie-based sessions** — JWT in an HTTP-only cookie, server-side revocation on logout.

## Screenshots

| Create a plan | Review the report |
| --- | --- |
| _add `docs/home.png`_ | _add `docs/report.png`_ |

---

## Architecture

```
┌──────────────┐   multipart / JSON    ┌──────────────────┐
│  React + Vite│ ────────────────────▶ │  Express 5 API   │
│  :5173       │ ◀──────────────────── │  :3000           │
└──────────────┘   JSON / PDF blob     └────────┬─────────┘
                                                │
                     ┌──────────────────────────┼──────────────────────────┐
                     ▼                          ▼                          ▼
              ┌────────────┐            ┌──────────────┐           ┌──────────────┐
              │  MongoDB   │            │ Gemini API   │           │  Puppeteer   │
              │  reports + │            │ structured   │           │  HTML → PDF  │
              │  users     │            │ JSON output  │           │              │
              └────────────┘            └──────────────┘           └──────────────┘
```

### Design decisions

- **One schema, three jobs.** The report shape is declared once as a Zod schema in `Backend/src/services/ai.service.js`. The same object is converted to a JSON schema for Gemini's structured-output mode, parsed back with `.parse()` for runtime validation, and mirrored by the Mongoose schema that persists it. There is no hand-written parsing of model output.
- **Reports are documents, not tables.** A report is always read and written as a whole, so its question, skill-gap and plan arrays are embedded sub-documents instead of separate collections.
- **The list endpoint is cheap.** `GET /api/interview` projects away resume text, descriptions and every generated array, so the dashboard never downloads report bodies.
- **Generated resume HTML is cached.** The first download stores `resumeHtml` on the report; later downloads only re-render it through Puppeteer, avoiding a repeated model call.
- **Everything is owner-scoped.** Every report query filters on the authenticated user, including the resume PDF endpoint.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Axios, SCSS |
| Backend | Node.js 20+, Express 5, Mongoose 9 |
| Auth | `jsonwebtoken`, `bcryptjs`, HTTP-only cookie, Mongo token blacklist |
| AI | `@google/genai` (Gemini), `zod`, `zod-to-json-schema` |
| Files | `multer` (in-memory upload), `pdf-parse` (resume text), `puppeteer` (PDF rendering) |

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- A MongoDB instance (local or Atlas)
- A Google Gemini API key

### 1. API

```bash
cd Backend
npm install
cp .env.example .env      # fill in the values below
npm run dev               # node --watch server.js
```

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `3000`) |
| `CLIENT_ORIGIN` | Allowed CORS origin (default `http://localhost:5173`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing key for session tokens |
| `GOOGLE_GENAI_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | Model id (default `gemini-3-flash-preview`) |

`npm install` downloads a Chromium build for Puppeteer (a few hundred MB). Set `PUPPETEER_SKIP_DOWNLOAD=true` if you already have a browser configured.

### 2. Web

```bash
cd Frontend
npm install
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:3000
npm run dev
```

Open <http://localhost:5173>.

---

## API

All interview routes require the session cookie. Errors return `{ "message": string }`, and validation failures add `errors: [{ field, message }]`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness probe |
| `POST` | `/api/auth/register` | Create an account and start a session |
| `POST` | `/api/auth/login` | Start a session |
| `POST` | `/api/auth/logout` | Revoke the current token and clear the cookie |
| `GET` | `/api/auth/get-me` | Current user |
| `POST` | `/api/interview` | Generate a report (`multipart/form-data`: `jobDescription`, `selfDescription`, `resume`) |
| `GET` | `/api/interview` | List the caller's reports (summary fields only) |
| `GET` | `/api/interview/report/:interviewId` | Full report |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Tailored resume as `application/pdf` |

### Report shape

```json
{
  "title": "Senior Frontend Engineer",
  "matchScore": 78,
  "technicalQuestions": [{ "question": "...", "intention": "...", "answer": "..." }],
  "behavioralQuestions": [{ "question": "...", "intention": "...", "answer": "..." }],
  "skillGaps": [{ "skill": "System design", "severity": "high" }],
  "preparationPlan": [{ "day": 1, "focus": "React internals", "tasks": ["..."] }]
}
```

---

## Project layout

```
Backend/
  server.js                 # config → DB → HTTP server
  src/
    app.js                  # middleware, routes, central error handler
    config/database.js
    models/                 # user, interviewReport, blacklist
    middlewares/            # auth, upload, validation
    validators/             # zod request schemas
    controllers/
    services/ai.service.js  # Gemini calls + HTML → PDF
    routes/
Frontend/
  src/
    components/             # shared UI (LoadingScreen)
    pages/                  # NotFound
    features/auth           # context → hook → api → pages
    features/interview      # context → hook → api → pages
```

---

## Scripts

| Location | Command | Purpose |
| --- | --- | --- |
| `Backend` | `npm run dev` | Start with `node --watch` |
| `Backend` | `npm start` | Start once |
| `Frontend` | `npm run dev` | Vite dev server |
| `Frontend` | `npm run lint` | ESLint |
| `Frontend` | `npm run build` | Production build |

CI runs the frontend lint + build and a syntax check of the API on every push (`.github/workflows/ci.yml`).

---

## Limitations & roadmap

- Reports are generated synchronously; a long model call holds the request open. Moving to a job queue with polling would make the UI resilient to timeouts.
- A resume is required to be a PDF; DOCX support would need an extra parser.
- Free-text model output is rendered in the browser (questions/answers) and in Puppeteer (resume HTML). Sanitising both is on the list before any multi-tenant deployment.
- No rate limiting on generation endpoints yet.
- No pagination on the report list.

## License

[MIT](./LICENSE)
