# Hono Backend

A minimal Hono backend with `/` and `/health` routes, validated configuration,
structured Pino logging, CORS, request IDs, and unified error responses.

## Quick Start

Install dependencies and create the development environment file:

```bash
pnpm install
cp .env.example .env.development
pnpm dev
```

## Routes

| Route | Description |
| --- | --- |
| `GET /` | Returns a greeting and the environment |
| `GET /health` | Returns the service health status |

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `Environment` | Yes | `development` or `production` |
| `ServerPort` | Yes | Integer HTTP port from `1` to `65535` |
| `ServiceName` | No | Service name included in structured logs |
| `CorsOrigins` | Yes | Comma-separated origins or `*` |

Configuration is validated during startup. Missing or malformed required
values must be fixed instead of silently defaulted. Database and JWT settings
are not required by this minimal app.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Node server with the development environment |
| `pnpm build` | Compile TypeScript to `dist` |
| `pnpm start` | Start the compiled Node server |
| `pnpm typecheck` | Validate TypeScript without emitting files |
| `pnpm test` | Run Vitest once |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm test:coverage` | Run Vitest with coverage |
| `pnpm commit` / `pnpm qwer` | Create a commit with the existing prompt |
| `pnpm reset:minimal -- --yes` | Reset application code to the minimal template |

The reset script preserves all development dependencies, non-database commands,
Vitest configuration, and repository engineering configuration. It leaves
`pnpm-lock.yaml` unchanged; run `pnpm install` to reconcile runtime dependencies.

## Extending the App

Add feature modules under `src/module/` and mount them in `src/app/index.ts`.
Add colocated `test/` directories as features are introduced; Vitest remains
available after the reset.

All existing README files are preserved, including those inside removed feature
and database directories. They remain as extension guides; their presence does
not mean those features are installed. The root README is updated for this
minimal app.

Agents must follow `AGENTS.md`: they do not run `dev`, `build`, `lint`, or
dependency installation commands.
