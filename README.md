# StartupIQ

AI business-idea validation for first-time founders in Pakistan. Someone describes
an idea in plain language, and StartupIQ returns a scored report — a decision
(GO / MODIFY / DON'T LAUNCH YET) with a viability score, market demand, target
customer, competition, pricing, financial fit, marketing, sourcing, risks, a
phased launch roadmap and next actions — before they spend money on it.

It is a free-tier MVP: one AI key shared by every visitor, no accounts, no
database, no payments.

## What it does not do

StartupIQ works from what the person types, plus the model's general knowledge of
the category. It has **no internet access and no live data feeds**. It does not
scrape competitor listings, check current market prices, or verify anything
against a real market — every figure in a report is an estimate to check before
spending money, and the UI says so. A report is structured guidance, not market
research.

## Run it

Requires Node.js 22.12 or newer (`npm run server` uses `--env-file-if-exists`,
which Node 20.x does not have).

```bash
npm install
cp .env.example .env      # then set AI_PROVIDER and whatever it needs
npm run server            # Express API -> http://localhost:3001
npm run dev               # Vite app    -> http://localhost:5173
```

Two terminals: the API and the site are separate processes. In development Vite
proxies `/api` to `http://localhost:3001` (see `vite.config.js`), so the frontend
only ever uses relative URLs and never sees a key.

With `AI_PROVIDER=none` everything still runs: the form validates and the API
answers, with `analysis: null` instead of a report — nothing is invented to fill
the gap.

## Configuration

Every value the AI layer needs comes from the environment;
[`.env.example`](.env.example) is the annotated list. No key is embedded,
defaulted, logged, or returned to a client, and error text is scrubbed of known
secret values before it reaches the console.

| Variable | Purpose | Default |
| --- | --- | --- |
| `AI_PROVIDER` | `gemini`, `ollama`, `openai-compatible`, or `none` | `none` |
| `GEMINI_API_KEY` | required for `gemini` | — |
| `GEMINI_MODEL` | model name | `gemini-3.6-flash` |
| `OLLAMA_BASE_URL` / `OLLAMA_MODEL` | local Ollama; empty model auto-detects an installed one | `http://localhost:11434` |
| `AI_BASE_URL` / `AI_MODEL` / `AI_API_KEY` | any OpenAI-compatible endpoint (LM Studio, vLLM, a hosted gateway) | `http://localhost:1234/v1` |
| `AI_TIMEOUT_MS` | how long one generation may take | `60000` |
| `AI_PROBE_TIMEOUT_MS` | availability probe for local runtimes | `1500` |
| `PORT` | API port | `3001` |

`.env` is git-ignored and `.env.example` is the committed template. Node reads
`.env` once when the process starts, so restart the server after editing it.

## The one endpoint

`POST /api/analyze` accepts JSON (capped at 100 kB) and returns the report.

```jsonc
{
  "businessIdea": "…",              // 20–2000 characters
  "targetCustomer": "…",            // 3+ characters
  "location": "…",                  // required
  "businessType": "Ecommerce",      // Product | Service | Ecommerce | Local Business | SaaS / App | Other
  "budget": { "amount": 120000, "currency": "PKR" },
  "additionalInformation": null     // ≤1000 characters; "additionalInfo" is accepted as an alias
}
```

| Status | Body | When |
| --- | --- | --- |
| `200` | `{ success, provider, model, analysis, received, receivedAt }` | a provider returned a complete, schema-valid report |
| `200` | `{ success, providerStatus, analysis: null, expectedAnalysisShape }` | no provider configured or reachable |
| `400` | `{ error: 'VALIDATION_ERROR', errors: { field: message } }` | a field failed validation (checked in the browser too, and again here — the client is not trusted) |
| `400` | `{ error: 'INVALID_JSON' }` | the body was not JSON |
| `413` | `{ error: 'PAYLOAD_TOO_LARGE' }` | body over 100 kB |
| `429` | `{ error: 'RATE_LIMITED' }` with `Retry-After` | this client hit the limits below |
| `429` | `{ error: 'AI_RATE_LIMITED' }` | the AI provider itself throttled the request |
| `502` | `{ error: 'AI_ANALYSIS_FAILED' }` or `{ error: 'AI_UNREACHABLE' }` | the provider answered badly, incompletely, or not at all |
| `503` | `{ error: 'AI_CONFIGURATION_ERROR' }` | a provider was selected but is misconfigured (missing or rejected key) |

Client-facing messages are fixed strings picked from a table, never built from a
thrown error, so no credential or upstream response body can reach a browser.

The browser also stops waiting after 150 seconds (`REQUEST_TIMEOUT_MS` in
`src/services/api.js`) so a hung connection cannot spin forever. Aborting the
fetch does not stop the request already running upstream, so that message asks
for a pause rather than an instant second attempt — the quota is shared.

### Rate limits

One shared key has a small daily quota, so `/api/analyze` is limited per client
address **before** it reaches the AI layer: **3 per minute** (a script, or a
held-down submit button — no one runs three analyses in a minute, since one takes
well over a minute) and **10 per 15 minutes** (a generous ceiling, so honest
exploration never brushes against it). Rejections log a hashed client tag rather
than an address, and are answered here rather than by the AI layer, so
`RATE_LIMITED` and an `AI_*` failure stay distinguishable — they need different
fixes.

Counters live in this process: a restart clears them, and a second instance would
get its own budget. Right-sized for a single-instance MVP; move to shared storage
before scaling out.

## How a report is built

1. The form POSTs to `/api/analyze`; the server validates it independently.
2. `server/ai/prompt.js` builds the prompt **from**
   `server/schemas/analysisResponse.js`, so the instructions and the checker
   cannot drift apart.
3. The reply is parsed (`parseModelJson.js`) and run through `schemaGuard.js`.
   The guard is all-or-nothing: a missing field, an out-of-range enum, or an
   absurd figure fails the whole request as `AI_BAD_OUTPUT` rather than letting a
   half-shaped report reach the page.
4. The frontend derives what the model is never asked to compute: the five
   sub-scores and the decision band come from `src/utils/subScores.js` and
   `src/utils/decision.js`. `GO` is 70+, `MODIFY` 45–69, below that `DON'T LAUNCH
   YET`, and a missing score means no decision rather than a guessed one. An
   estimate the model could not make stays `null` and renders as "not enough
   data" — it is never coerced into a scoreable zero.
5. Reports are saved in the browser only (`localStorage`, key
   `startupiq.reports.v1`), listed on the results page, and can be deleted there.

`financialFit.costEstimate` is the **fully loaded** cost of one delivered sale — item or material,
packaging, box, inserts, courier, and the expected loss from failed or returned cash-on-delivery orders
where those apply — not the purchase price of the stock. The per-sale figure derived from it is therefore
a contribution before marketing, rent and the founder's own time, and StartupIQ deliberately never
calculates a net profit: ad spend, conversion and overheads are not collected, so any net number would be
invented rather than estimated.

### Adding or switching a provider

`server/ai/index.js` holds a registry of providers, each implementing
`{ id, label, detect, analyze }` and checked against that contract on import.
Adding one means adding a file to `server/ai/providers/` and listing it there,
then setting `AI_PROVIDER` — the route, the schema and the frontend do not change.

## Layout

```
server/
  index.js                Express app: JSON limit, 404 and error handlers
  routes/analyze.js       the single endpoint, safe-error mapping, request logs
  middleware/             sliding-window rate limit
  validation/             server-side rules for a submission
  schemas/                the one response schema (prompt and guard both read it)
  ai/                     config, provider registry, prompt, JSON parsing, guard
    providers/            gemini, ollama, openai-compatible
src/
  pages/                  LandingPage, IdeaFormPage (/validate), ResultsPage (/results)
  components/             landing sections, form field, dashboard/ for the report
  services/api.js         the only place the frontend calls the backend
  services/storage.js     localStorage reports
  utils/                  formatting, sub-score derivation, decision logic
```

Routes are `/`, `/validate` and `/results`; anything else redirects to the
landing page. Every analysis logs one `[analyze]` line with a short request id,
status, byte count and elapsed time, and rejections add a `[rate-limit]` line —
both on the server's stdout.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server with the `/api` proxy |
| `npm run server` | Express API on `PORT`, loading `.env` |
| `npm run build` | production bundle into `dist/` |
| `npm run preview` | serve the built `dist/` locally |
| `npm run lint` | `oxlint` over the repo |

There is no test runner — lint is the only automated check, and behavior is
confirmed by running the flows. Verify logic locally (a throwaway Node script
against the real modules) rather than by spending AI requests: the daily quota is
the scarcest resource here.

## Deploying

Nothing is wired for production yet. Two things will bite first:

- `server/index.js` serves only `/api`. It does **not** serve `dist/`, so a host
  needs static file serving for the built app (or two separate services). `dist/`
  is git-ignored and goes stale — rebuild it as part of the deploy.
- The rate limiter keys on `req.ip`, which Express only resolves to the real
  visitor when the operator sets `trust proxy` for the hop in front of it.
  Without that, every visitor behind the proxy shares one bucket; and forwarding
  headers cannot simply be trusted, because a client can invent them.

Also worth knowing before launch: the shared AI key's daily quota is the real
capacity limit, and the results page reads reports from `localStorage`, so
results do not follow a person to a different device or browser.
