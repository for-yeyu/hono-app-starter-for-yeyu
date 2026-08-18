# App Layer

`src/app/index.ts` constructs the shared `Hono<AppEnv>` instance. Keep it thin
and limited to application composition:

- register global error and not-found handlers
- register request logging and CORS middleware
- expose root and health endpoints
- mount feature controllers with `app.route()`

Feature behavior belongs in `src/module/<feature>`, not in this file. A new
resource should normally add a controller module and one route mount here.

## Entrypoint

`src/server.ts` starts the Node.js server, reads the configured port, logs
startup, and closes the HTTP server and PostgreSQL pool on `SIGINT` or `SIGTERM`.

Keep the Hono app reusable from the Node.js entrypoint. Do not open a second
database connection from the entrypoint.
