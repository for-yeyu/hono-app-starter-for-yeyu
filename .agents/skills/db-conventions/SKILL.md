---
name: db-conventions
description: Guide PostgreSQL and Drizzle ORM changes, including schema files, the shared client, service queries, and generated migrations. Use when changing `src/db`, a feature's persistence behavior, `drizzle/*`, or database environment configuration.
---

# Database Conventions

Keep database ownership below the feature service boundary.

## Client and Schema

- `src/db/index.ts` owns the PostgreSQL `Pool` and Drizzle client.
- `src/db/schema/<table>.ts` owns table definitions.
- `src/db/schema/index.ts` exposes established schema tables.
- `src/config/database.ts` owns validated `DatabaseUrl`.
- Feature services import `db` and schema tables; controllers never query `db`.

Use lower camelCase for TypeScript properties and explicit snake_case names for
PostgreSQL columns when needed. Preserve primary keys, timestamps, uniqueness,
and nullability intentionally.

## Migration Workflow

1. Update the schema file.
2. Generate the matching migration with the appropriate `pnpm db:generate:*`
   script after dependencies are installed.
3. Inspect the generated SQL and snapshot.
4. Apply it with the matching `pnpm db:migrate:*` script.
5. Update service and route tests for changed behavior.

Use `db:push` only for early development when a reviewed migration is not yet
needed. Do not hand-edit generated migration artifacts without a clear SQL
requirement.

The current adapter is `drizzle-orm/node-postgres` with `pg`, so the database
layer is Node-specific. Replace it with a binding-compatible adapter before
production Worker deployment.
