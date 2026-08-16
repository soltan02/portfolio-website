# Pulse — build prompt + integration guide

Two parts: (1) a prompt you paste into Claude Code (or any AI coding tool) to build the monitoring website, and (2) the guide for wiring every deployed project into it.

---

## Part 1 — The build prompt

Copy everything inside the block below and paste it as your first message in Claude Code, run from an empty project folder.

```
Build a self-hosted website health monitoring service called "Pulse".
It monitors multiple websites I own and pinpoints exactly which layer
broke: frontend, backend API, database, or SSL.

## Stack
- Node.js 20 + TypeScript
- Fastify for the API and dashboard server
- PostgreSQL via Prisma (single database, schema below)
- node-cron for the polling worker (runs in the same process, but
  structure the code so the worker can be split to its own process later)
- Frontend: server-rendered pages with plain HTML/CSS + a small amount
  of vanilla JS (no React). Auto-refresh the dashboard every 30 seconds
  via fetch to a JSON endpoint. Clean, flat, light design: white cards,
  0.5px borders, green/amber/red status dots, monospace font for error
  messages.

## Data model (Prisma)
- Site: id, name, url (frontend URL), healthUrl (nullable — backend
  /health endpoint), authToken (nullable — bearer token for healthUrl),
  checkIntervalSeconds (default 60), active (bool), createdAt
- Check: id, siteId, timestamp, layer (enum: FRONTEND | BACKEND |
  DATABASE | SSL), status (enum: UP | DEGRADED | DOWN), latencyMs
  (nullable), httpStatus (nullable), errorMessage (nullable)
- Incident: id, siteId, layer, startedAt, resolvedAt (nullable),
  firstError (text), notified (bool)

## Worker logic (every site, every checkIntervalSeconds)
1. FRONTEND check: GET the site url with a 10s timeout. Record latency
   and HTTP status. status = UP if 2xx/3xx, DEGRADED if latency > 3000ms,
   DOWN on timeout, connection error, or 5xx.
2. SSL check (once per hour per site, not every cycle): read the
   certificate expiry via a TLS socket. DEGRADED if < 14 days left,
   DOWN if expired.
3. BACKEND check (only if healthUrl is set): GET healthUrl with
   Authorization: Bearer <authToken> if a token is set. Expect JSON:
   { "status": "ok" | "degraded" | "error",
     "checks": { "db": {...}, "cache": {...}, ... },
     "latency_ms": number, "version": string }
   Map status to UP/DEGRADED/DOWN. On timeout or non-2xx, DOWN with
   the raw error message stored.
4. DATABASE check: derived from the backend response — read
   checks.db.status from the /health JSON. If the backend itself is
   DOWN, record DATABASE as status UNKNOWN? No — keep the enum to three
   values and record DATABASE as DOWN with errorMessage
   "backend unreachable, db state unknown".
5. Store every result as a Check row. Keep raw error strings verbatim
   (e.g. "ECONNREFUSED 10.0.0.4:5432") — they are the whole point.

## Incident logic
- When a layer transitions UP -> DOWN (confirmed by 2 consecutive
  failed checks to avoid flapping), open an Incident and send alerts.
- When it transitions back to UP (2 consecutive successes), set
  resolvedAt and send a recovery alert.
- Alerts: Telegram bot (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID env
  vars) and a generic outgoing webhook URL (WEBHOOK_URL env var,
  optional). Alert text must name: site, layer, exact error message,
  time started, and a link to the dashboard incident page.

## Dashboard pages
- / : overview. Summary stats (sites monitored, 30-day uptime %, avg
  response, active incidents), then one card per site showing each
  layer as a tile with status color, latency, and — if DOWN — the raw
  error message inline. Active-incident sites sort to the top with a
  red border.
- /site/:id : per-site detail. 24h latency sparkline per layer
  (inline SVG, no chart library), incident history table, current
  config.
- /incidents : all incidents, open first, with duration and first
  error.
- /settings : add/edit/pause sites (name, url, healthUrl, token,
  interval). Protect the whole dashboard with a single shared password
  (DASHBOARD_PASSWORD env var) using a signed session cookie.

## Ops
- Single Dockerfile + docker-compose.yml (app + postgres).
- .env.example listing every env var.
- README with: local dev setup, deploy steps for a generic Ubuntu VPS,
  and a section explaining the /health contract that monitored sites
  must implement (copy the JSON shape above).
- Seed script that adds one demo site pointing at https://example.com.

## Quality bar
- TypeScript strict mode, no any.
- All external calls wrapped with timeouts and try/catch; a failing
  site must never crash the worker loop.
- Uptime % computed from Check rows over a rolling 30-day window.
- Write a few unit tests for the status-mapping logic (response ->
  UP/DEGRADED/DOWN) using vitest.

Start by showing me the project structure and the Prisma schema, then
build it file by file.
```

---

## Part 2 — Integrating every deployed project

Each monitored project needs one thing: a `/health` endpoint on its backend that reports on itself and its database. The monitor never touches your database directly — the backend vouches for it. Static sites with no backend skip this entirely; Pulse still checks their frontend and SSL.

### The contract

Every `/health` endpoint must return this JSON shape with HTTP 200:

