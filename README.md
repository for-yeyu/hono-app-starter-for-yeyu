# Hono Backend Starter

A small Hono backend template with PostgreSQL, Drizzle ORM, Zod validation,
structured Pino logging, unified error responses, Vitest, and a Worker-style
entrypoint.

## Quick Start

Install dependencies from the repository root:

```bash
pnpm install
```

Configure `.env.development` before running database commands. The application
validates configuration during startup, so missing or malformed required values
must be fixed instead of silently defaulted.

Generate and apply a development migration after setting `DatabaseUrl`:

```bash
pnpm db:generate:dev
pnpm db:migrate:dev
```

Run the permitted static and test checks:

```bash
pnpm typecheck
pnpm test
```

## Environment

Environment variable names intentionally match the existing runtime contract:

| Variable | Required | Description |
| --- | --- | --- |
| `Environment` | Yes | `development` or `production` |
| `ServerPort` | Node only | Integer HTTP port from `1` to `65535` |
| `ServiceName` | No | Service name included in structured logs |
| `CorsOrigins` | Yes | Comma-separated origins or `*` |
| `DatabaseUrl` | Yes | PostgreSQL connection URL |

Keep production secrets outside version control and review the existing
`.env.*` files before reusing this template.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm typecheck` | Validate TypeScript without emitting files |
| `pnpm test` | Run Vitest once |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:coverage` | Run Vitest with coverage |
| `pnpm db:generate:dev` | Generate a development migration |
| `pnpm db:migrate:dev` | Apply development migrations |
| `pnpm db:push:dev` | Push the development schema |
| `pnpm db:generate:prod` | Generate a production migration |
| `pnpm db:migrate:prod` | Apply production migrations |
| `pnpm db:push:prod` | Push the production schema |
| `pnpm start` | Start the compiled Node server |
| `pnpm preview` | Deploy with Wrangler using production secrets |

Agents must follow `AGENTS.md`: they do not run `dev`, `build`, `lint`, or
dependency installation commands.

## Architecture

```text
src/
  index.ts                 Worker-style entrypoint exporting the Hono app
  server.ts                Node entrypoint with graceful pool shutdown
  app/index.ts             Hono app assembly and global middleware
  config/                  Environment parsing and Zod validators
  db/                      PostgreSQL pool, Drizzle client, and schema
  lib/http/                Request IDs, errors, request logging, and validation
  lib/logger/              Pino logger and request context types
  module/<feature>/        Controller, service, validator, and tests
drizzle/                   Generated SQL migrations and snapshots
```

Keep the application flow directional:

```text
app -> module controller -> module validator/service -> db
```

Controllers own HTTP concerns. Services own business rules and database
operations. Configuration and infrastructure remain reusable across modules.

## HTTP Contract

Successful resource responses use a `data` property:

```json
{
  "data": {}
}
```

Expected failures use the unified error shape:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid request"
  }
}
```

Validation details may be included as `error.details`. Request IDs are returned
in the `x-request-id` header and are available to request-scoped logging.

## Adding a Feature

Create a directory under `src/module/<feature>`:

```text
src/module/<feature>/
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.validator.ts
  test/
    <feature>.controller.test.ts
```

Mount the controller from `src/app/index.ts`, validate input with the local
`zValidator`, keep persistence in the service, and test the public Hono
contract with `app.request()`.

## Runtime and Database

`src/server.ts` runs Hono on Node with `@hono/node-server` and `pg`. `src/index.ts`
and `wrangler.jsonc` expose a Worker-style entrypoint, but the current
PostgreSQL client is Node-specific. Replace the database adapter and verify
logger/runtime behavior before deploying to Workers.

Update Drizzle schema files first, then generate and apply a migration. Use
`db:push` only for early development when a migration file is not yet needed.

## Agent Documentation

- `AGENTS.md`: repository-wide agent commands, boundaries, style, testing, and commits
- `README-zh.md`: temporary Chinese review copy of this project guide
- `.agents/skills/*/SKILL.md`: task-specific instructions loaded on demand
- `src/app/README.md`: Hono app assembly and entrypoints
- `src/config/README.md`: environment validation and config boundaries
- `src/db/README.md`: Drizzle schema and migration workflow
- `src/lib/README.md`: HTTP and logger infrastructure
- `src/module/README.md`: feature module layout and request flow

The copied reference file `README copy.md` is not part of the current project
architecture; use this README and `AGENTS.md` as the source of truth.
