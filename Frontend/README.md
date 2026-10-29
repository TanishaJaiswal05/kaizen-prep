# Kaizen Prep — Web

React client for [Kaizen Prep](../README.md). Vite + React 19 + React Router 7, styled with SCSS.

## Run

```bash
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:3000
npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server on port 5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Structure

```
src/
  components/          # shared UI primitives
  pages/               # route-level pages outside the feature folders
  features/
    auth/              # context, useAuth hook, api service, Login/Register, Protected
    interview/         # context, useInterview hook, api service, Home/Interview
```

Each feature follows the same flow: **api service → context → hook → page**. Pages never call Axios directly.

All requests use `withCredentials: true`, because the API issues its session as an HTTP-only cookie. Set `VITE_API_URL` when the API is not on `http://localhost:3000`.
