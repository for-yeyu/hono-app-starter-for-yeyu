# Hono Backend Starter

A small Hono backend template with PostgreSQL, Drizzle ORM, Zod validation,
structured Pino logging, unified error responses, Vitest, and a Node.js
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

## Reset to Minimal

When starting a new project that does not need the database or the example user
feature, reset the template to a minimal Hono app with only `/` and `/health`:

```bash
pnpm reset:minimal -- --yes
```

The script keeps every README file, shared HTTP and logger infrastructure, app
configuration, the Node.js entrypoint, and repository engineering configuration.
It removes:

- database and feature source code under `src/db/` and `src/module/`
- `drizzle/` and `drizzle.config.ts`
- database config and schema files
- `src/**/test/`, `vitest.config.ts`, coverage artifacts, and `dist/`
- `src/lib/http/z-validator.ts`
- `refer/`
- `.env.development` and `.env.production`
- database, example feature, and test scripts/dependencies from `package.json`

It keeps:

- every `README.md` file, including layer documentation under `src/`
- `src/app/`, `src/config/app.ts`, and `src/server.ts`
- shared HTTP error handling, request logging, CORS, and Pino logging
- Biome, Lefthook, Commitlint, and the root engineering configuration

The script removes `.env.development` and `.env.production`, then creates
`.env.example` with only the environment variables required by the minimal app.
Back up any local environment values before running it. It changes
`package.json` but intentionally leaves `pnpm-lock.yaml` for you to reconcile
with `pnpm install`.

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
| `pnpm start` | Start the compiled Node.js server |

Agents must follow `AGENTS.md`: they do not run `dev`, `build`, `lint`, or
dependency installation commands.

## Architecture

```text
src/
  server.ts                Node.js entrypoint with graceful pool shutdown
  app/index.ts             Hono app assembly and global middleware
  config/                  Environment parsing and Zod schemas
  db/                      PostgreSQL pool, Drizzle client, and schema
  lib/http/                Request IDs, errors, request logging, and validation
  lib/logger/              Pino logger and request context types
  module/<feature>/        Controller, service, schema, and tests
drizzle/                   Generated SQL migrations and snapshots
```

Keep the application flow directional:

```text
app -> module controller -> module schema/service -> db
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
  <feature>.schema.ts
  test/
    <feature>.controller.test.ts
```

Mount the controller from `src/app/index.ts`, validate input with the local
`zValidator`, keep persistence in the service, and test the public Hono
contract with `app.request()`.

## Runtime and Database

`src/server.ts` runs Hono on Node.js with `@hono/node-server` and `pg`. Production
deployment must use a Node.js host or container that runs the compiled server.
Set the required environment variables in the hosting platform, run
`pnpm build`, and use `pnpm start` as the start command.

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