```json
{
  "status": "ok",
  "checks": {
    "db": { "status": "ok", "latency_ms": 12 },
    "cache": { "status": "ok", "latency_ms": 3 }
  },
  "latency_ms": 15,
  "version": "1.4.2"
}
```

Rules that make it trustworthy:

- `status` is `"ok"`, `"degraded"`, or `"error"` — the worst status among the checks.
- Each check actually exercises the dependency: the db check runs `SELECT 1`, the cache check runs a `PING`. Never return hardcoded `"ok"`.
- Return HTTP 200 even when a dependency is down (with `"status": "error"` in the body) — a 500 makes it ambiguous whether the backend or the dependency failed. Reserve non-200 for "the backend itself cannot respond", which happens naturally.
- Keep it fast: total under ~500ms, with a 2s timeout on each dependency check so a hung database can't hang the endpoint.
- Protect it with a bearer token so outsiders can't map your infrastructure. Put the token in an env var (`HEALTH_TOKEN`) and configure the same token in Pulse's site settings.

### Node.js / Express

```js
// health.js
const express = require("express");
const router = express.Router();

router.get("/health", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.HEALTH_TOKEN}`) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const started = Date.now();
  const checks = {};

  try {
    const t = Date.now();
    await db.query("SELECT 1"); // your pg/mysql pool
    checks.db = { status: "ok", latency_ms: Date.now() - t };
  } catch (e) {
    checks.db = { status: "error", error: e.message };
  }

  const statuses = Object.values(checks).map((c) => c.status);
  const status = statuses.includes("error")
    ? "error"
    : statuses.includes("degraded")
      ? "degraded"
      : "ok";

  res.json({
    status,
    checks,
    latency_ms: Date.now() - started,
    version: process.env.APP_VERSION || "unknown",
  });
});

module.exports = router;
```

Mount it in your app: `app.use(healthRouter);`

### Next.js (App Router)

```ts
// app/api/health/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.HEALTH_TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const checks: Record<string, any> = {};

  try {
    const t = Date.now();
    await sql`SELECT 1`;
    checks.db = { status: "ok", latency_ms: Date.now() - t };
  } catch (e: any) {
    checks.db = { status: "error", error: e.message };
  }

  const status = Object.values(checks).some((c) => c.status === "error")
    ? "error"
    : "ok";

  return NextResponse.json({
    status,
    checks,
    latency_ms: Date.now() - started,
    version: process.env.APP_VERSION ?? "unknown",
  });
}
```

### PHP / Laravel

```php
// routes/api.php
Route::get('/health', function (Request $request) {
    if ($request->bearerToken() !== env('HEALTH_TOKEN')) {
        return response()->json(['error' => 'unauthorized'], 401);
    }

    $started = microtime(true);
    $checks = [];

    try {
        $t = microtime(true);
        DB::select('SELECT 1');
        $checks['db'] = ['status' => 'ok',
            'latency_ms' => round((microtime(true) - $t) * 1000)];
    } catch (\Throwable $e) {
        $checks['db'] = ['status' => 'error', 'error' => $e->getMessage()];
    }

    $status = collect($checks)->contains(fn ($c) => $c['status'] === 'error')
        ? 'error' : 'ok';

    return response()->json([
        'status' => $status,
        'checks' => $checks,
        'latency_ms' => round((microtime(true) - $started) * 1000),
        'version' => config('app.version', 'unknown'),
    ]);
});
```

### Python / FastAPI

```python
# health.py
import os, time
from fastapi import APIRouter, Header, HTTPException

router = APIRouter()

@router.get("/health")
async def health(authorization: str = Header(default="")):
    if authorization != f"Bearer {os.environ['HEALTH_TOKEN']}":
        raise HTTPException(401, "unauthorized")

    started = time.monotonic()
    checks = {}

    try:
        t = time.monotonic()
        await db.execute("SELECT 1")  # your asyncpg/SQLAlchemy session
        checks["db"] = {"status": "ok",
                        "latency_ms": round((time.monotonic() - t) * 1000)}
    except Exception as e:
        checks["db"] = {"status": "error", "error": str(e)}

    status = "error" if any(c["status"] == "error"
                            for c in checks.values()) else "ok"

    return {"status": status, "checks": checks,
            "latency_ms": round((time.monotonic() - started) * 1000),
            "version": os.environ.get("APP_VERSION", "unknown")}
```

### Static sites (blog, landing page)

No code needed. In Pulse settings, add the site with only the frontend URL and leave `healthUrl` empty — you get frontend + SSL monitoring, which is all a static site has.

### Rollout checklist per project

1. Add the `/health` endpoint (copy the snippet for your framework).
2. Add checks for every dependency the app truly needs: database, Redis, external payment API, file storage. One block per dependency in `checks`.
3. Generate a random token (`openssl rand -hex 24`), set it as `HEALTH_TOKEN` in the project's deployment env.
4. Deploy, then verify manually:
   `curl -H "Authorization: Bearer <token>" https://yoursite.tn/health`
5. In Pulse → Settings → Add site: name, frontend URL, health URL, token, interval (60s is fine; 30s for critical sites).
6. Kill the connection to a dependency on staging (stop the DB container) and confirm Pulse flags DATABASE as down with the real error string, and the Telegram alert arrives.

### Hosting rule

Run Pulse on a VPS that shares nothing with the sites it watches — different server, ideally different provider or region. A monitor that dies with your infrastructure is decoration.
