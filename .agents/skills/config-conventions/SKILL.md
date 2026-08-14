---
name: config-conventions
description: Maintain startup environment parsing and Zod validation for this Hono service. Use when adding or changing environment variables, `src/config/*`, config validators, runtime settings, CORS origins, or database connection configuration.
---

# Config Conventions

Parse configuration at module load time and fail startup on invalid required
values.

## Files and Boundaries

- `src/config/app.ts`: parse `Environment`, `ServerPort`, `ServiceName`, and
  `CorsOrigins`.
- `src/config/database.ts`: parse `DatabaseUrl`.
- `src/config/validator/*`: define the Zod schemas.
- `src/config/index.ts`: export the established config objects.

Keep process environment access in config modules. Other modules should import
validated `appConfig` or `databaseConfig` instead of reading `process.env`.

## Naming and Validation

Use the existing PascalCase environment names exactly:
`Environment`, `ServerPort`, `ServiceName`, `CorsOrigins`, and `DatabaseUrl`.
Use lower camelCase for the resulting config properties and constants.

Required values must fail validation. Do not add fallback values, silently hide
parse errors, or catch configuration errors locally. Use explicit Zod coercion
only where the runtime contract requires it, such as the numeric Node port.

When changing a pure validation rule, add focused Vitest coverage in a nested
`test/` directory beside the validator.
