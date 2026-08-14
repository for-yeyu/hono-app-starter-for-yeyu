# Feature Modules

Put each business feature under `src/module/<feature>`:

```text
src/module/<feature>/
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.validator.ts
  test/
    <feature>.controller.test.ts
```

## Responsibilities

- `*.controller.ts`: define Hono routes, attach validators, call the service,
  choose status codes, and shape successful responses.
- `*.validator.ts`: define Zod schemas for params, JSON bodies, and other
  request input.
- `*.service.ts`: implement business rules and database operations.
- `test/*.test.ts`: exercise the public route contract with mocked service or
  infrastructure boundaries.

Mount the controller from `src/app/index.ts`. Do not put SQL or business rules
in `src/app`, and do not make controllers depend on raw database clients.

Expected failures should throw `AppError`; unexpected failures should bubble to
the global error handler. Avoid local fallback behavior and ordinary
`try`/`catch` blocks.
