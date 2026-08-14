---
name: testing-conventions
description: Add focused Vitest coverage for Hono backend behavior, pure functions, configuration validators, services, and HTTP infrastructure. Use when adding or changing tests, route contracts, validation behavior, error responses, or mocked database boundaries.
---

# Testing Conventions

Use Vitest with the configured Node environment and public behavior assertions.

## Test Placement

Place every source test in a nested `test/` directory beside the source module.
Keep the filename aligned with the source file and append `.test.ts`:

```text
src/module/user/user.controller.ts
src/module/user/test/user.controller.test.ts
```

Do not create a root-level test directory. Do not add UI, browser, `jsdom`, or
component tests unless the task explicitly expands the project scope.

## API Tests

Use `app.request()` to exercise Hono contracts. Assert:

- status code and important headers such as `x-request-id`
- successful `data` response bodies
- validation status, error code, message, and details
- expected `AppError` mappings
- safe responses for unexpected failures

Mock the feature service or external infrastructure boundary so route tests
focus on the HTTP contract. Do not mock the behavior being asserted.

## Pure and Service Tests

Test pure validators and helpers with direct inputs and outputs. For services,
mock the database transport boundary and assert meaningful query behavior or
public results, not incidental local implementation details.

Set environment variables before importing modules that parse configuration,
using the existing `vi.hoisted` pattern when module initialization requires it.

Run `pnpm test` for a one-time run or `pnpm test:coverage` for coverage only
when dependencies are already installed. Never install dependencies yourself.
