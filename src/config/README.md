# Config Layer

Configuration is parsed at module load time from `process.env`:

- `src/config/app.ts` parses runtime and CORS settings.
- `src/config/database.ts` parses `DatabaseUrl`.
- `src/config/schema/*` contains the Zod schemas.
- `src/config/index.ts` is the explicit export boundary for config objects.

Use the existing PascalCase environment variable names exactly:
`Environment`, `ServerPort`, `ServiceName`, `CorsOrigins`, `DatabaseUrl`, and
`JwtPrivateKey` and `JwtPublicKey`.
Use lower camelCase for the resulting config properties.

Required values must fail startup validation. Do not add fallback values,
silently coerce invalid deployment configuration, or catch parse errors locally.
Add a schema test when changing a pure validation rule.
