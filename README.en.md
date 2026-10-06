# 832402220 Calculator Frontend

[中文](README.md) | **English**

Vue 3 + Vite frontend for the separated calculator assignment. It provides Chinese/English calculator, number-base, and unit-conversion interfaces. All calculations and conversions run on the FastAPI backend, and successful results share PostgreSQL-backed history.

## Online application

- Public URL: <https://832402220-calculator-frontend.vercel.app>
- Backend API: <https://eight32402220-calculator-backend.onrender.com>

The frontend is deployed on Vercel. The backend is a Render service backed by Neon PostgreSQL. Because the free backend service may sleep while idle, the first calculation after inactivity can take longer; retry after the service wakes if necessary.

The production deployment is connected to the `main` branch of this public GitHub repository.

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

The browser stores no database credentials. `VITE_API_BASE_URL` selects the HTTP API origin at build time; all calculation, conversion, and history persistence stays in the backend.

## Directory guide

| Path | Role |
| --- | --- |
| `src/App.vue` | Calculator controls, bilingual labels, loading/error state, and history list |
| `src/components/BaseConverter.vue` | Signed integer-base conversion form and reference table |
| `src/components/UnitConverter.vue` | Unit conversion form, category selection, and reference table |
| `src/api.js` | `fetch` wrapper for calculation, conversion options, conversion, and history requests |
| `src/i18n.js` | Chinese/English UI strings |
| `src/history.js` | Client-side expression search for loaded history |
| `src/history-refresh.js` | Shared history updates, request ordering, and deletion state |
| `src/keyboard.js` | Calculator keyboard shortcuts |
| `src/style.css` | Layout and visual styling |
| `src/main.js` | Vue application entry point |
| `vite.config.js` | Vite + Vue plugin configuration |
| `.env.example` | Public API-origin template; copy to `.env` for local development |

## Theme scope

The compact layout places the calculator on the left and calculation history on the right. Screens up to 720px wide stack the panels vertically. History uses pagination without an internal scrolling panel, and long expressions and results wrap within the available width.

The frontend provides exactly two fixed visual themes: Light and Dark. The theme button switches between them for the current page and does not persist the selection. Theme changes are frontend-only visual behavior; they do not change backend, database, API, or deployment settings.

The page uses the local `public/backgrounds/green-algebra-chalkboard-advanced.png` image as a decorative mathematics backdrop. CSS keeps the image layer opaque, applies a 0.35px blur with mild contrast and saturation adjustments, and uses a theme-specific overlay (34% in light mode, 36% in dark mode). The image is intentionally decorative: all readable content remains in the solid or translucent calculator panels, and no external image request is required at runtime.

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
npm test          # API-client, localization, history-search, and keyboard regression tests
npm run preview   # serve the production build locally
```

The generated `dist/` directory is a build artifact and is ignored by Git.

## User flow and API calls

The expression is an editable text field. Keypad and scientific buttons insert at the current cursor or replace the selected text, so expressions can be corrected in place. `×` and `÷` are converted to `*` and `/` before the request; `π` is sent unchanged for the backend parser. On submit, the frontend calls:

```http
POST /api/calculate
Content-Type: application/json

{"expression":"(1+2)*3"}
```

On success, the returned `result` is displayed and the returned record is added to shared history. `GET /api/history` loads saved records when the page opens or refreshes. Each history row can be deleted with `DELETE /api/history/{id}`. The backend returns bilingual error messages for invalid expressions and division by zero; the selected UI language determines which message is shown.

This basic assignment has no login: every visitor sees the same database history. Refreshing the browser preserves history, while the current expression and language choice are UI state.

The parser accepts decimal numbers, parentheses, `+ - * /`, unary signs, right-associative `^`, scientific notation such as `1.2e-3`, constants `pi`/`π`/`e`, and the fixed single-argument functions `sin`, `cos`, `tan`, `sqrt`, `ln`, `log10`, and `exp`. Trigonometric functions use radians (the page shows `RAD / 弧度`); convert degrees explicitly, for example `30*π/180`. The parser rejects arbitrary code and unsupported characters. The backend repository's README contains the full status-code and response contract.

The scientific toolbar inserts `π`, `e`, `^`, `sqrt(`, and the supported function names. Function buttons insert an opening parenthesis; close it with the `)` key. Results remain strings in the UI, so large or precise backend results are not rounded through JavaScript `Number`.

## Number-base and unit conversion

The three tabs are **Calculator**, **Number bases**, and **Unit converter**. Conversion choices, bilingual unit names, reference relationships, and temperature limits come from `GET /api/convert/options`. If options fail to load, the page shows an error with a retry button. Editing a value, category, or source/target unit clears the previous conversion result.

### Integer-base conversion

Select the source and target bases (2, 8, 10, or 16), enter a signed integer, and choose Convert. For example, decimal `255` becomes hexadecimal `FF`, and hexadecimal `-ff` becomes decimal `-255`. Hexadecimal input accepts either letter case; output uses uppercase letters. The reference table lists allowed digits and examples.

Inputs must be integers without `0b`, `0o`, or `0x` prefixes. Decimal fractions, arithmetic expressions, scientific notation, and digits outside the selected base are rejected. Input is limited to 400 characters and output to 200 characters; negative results retain a minus sign rather than using two's complement.

```http
POST /api/convert/base
Content-Type: application/json

