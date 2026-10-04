# 832402220 Calculator Frontend

Vue 3 + Vite frontend for the separated calculator assignment. It provides a simple bilingual calculator UI, sends expressions to the FastAPI backend, and displays the PostgreSQL-backed calculation history returned by that API.

## Online application

- Public URL: <https://832402220-calculator-frontend.vercel.app>
- Backend API: <https://eight32402220-calculator-backend.onrender.com>

The frontend is deployed on Vercel. The backend is a Render service backed by Neon PostgreSQL. Because the free backend service may sleep while idle, the first calculation after inactivity can take longer; retry after the service wakes if necessary.

## Architecture

```text
Browser (Vue 3 + Vite)
        │ fetch() with JSON
        ▼
FastAPI backend on Render
        │
        ▼
Neon PostgreSQL
```

The browser stores no database credentials. `VITE_API_BASE_URL` selects the HTTP API origin at build time; all calculation and history persistence stays in the backend.

## Directory guide

| Path | Role |
| --- | --- |
| `src/App.vue` | Calculator controls, bilingual labels, loading/error state, and history list |
| `src/api.js` | Small `fetch` wrapper for calculate, list, and delete requests |
| `src/i18n.js` | Chinese/English UI strings |
| `src/style.css` | Layout and visual styling |
| `src/main.js` | Vue application entry point |
| `vite.config.js` | Vite + Vue plugin configuration |
| `.env.example` | Public API-origin template; copy to `.env` for local development |

## Requirements and local setup

- Node.js 22.12 or newer is recommended (the locked Vite version also supports Node 20.19+ in the 20.x line)
- npm
- A running backend at `http://localhost:8000` (see the backend repository's README for PostgreSQL and API setup)

Run these commands from this frontend repository's root directory to install dependencies and configure the API origin:

```bash
npm install
cp .env.example .env
```

`.env` should contain only the public backend URL:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Start the Vite development server:

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The backend must include that origin in its `CORS_ORIGINS` value. Vite reads `VITE_*` variables when the dev server starts, so restart it after changing `.env`.

## Available commands

```bash
npm run dev       # local development server
npm run build     # production build in dist/
npm test          # API-client regression tests
npm run preview   # serve the production build locally
```

The generated `dist/` directory is a build artifact and is ignored by Git.

## User flow and API calls

The keypad appends supported symbols to the expression. `×` and `÷` are converted to `*` and `/` before the request. On submit, the frontend calls:

```http
POST /api/calculate
Content-Type: application/json

{"expression":"(1+2)*3"}
```

On success, the returned `result` is displayed and the history is refreshed with `GET /api/history`. Each history row can be deleted with `DELETE /api/history/{id}`. The backend returns bilingual error messages for invalid expressions and division by zero; the selected UI language determines which message is shown.

This basic assignment has no login: every visitor sees the same database history. Refreshing the browser preserves history, while the current expression and language choice are UI state.

The parser accepts decimal numbers, parentheses, `+ - * /`, and unary signs. It rejects arbitrary code and unsupported characters. The backend repository's README contains the full status-code and response contract.

## Deploying on Vercel

Create a Vercel project from this frontend repository. Leave Root Directory at the repository root because `package.json` is already there. Select a supported Node.js version and use:

- Install command: `npm install` (or Vercel's default)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://eight32402220-calculator-backend.onrender.com`

Redeploy after changing the environment variable because Vite embeds it into the static build. The Render backend must allow the final Vercel origin in its `CORS_ORIGINS` variable.

## Acceptance checklist

- The public URL loads without a build error.
- Calculating `1+2*3` displays `7`.
- Switching between 中文 and English changes the visible labels; repeat a failing calculation to check the error in the selected language.
- Refreshing the page retains history because it is loaded from the backend database.
- Deleting a history row removes it from the list.
- `1/0` displays a controlled bilingual error.
- If the first request is slow, wait for the free Render service to wake and try again.

The repository may stay private. Invite the teacher's GitHub account as a collaborator when review access is needed (or grant the Read role for an organization repository). Never put database credentials in this frontend repository; `VITE_API_BASE_URL` is a public URL, while database secrets belong only in Render/Neon configuration. `.env` is ignored by Git; commit only the safe `.env.example` template.
