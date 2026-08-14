---
name: feature-chain-conventions
description: Coordinate Hono backend changes that cross app assembly, feature modules, configuration, database, HTTP infrastructure, and tests. Use when a request adds or changes a complete API feature, changes a shared contract across layers, or requires tracing behavior from an HTTP route to PostgreSQL.
---

# Feature Chain Conventions

Use this skill to keep cross-layer changes directional and complete.

## Workflow

1. Read `AGENTS.md` and the layer-specific skills for every directory the change
   will touch.
2. Trace the current request path:
   `src/app/index.ts -> module controller -> validator/service -> db`.
3. Define the public HTTP contract before editing: route, method, input,
   success status/body, expected error codes, and affected headers.
4. Change the smallest layer that owns each responsibility:
   - `src/app`: app assembly and route mounting
   - `src/module/<feature>`: HTTP handlers, validation, business rules
   - `src/config`: startup environment parsing
   - `src/db`: schema and database client boundaries
   - `src/lib`: shared HTTP, logging, and error infrastructure
   - nested `test/`: public behavior and contract tests
5. Keep expected failures as `AppError` and let unexpected failures reach the
   global Hono error handler.
6. Add focused Vitest coverage at the changed public boundary.
7. Run only permitted checks when dependencies already exist: `pnpm typecheck`
   and `pnpm test`. Never run dependency installation, `dev`, `build`, or lint.

## Dependency Direction

Keep this direction:

```text
app -> module -> lib/config/db
module service -> db
module controller -> module validator + service + lib/http
```

Do not make `src/app` contain business logic, make controllers query `db`
directly, or make infrastructure depend on a feature module.

## Completion Checklist

- Update the route mount when a new controller is added.
- Update the schema and migration when persistence changes.
- Preserve the unified success and error response shapes.
- Add tests for success, validation, expected failures, and changed headers.
- Inspect `git diff` and leave unrelated user changes untouched.