{"value":"255","from_base":10,"to_base":16}
```

The result is `"FF"`, and its history expression is `BASE 255 (10) → (16)`.

### Unit conversion

Select one of six categories, then the source and target units. Only units within the same category can be converted. The reference table updates with the category; temperatures also show a minimum-temperature column.

| Category | Available units | Example |
| --- | --- | --- |
| Length | nm, μm, mm, cm, m, km | 250 cm → 2.5 m |
| Mass | mg, g, kg, t | 1.5 kg → 1500 g |
| Area | mm², cm², m², ha, km² | 2 m² → 20000 cm² |
| Volume | mL, cm³, L, dm³, m³ | 1.25 L → 1250 mL |
| Time | ms, s, min, h, d | 1.5 h → 90 min |
| Temperature | °C, °F, K | 0 °C → 32 °F |

Values are strings accepting signed decimals and scientific notation such as `1.2e-3`; arithmetic expressions are not accepted. The backend uses exact rational arithmetic and rounds once to at most 50 significant digits. `≈` marks precision loss; exact results have no approximation mark. Inputs are limited to 100 characters and 50 significant digits. Nonzero numeric values must have a decimal exponent between −10000 and 10000; results have at most 200 characters.

```http
POST /api/convert/unit
Content-Type: application/json

{"category":"length","value":"250","from_unit":"cm","to_unit":"m"}
```

The API result is `"2.5"`, displayed as **2.5 m**. Its history expression is `UNIT 250 cm → m`. API unit IDs use `um`, `m2`, `cm2`, `ml`, `l`, `c`, `f`, and `k` where the interface shows μm, m², cm², mL, L, °C, °F, and K. See the [backend API reference](https://github.com/w1457344108-coder/832402220_calculator_backend) for all IDs and request examples.

Temperature conversion uses absolute temperatures. Values below absolute zero (−273.15 °C, −459.67 °F, or 0 K) show a bilingual error and create no history record. `t` denotes a metric tonne and `nm` denotes a nanometre; mass is not converted to force, and a day is exactly 24 hours.

Successful conversions share the calculator's persistent history. Return to the Calculator tab to view, search, paginate (five rows per page), or delete them. Search `BASE` or `UNIT` to find conversion records; refreshing the page reloads them from the backend database.

## History search

The search field filters the complete array already returned by `GET /api/history` in the browser. It trims surrounding whitespace and compares expression substrings without letter-case differences; for example, `10/2` matches `10/2+7`. Clearing the search restores all loaded records, and the count badge always shows the total loaded history.

Searching makes no API request and does not change stored records. This is client-side filtering, not SQL search or server pagination. An empty history and a search with no matches show separate bilingual messages.

## Keyboard shortcuts

When focus is outside an editable control, the calculator also accepts these shortcuts:

| Key | Action |
| --- | --- |
| `0`–`9`, `.`, `+`, `-`, `(`, `)` | Insert at the cursor or replace the selection |
| `*`, `/` | Insert `×` or `÷` |
| `Enter`, `=` | Calculate once (a held key does not submit repeatedly) |
| `Backspace` | Use native input editing; the on-screen button removes the selection or previous character |
| `Escape` | Clear the expression and result |

The history search field, other text controls, content-editable areas, IME composition, and modified shortcuts using Ctrl, Command, or Alt keep their normal browser behavior. Enter and Space also keep native activation for focused buttons. While a calculation request is pending, expression editing, keypad buttons, clear, and backspace are disabled; language, theme, and history browsing remain available. HTTP 422 request-validation responses show a bilingual input error, while network failures retain the service-unavailable message.

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
- Decimal `255` to hexadecimal returns `FF`; binary `102` displays an input error.
- 250 cm to m returns `2.5 m`; 0 °C to °F returns `32 °F`.
- A temperature below absolute zero is rejected.
- `BASE` and `UNIT` records remain in calculator history after refresh.
- If the first request is slow, wait for the free Render service to wake and try again.

The repository is public for assignment review. Never put database credentials in this frontend repository; `VITE_API_BASE_URL` is a public URL, while database secrets belong only in Render/Neon configuration. `.env` is ignored by Git; commit only the safe `.env.example` template.
