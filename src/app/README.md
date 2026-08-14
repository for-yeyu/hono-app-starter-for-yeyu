# App Layer

`src/app/index.ts` constructs the shared `Hono<AppEnv>` instance. Keep it thin
and limited to application composition:

- register global error and not-found handlers
- register request logging and CORS middleware
- expose root and health endpoints
- mount feature controllers with `app.route()`

Feature behavior belongs in `src/module/<feature>`, not in this file. A new
resource should normally add a controller module and one route mount here.

## Entrypoints

- `src/index.ts` exports the Hono app for a Worker-style runtime.
- `src/server.ts` starts the Node server, reads the configured port, logs startup,
  and closes the HTTP server and PostgreSQL pool on `SIGINT` or `SIGTERM`.

The Hono app must remain reusable by both entrypoints. Do not start a server or
open a second database connection from `src/index.ts`.
