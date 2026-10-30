# Kaizen Prep — Web

React client for [Kaizen Prep](../README.md). Vite + React 19 + React Router 7, styled with SCSS.

## Run

```bash
npm install
npm run dev
```

The client targets `http://localhost:3000` in development. Set `VITE_API_URL` in `Frontend/.env` to point it elsewhere.

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
