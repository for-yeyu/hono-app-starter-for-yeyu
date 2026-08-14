# Database Layer

`src/db/index.ts` creates the PostgreSQL `Pool` and Drizzle client from the
validated `databaseConfig`. Feature services import `db` and schema tables from
this layer; controllers must not query the database directly.

Keep schema definitions in `src/db/schema/<table>.ts` and expose established
tables through `src/db/schema/index.ts`. Use lower camelCase for TypeScript
properties and explicit snake_case names for PostgreSQL columns when needed.

## Schema Workflow

1. Update the relevant schema file.
2. Inspect the generated SQL and snapshot.
3. Apply the development or production migration with the matching script.
4. Add or update service and route tests for changed behavior.

Use `db:push` for early local iteration only. Do not hand-edit generated
migrations unless the change explicitly requires a reviewed SQL adjustment.

The current adapter is `drizzle-orm/node-postgres` with `pg`, so it is Node
runtime specific. The Worker entrypoint needs a binding-compatible adapter before
production Worker deployment.
