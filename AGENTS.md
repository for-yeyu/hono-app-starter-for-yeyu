# Agent Instructions

## Command Restrictions

- Do not run `dev`, `build`, `lint`, or `lint:fix`.
- Do not run `npm`, `npx`, `yarn`, `bun`, or dependency-install commands.
- Do not run commands that download dependencies or access the package registry.
- If a dependency is needed, provide the exact `pnpm add <package>` or
  `pnpm add -D <package>` command for the user to run.
- If dependencies are not installed, provide `pnpm install` and stop verification
  that requires packages. Do not run it yourself.
- When removing a dependency, update `package.json` only. Leave dependency removal
  changes in `pnpm-lock.yaml` for the user to handle with `pnpm i`.
- Do not run `dev` after editing. Finish with static inspection and the permitted
  checks.

Permitted project checks, when dependencies are already available:

```bash
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:coverage
```

## Working Method

1. Read this file and the skill that matches the task before editing.
2. Inspect the current implementation and `git status`; preserve unrelated user
   changes.
3. Trace the request through the smallest relevant layers before changing code.
4. Keep the route entry, feature module, infrastructure, and tests in their
   established directories.
5. Verify with focused checks that do not violate the command restrictions.

## Architecture

```text
src/
  server.ts                Node.js entrypoint with graceful shutdown
  app/index.ts             Hono app assembly, middleware, routes, and health endpoints
  config/                  Startup environment parsing and Zod validators
  db/                      PostgreSQL pool, Drizzle client, schema, and migrations
  lib/http/                Request IDs, logging middleware, errors, and validation
  lib/logger/              Pino logger and Hono request context types
  module/<feature>/        Feature controller, service, validator, and tests
```

The normal request path is:

```text
src/app/index.ts
  -> src/module/<feature>/<feature>.controller.ts
  -> src/module/<feature>/<feature>.validator.ts
  -> src/module/<feature>/<feature>.service.ts
  -> src/db/index.ts and src/db/schema/*
```

- Keep `src/app/index.ts` focused on app composition. Mount feature controllers
  with `app.route('/api/<resource>', controller)`.
- Keep controllers focused on HTTP concerns: route paths, validation middleware,
  status codes, and response bodies.
- Keep business rules and database operations in feature services.
- Keep reusable HTTP behavior in `src/lib/http`, not in individual controllers.
- `src/server.ts` owns the Node.js server, port selection, logger startup message,
  and pool shutdown.
- The current database client uses the Node `pg` driver and requires a Node.js
  runtime or a compatible container.

## Code Style

- Use lower camelCase for constants, including module-level constants. Do not use
  `UPPER_SNAKE_CASE`.
- Use kebab-case file names.
- Keep local-only types inline. Export a named type only when it is shared across
  modules or is part of a deliberate public boundary.
- Import concrete files. Reuse an existing `index.ts` export only when that file
  is already the established boundary for the area.
- Do not add fallback behavior. Required configuration must fail validation rather
  than silently defaulting or masking a deployment error.
- Do not add local `try`/`catch` blocks for ordinary control flow. Let Hono's
  global error handler process unexpected errors. Catch only at a clear translation
  boundary, such as converting a known PostgreSQL unique-violation error into an
  `AppError`.
- Keep comments short and explain only non-obvious decisions.

## HTTP and Errors

- Validate request params and JSON bodies with the local `zValidator`.
- Throw `AppError` for expected client-facing failures.
- Preserve the response contract:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid request"
  }
}
```

- Let `handleError` convert unexpected failures to the safe 500 response.
- Use `c.get('logger')` for request-scoped logs and preserve the
  `x-request-id` response header.

## Testing

- Use Vitest with the Node environment.
- Put tests in a `test/` directory beside the source module.
- Name a test after its source file and append `.test.ts`, for example:
  `src/module/user/test/user.controller.test.ts`.
- Test pure functions, config validators, HTTP infrastructure, services at a
  mocked database boundary, and Hono route contracts.
- Use `app.request()` for API behavior tests. Assert status, response shape,
  validation behavior, error codes, and important headers.
- Mock transport or infrastructure boundaries, not the behavior under test.
- Do not add UI, browser, `jsdom`, or root-level test directories unless the task
  explicitly changes the project scope.

## Project Skills

Project-specific skills live in `.agents/skills`:

- `feature-chain-conventions`: coordinate a change that crosses several layers
- `app-conventions`: change Hono app assembly, entrypoints, middleware, or routes
- `module-conventions`: add a feature controller, service, validator, or module
- `config-conventions`: change environment parsing and startup validation
- `db-conventions`: change Drizzle schema, database access, or migrations
- `http-infrastructure-conventions`: change errors, validation, request IDs, or logs
- `testing-conventions`: add focused Vitest coverage for backend behavior

Read the cross-layer skill first for work that spans multiple areas, then read
the layer-specific skills for every touched boundary.

## Commit Messages

When asked for a commit message, inspect `git status` and `commitlint.config.cjs`,
then return one semantic commit command only.

Use an allowed type from `commitlint.config.cjs`:
`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
`revert`, `wip`, `workflow`, `types`, or `release`.

This repository uses `useEmoji: true` and `emojiAlign: 'left'`, so place the
matching emoji before the lowercase type, for example:

```bash
git commit -m "📗 docs: update agent guide"
```

Keep the header at or below 108 characters.
