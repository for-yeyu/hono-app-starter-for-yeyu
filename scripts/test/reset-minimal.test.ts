import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('../../', import.meta.url))
const temporaryDirectories: string[] = []
const engineeringFiles = [
  '.gitignore',
  '.editorconfig',
  '.npmrc',
  'AGENTS.md',
  'biome.json',
  'commitlint.config.cjs',
  'knip.json',
  'lefthook.yml',
  'lint-staged.config.js',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'vitest.config.ts',
]

const createTemporaryDirectory = () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'hono-reset-minimal-'))
  temporaryDirectories.push(directory)
  return directory
}

const createProject = () => {
  const directory = createTemporaryDirectory()

  for (const path of ['scripts', 'src', 'package.json', 'README.md', ...engineeringFiles]) {
    cpSync(resolve(rootDir, path), resolve(directory, path), { recursive: true })
  }

  return directory
}

const writeProjectFile = (directory: string, path: string, contents: string) => {
  const filePath = resolve(directory, path)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, contents)
}

const readProjectFiles = (directory: string, relativeDirectory = ''): Record<string, string> =>
  Object.fromEntries(
    readdirSync(resolve(directory, relativeDirectory), { withFileTypes: true }).flatMap(entry => {
      const path = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name

      return entry.isDirectory()
        ? Object.entries(readProjectFiles(directory, path))
        : [[path, readFileSync(resolve(directory, path), 'utf8')]]
    }),
  )

const runReset = (directory: string) =>
  spawnSync(process.execPath, [resolve(directory, 'scripts/reset-minimal.mjs')], {
    cwd: tmpdir(),
    encoding: 'utf8',
    timeout: 10_000,
  })

