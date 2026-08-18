/** biome-ignore-all lint/suspicious/noConsole: <ignore script> */
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const confirmationFlag = '--yes'

if (!process.argv.includes(confirmationFlag)) {
  console.error(
    'This command removes the template database, modules, tests, and environment files.',
  )
  console.error('Re-run with: pnpm reset:minimal -- --yes')
  process.exit(1)
}

const readmePattern = /^readme(?:\.[^.]+)?$/i
const pathsToRemove = [
  '.env.development',
  '.env.production',
  'coverage',
  'dist',
  'drizzle',
  'drizzle.config.ts',
  'refer',
  'src/config/database.ts',
  'src/config/validator/database-validator.ts',
  'src/config/validator/test',
  'src/db',
  'src/lib/http/test',
  'src/lib/http/z-validator.ts',
  'src/lib/logger/test',
  'src/module',
  'vitest.config.ts',
]

const removeDirectoryContentsExceptReadmes = relativePath => {
  const directoryPath = resolve(rootDir, relativePath)

  if (!existsSync(directoryPath)) {
    return
  }

  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = join(directoryPath, entry.name)

    if (entry.isFile() && readmePattern.test(entry.name)) {
      continue
    }

    if (entry.isDirectory()) {
      removeDirectoryContentsExceptReadmes(join(relativePath, entry.name))

      if (readdirSync(entryPath).length === 0) {
        rmSync(entryPath, {
          force: true,
          recursive: true,
        })
      }

      continue
    }

    rmSync(entryPath, {
      force: true,
      recursive: true,
    })
  }
}

const removePathExceptReadmes = relativePath => {
  const targetPath = resolve(rootDir, relativePath)

  if (!existsSync(targetPath)) {
    return
  }

  if (lstatSync(targetPath).isDirectory()) {
    removeDirectoryContentsExceptReadmes(relativePath)

    if (readdirSync(targetPath).length === 0) {
      rmSync(targetPath, {
        force: true,
        recursive: true,
      })
    }

    return
  }

  if (readmePattern.test(basename(targetPath))) {
    return
  }

  rmSync(targetPath, {
    force: true,
    recursive: true,
  })
}

for (const relativePath of pathsToRemove) {
  removePathExceptReadmes(relativePath)
}

const packageJsonPath = resolve(rootDir, 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const scriptsToRemove = new Set(['qwer', 'test', 'test:watch', 'test:coverage'])
const dependenciesToRemove = new Set([
  '@hono/zod-validator',
  'drizzle-orm',
  'pg',
  '@types/pg',
  '@vitest/coverage-v8',
  'drizzle-kit',
  'vitest',
  'wrangler',
])

for (const scriptName of Object.keys(packageJson.scripts)) {
  if (scriptsToRemove.has(scriptName) || scriptName.startsWith('db:')) {
    delete packageJson.scripts[scriptName]
  }
}

for (const dependencyName of dependenciesToRemove) {
  delete packageJson.dependencies[dependencyName]
  delete packageJson.devDependencies[dependencyName]
}

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

writeFileSync(
  resolve(rootDir, 'src/app/index.ts'),
  `import type { AppEnv } from '#src/lib/logger/request-context.js'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { appConfig } from '#src/config/index.js'
import { handleError, handleNotFound } from '#src/lib/http/error-response.js'
import { requestLogger } from '#src/lib/http/request-logger.js'

export const app = new Hono<AppEnv>()

app.onError(handleError)
app.notFound(handleNotFound)
app.use('*', requestLogger)
app.use(
  '*',
  cors({
    origin: appConfig.corsOrigins,
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['content-type', 'authorization', 'x-request-id'],
    exposeHeaders: ['x-request-id'],
    maxAge: 86_400,
  }),
)

app.get('/', c => {
  return c.json({
    message: 'Hello Hono~',
    environment: appConfig.environment,
  })
})

app.get('/health', c => {
  return c.json({
    status: 'ok',
  })
})
`,
)

writeFileSync(
  resolve(rootDir, 'src/server.ts'),
  `import { serve } from '@hono/node-server'
import { app } from './app/index.js'
import { appConfig } from './config/index.js'
import { logger } from './lib/logger/index.js'

const server = serve(
  {
    fetch: app.fetch,
    port: appConfig.port,
  },
  info => {
    logger.info(
      {
        port: info.port,
        url: \`http://localhost:\${info.port}\`,
      },
      'server started',
    )
  },
)

const shutdown = async (signal: NodeJS.Signals) => {
  logger.info({ signal }, 'server shutting down')

  await new Promise<void>((resolvePromise, rejectPromise) => {
    server.close(error => {
      if (error) {
        rejectPromise(error)
        return
      }

      resolvePromise()
    })
  })

  logger.info('server stopped')
}

process.once('SIGINT', () => {
  void shutdown('SIGINT')
})

process.once('SIGTERM', () => {
  void shutdown('SIGTERM')
})
`,
)

writeFileSync(resolve(rootDir, 'src/config/index.ts'), "export { appConfig } from './app.js'\n")

writeFileSync(
  resolve(rootDir, '.env.example'),
  `Environment=development
ServerPort=3000
ServiceName=hono-api
CorsOrigins=http://localhost:3000
`,
)

const gitignorePath = resolve(rootDir, '.gitignore')
const gitignore = readFileSync(gitignorePath, 'utf8')
const environmentIgnoreLines = ['.env', '.env.*', '!.env.example']
const missingEnvironmentIgnoreLines = environmentIgnoreLines.filter(
  line => !gitignore.split('\n').includes(line),
)

if (missingEnvironmentIgnoreLines.length > 0) {
  writeFileSync(
    gitignorePath,
    `${gitignore.trimEnd()}\n\n# environment files\n${missingEnvironmentIgnoreLines.join('\n')}\n`,
  )
}

const minimalReadme = [
  '# Hono Backend',
  '',
  'A minimal Hono backend with `/` and `/health` routes.',
  '',
  '## Quick Start',
  '',
  'Install dependencies:',
  '',
  '```bash',
  'pnpm install',
  '```',
  '',
  'Create the development environment file from `.env.example`, then run:',
  '',
  '```bash',
  'pnpm typecheck',
  'pnpm dev',
  '```',
  '',
  '## Routes',
  '',
  '| Route | Description |',
  '| --- | --- |',
  '| `GET /` | Returns the service name and environment |',
  '| `GET /health` | Returns the service health status |',
  '',
  '## Environment',
  '',
  '| Variable | Required | Description |',
  '| --- | --- | --- |',
  '| `Environment` | Yes | `development` or `production` |',
  '| `ServerPort` | Node only | Integer HTTP port from `1` to `65535` |',
  '| `ServiceName` | No | Service name included in structured logs |',
  '| `CorsOrigins` | Yes | Comma-separated origins or `*` |',
  '',
  'Configuration is validated during startup. Missing or malformed required',
  'values must be fixed instead of silently defaulted.',
  '',
  '## Commands',
  '',
  '| Command | Purpose |',
  '| --- | --- |',
  '| `pnpm typecheck` | Validate TypeScript without emitting files |',
  '| `pnpm dev` | Start the Node server with the development environment |',
  '| `pnpm build` | Compile TypeScript to `dist` |',
  '| `pnpm start` | Start the compiled Node server |',
  '',
  'The reset script keeps this README and the shared application infrastructure.',
  'Add feature modules, database access, and tests only when the project needs them.',
  '',
].join('\n')

writeFileSync(resolve(rootDir, 'README.md'), minimalReadme)

console.log('Minimal Hono project reset complete.')
console.log('Run pnpm install to reconcile package.json with pnpm-lock.yaml.')
