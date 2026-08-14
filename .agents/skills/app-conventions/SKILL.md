---
name: app-conventions
description: Guide changes to the Hono application assembly, global middleware, route mounting, health endpoints, and Node or Worker entrypoints. Use when changing `src/app/index.ts`, `src/index.ts`, `src/server.ts`, or application-wide middleware behavior.
---

# App Conventions

Keep the Hono app reusable by both runtime entrypoints.

## App Assembly

Implement shared application behavior in `src/app/index.ts`:

- construct `new Hono<AppEnv>()`
- register `onError` and `notFound`
- register request logging and CORS middleware
- expose root and health endpoints
- mount feature controllers with `app.route('/api/<resource>', controller)`

Keep this file focused on composition. Put feature HTTP handlers in
`src/module/<feature>/<feature>.controller.ts`; do not put database queries or
business rules in `src/app`.

## Entrypoints

- `src/index.ts` should export the shared Hono app for a Worker-style runtime.
- `src/server.ts` should start the Node server with `@hono/node-server`,
  read `appConfig.port`, log startup, and close both the server and `pool` on
  `SIGINT` and `SIGTERM`.

Do not create a second Hono app, start a server from `src/index.ts`, or add
runtime-specific behavior to shared route handlers without a clear boundary.

## Middleware

Preserve the order of application-wide middleware unless the behavior requires
an intentional change. Request logging must run before routes so it can create
the request ID, attach the request-scoped logger, and set `x-request-id`.
Application errors should flow to the global handlers.
