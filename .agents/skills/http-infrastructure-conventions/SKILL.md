---
name: http-infrastructure-conventions
description: Preserve shared Hono HTTP infrastructure for errors, validation, request IDs, CORS, request logging, and request-scoped logger context. Use when changing `src/lib/http`, `src/lib/logger`, global error behavior, or public response contracts.
---

# HTTP Infrastructure Conventions

Keep shared HTTP behavior centralized and compatible with every feature module.

## Error Contract

- Add expected public error kinds to `src/lib/http/error-code.ts`.
- Throw `AppError` with the matching code and a client-safe message.
- Let `handleError` process unexpected errors and return the safe 500 response.
- Keep `handleNotFound` and `errorResponse` consistent with the existing JSON
  shape:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid request"
  }
}
```

Include `details` only when the response has useful structured validation data.
Do not expose raw database or infrastructure errors to clients.

## Validation and Request Context

Use the local `zValidator` wrapper so Zod issues become `AppError` values with
stable `path` and `message` details. Keep request handlers reading validated
values through `c.req.valid(...)`.

Preserve the `x-request-id` behavior in `request-logger.ts`: accept a valid
incoming ID, generate one when it is absent or invalid, attach a child logger
to the Hono context, and return the ID in the response header.

Use `c.get('logger')` for request logs. Do not add local catch-all error
handlers, fallback responses, or ordinary `try`/`catch` blocks.
