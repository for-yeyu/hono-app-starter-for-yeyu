# Hono Backend Starter

Hono backend template with PostgreSQL, Drizzle ORM, structured logging, unified
error handling, request validation, Vitest, and optional Cloudflare Worker
configuration.

## Quick Start

Install dependencies:

```bash
pnpm install
```

Use `.env.development` for local development and `.env.production` for
production. Update the values for the project before running database commands.

Update `DatabaseUrl`, then generate and apply the development migration:

```bash
pnpm db:generate:dev
pnpm db:migrate:dev
```

Available local verification commands:

```bash
pnpm typecheck
pnpm test
```

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `Environment` | Yes | `development` or `production` |
| `ServerPort` | Node only | HTTP port, from `1` to `65535` |
| `ServiceName` | No | Service name included in structured logs |
| `CorsOrigins` | Yes | Comma-separated origins or `*` |
| `DatabaseUrl` | Yes | PostgreSQL connection URL |

Environment values are validated when the application starts. Keep real
production secrets outside version control. Review the existing `.env.*` files
before reusing this repository, especially `.env.production`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm typecheck` | TypeScript validation |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:generate:dev` | Generate a development migration |
| `pnpm db:migrate:dev` | Apply development migrations |
| `pnpm db:push:dev` | Push the schema during early development |
| `pnpm db:generate:prod` | Generate a production migration |
| `pnpm db:migrate:prod` | Apply production migrations |
| `pnpm start` | Start the compiled Node server |

## Structure

```text
src/
  app/                 Hono application and middleware registration
  config/              Environment parsing and validation
  db/                  Drizzle client and schema
  lib/http/            Errors, validation, and request logging
  lib/logger/          Pino logger and request context
  module/<feature>/    Feature controller, service, validator, and tests
```

Add new business features under `src/module/<feature>`. Keep controllers
focused on HTTP concerns and keep database operations in services.

## Reuse Checklist

1. Rename the `package.json` and `wrangler.jsonc` project names.
2. Set `ServiceName` for structured logs.
3. Review or remove the sample user module, schema, and migration.
4. Move production environment values to the deployment secret manager.
5. Choose a Node or Worker runtime before adding runtime-specific libraries.

## Runtime Note

`src/server.ts` is the Node entrypoint and the default database client uses
`pg`, a Node PostgreSQL driver. `src/index.ts` and `wrangler.jsonc` provide a
Worker-style entrypoint, but the current database layer is not a complete
Cloudflare Worker adapter. Before deploying to Workers, replace the database
client with a binding-compatible implementation, such as a Hyperdrive-based
adapter, and verify the logger/runtime behavior for that deployment.
