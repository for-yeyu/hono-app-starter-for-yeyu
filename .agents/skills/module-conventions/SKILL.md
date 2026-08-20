---
name: module-conventions
description: Organize Hono feature modules with controllers, Zod schemas, services, and colocated tests. Use when adding or changing a business feature directory under `src/module`, including its routes, request input, business rules, or persistence calls.
---

# Module Conventions

Put each business feature under `src/module/<feature>`:

```text
src/module/<feature>/
  <feature>.controller.ts
  <feature>.middleware.ts
  <feature>.service.ts
  <feature>.schema.ts
  test/
    <feature>.controller.test.ts
```

## Responsibilities

- Controller: define Hono routes, attach validation middleware, call the service,
  choose status codes, and shape successful responses.
- Middleware: define reusable route guards or context setup middleware in
  `*.middleware.ts`. Prefer `createMiddleware()` when the middleware lives in
  its own file or sets typed `c.set(...)` values, such as auth user data.
- Schema: define Zod schemas for params, JSON bodies, and other request input.
- Service: implement business rules and database operations.
- Test: exercise the public route contract through `app.request()`.

Mount the controller from `src/app/index.ts`. Keep controllers independent from
raw database clients; import `db` and schema tables only in services.

## Input and Errors

Use the local `zValidator` for request params and JSON bodies, then read
validated values with `c.req.valid(...)`. Throw `AppError` for expected
client-facing failures. Let unexpected errors bubble to the global Hono error
handler.

Do not add fallback behavior or ordinary local `try`/`catch` blocks. Catch only
when translating a known lower-level error at a clear boundary, such as mapping
a PostgreSQL unique violation to `errorCode.conflict`.

Keep local input types inline unless a type is shared across modules or is part
of an intentional public API.
