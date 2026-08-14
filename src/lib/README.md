# Infrastructure Layer

`src/lib` contains reusable runtime behavior that should not be reimplemented in
feature controllers or services.

## HTTP

`src/lib/http` owns:

- `request-logger.ts`: request IDs, request-scoped loggers, timing, and status-based logs
- `app-error.ts`: expected application error type
- `error-code.ts`: allowed public error codes
- `error-response.ts`: global error and not-found responses
- `z-validator.ts`: the shared Zod-to-`AppError` validation adapter

Use `AppError` for expected client-facing failures. Let the global Hono error
handler process unexpected failures and return the safe 500 contract. Add a
local `try`/`catch` only when translating a known lower-level error at a clear
boundary.

## Logger

`src/lib/logger/index.ts` configures the Pino logger from `appConfig`.
`request-context.ts` defines the Hono `AppEnv` variables. Request handlers should
use `c.get('logger')` so logs carry the request ID and shared metadata.

Keep this layer runtime-aware and small. Do not move feature-specific business
rules into infrastructure helpers.