const resetProject = (directory: string) => {
  const result = runReset(directory)
  expect({ status: result.status, stderr: result.stderr }).toEqual({ status: 0, stderr: '' })
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('reset-minimal', () => {
  it('runs cleanup without additional arguments', () => {
    const directory = createProject()
    writeProjectFile(directory, 'src/extra.ts', 'export const example = true\n')

    resetProject(directory)

    const packageJson = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
    expect(packageJson.scripts.cleanup).toBe('node scripts/reset-minimal.mjs')
    expect(existsSync(resolve(directory, 'src/extra.ts'))).toBe(false)
  })

  it('preserves development dependencies, commands, engineering files, and shared infrastructure', () => {
    const directory = createProject()
    const packageJson = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
    packageJson.devDependencies['custom-dev-tool'] = '1.2.3'
    packageJson.dependencies['example-runtime'] = '4.5.6'
    packageJson.scripts['custom-check'] = 'custom-dev-tool'
    packageJson.scripts['db:custom'] = 'example-runtime'
    writeProjectFile(directory, 'package.json', JSON.stringify(packageJson))
    const before = readProjectFiles(directory)

    resetProject(directory)

    const result = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
    expect(result.devDependencies).toEqual(packageJson.devDependencies)
    expect(result.scripts).toEqual(
      Object.fromEntries(
        Object.entries(packageJson.scripts).filter(([name]) => !name.startsWith('db:')),
      ),
    )
    expect(result.scripts.qwer).toBe('czg')
    expect(result.dependencies).toEqual({
      '@hono/node-server': packageJson.dependencies['@hono/node-server'],
      hono: packageJson.dependencies.hono,
      pino: packageJson.dependencies.pino,
      zod: packageJson.dependencies.zod,
    })

    for (const path of engineeringFiles) {
      expect(readFileSync(resolve(directory, path), 'utf8')).toBe(before[path])
    }

    for (const [path, contents] of Object.entries(readProjectFiles(directory, 'src/lib'))) {
      expect(contents, path).toBe(before[path])
    }
  })

  it('cleans nested source files, artifacts, and environment variants while keeping every README', () => {
    const directory = createProject()
    const removedPaths = [
      'src/app/test/extra.test.ts',
      'src/config/schema/nested/test/extra.test.ts',
      'src/config/extra.ts',
      'src/lib/extra/helper.ts',
      'src/extra/example.ts',
      'src/module/extra/test/extra.test.ts',
      'src/db/schema/extra.ts',
      'drizzle/nested/migration.sql',
      'drizzle.config.ts',
      'refer/nested/example.ts',
      'coverage/nested/report.json',
      'dist/nested/server.js',
      'tsconfig.tsbuildinfo',
      'custom.tsbuildinfo',
      '.env',
      '.env.development',
      '.env.production',
      '.env.test',
      '.env.local',
      '.env.production.local',
    ]
    const readmePaths = [
      'src/module/extra/README.md',
      'src/db/schema/README-zh.md',
      'src/app/test/README copy.md',
      'src/lib/extra/readme.txt',
      'src/extra/ReadMe',
      'drizzle/nested/README.rst',
      'refer/nested/README_zh.md',
      'coverage/README.md',
      'dist/README.md',
    ]

    for (const path of [...removedPaths, ...readmePaths]) {
      writeProjectFile(directory, path, path)
    }

    const outsideDirectory = createTemporaryDirectory()
    writeProjectFile(outsideDirectory, 'keep.txt', 'outside project')
    symlinkSync(outsideDirectory, resolve(directory, 'src/external'), 'dir')
    symlinkSync(resolve(outsideDirectory, 'missing'), resolve(directory, '.env.broken'))

    resetProject(directory)

    for (const path of removedPaths) {
      expect(existsSync(resolve(directory, path)), path).toBe(false)
    }

    for (const path of readmePaths) {
      expect(readFileSync(resolve(directory, path), 'utf8')).toBe(path)
    }

    expect(readFileSync(resolve(outsideDirectory, 'keep.txt'), 'utf8')).toBe('outside project')
    expect(readdirSync(resolve(directory, 'src'))).not.toContain('external')
    expect(readdirSync(directory)).not.toContain('.env.broken')
    expect(
      Object.keys(readProjectFiles(directory, 'src'))
        .filter(path => path.endsWith('.ts'))
        .sort(),
    ).toEqual([
      'src/app/index.ts',
      'src/config/app.ts',
      'src/config/index.ts',
      'src/config/schema/app.schema.ts',
      'src/index.ts',
      'src/lib/http/app-error.ts',
      'src/lib/http/error-code.ts',
      'src/lib/http/error-response.ts',
      'src/lib/http/request-context.ts',
      'src/lib/http/request-logger.ts',
      'src/lib/logger/index.ts',
      'src/server.ts',
    ])
    expect(existsSync(resolve(directory, 'src/config/schema/nested'))).toBe(false)
    expect(existsSync(resolve(directory, 'src/module/extra/test'))).toBe(false)
    expect(readFileSync(resolve(directory, '.env.example'), 'utf8')).toBe(
      'Environment=development\nServerPort=3000\nServiceName=hono-api\nCorsOrigins=http://localhost:3000\n',
    )
  })

  it('fails before cleanup if a required shared file is missing', () => {
    const directory = createProject()
    rmSync(resolve(directory, 'src/lib/http/request-context.ts'))
    const before = readProjectFiles(directory)

    expect(runReset(directory).status).not.toBe(0)
    expect(readProjectFiles(directory)).toEqual(before)
  })

  it('can run repeatedly without changing the result or duplicating ignore rules', () => {
    const directory = createProject()
    writeProjectFile(directory, '.gitignore', 'node_modules/\n')

    resetProject(directory)
    const before = readProjectFiles(directory)
    resetProject(directory)

    expect(readProjectFiles(directory)).toEqual(before)
    expect(before['.gitignore']).toBe(
      'node_modules/\n\n# environment files\n.env\n.env.*\n!.env.example\n',
    )
  })

  it('serves the minimal app without database or JWT configuration', () => {
    const directory = createProject()
    resetProject(directory)
    symlinkSync(resolve(rootDir, 'node_modules'), resolve(directory, 'node_modules'), 'dir')
    const environment = { ...process.env }
    delete environment.DatabaseUrl
    delete environment.JwtPrivateKey
    delete environment.JwtPublicKey

    const result = spawnSync(
      process.execPath,
      [
        '--conditions=development',
        '--import',
        'tsx',
        '--input-type=module',
        '--eval',
        `import assert from 'node:assert/strict'
import app from './src/index.ts'
import { appConfigSchema } from './src/config/schema/app.schema.ts'

const root = await app.request('/')
assert.equal(root.status, 200)
assert.deepEqual(await root.json(), { message: 'Hello Hono~', environment: 'production' })

const health = await app.request('/health', {
  headers: { origin: 'https://example.com', 'x-request-id': 'reset-smoke-test' },
})
assert.equal(health.status, 200)
assert.deepEqual(await health.json(), { status: 'ok' })
assert.equal(health.headers.get('x-request-id'), 'reset-smoke-test')
assert.equal(health.headers.get('access-control-allow-origin'), 'https://example.com')

for (const path of ['/api/users', '/api/auth/login', '/missing']) {
  const missing = await app.request(path)
  assert.equal(missing.status, 404)
  assert.deepEqual(await missing.json(), {
    success: false, error: { code: 'not_found', message: 'Not found' },
  })
}

assert.equal(appConfigSchema.safeParse({}).success, false)
assert.equal(appConfigSchema.safeParse({
  environment: 'production', port: 0, corsOrigins: 'invalid',
}).success, false)
assert.deepEqual(appConfigSchema.parse({
  environment: 'development', port: '3000', corsOrigins: '*',
}), { environment: 'development', port: 3000, corsOrigins: '*' })
`,
      ],
      {
        cwd: directory,
        encoding: 'utf8',
        timeout: 10_000,
        env: {
          ...environment,
          Environment: 'production',
          ServerPort: '3000',
          ServiceName: 'reset-smoke-test',
          CorsOrigins: 'https://example.com',
        },
      },
    )

    expect({ status: result.status, stderr: result.stderr }).toEqual({ status: 0, stderr: '' })
  })
})
