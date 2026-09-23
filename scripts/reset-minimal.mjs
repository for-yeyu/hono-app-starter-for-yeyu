/** biome-ignore-all lint/suspicious/noConsole: <ignore script> */
import {
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const templateDir = resolve(rootDir, 'scripts/templates/minimal')

const sharedSourceFiles = [
  'src/lib/http/app-error.ts',
  'src/lib/http/error-code.ts',
  'src/lib/http/error-response.ts',
  'src/lib/http/request-context.ts',
  'src/lib/http/request-logger.ts',
  'src/lib/logger/index.ts',
]
const runtimeDependencies = new Set(['@hono/node-server', 'hono', 'pino', 'zod'])
const readmePattern = /^readme(?:$|[. _-])/i

const readTemplateFiles = (relativeDirectory = '') =>
  readdirSync(resolve(templateDir, relativeDirectory), { withFileTypes: true }).flatMap(entry => {
    const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name

    return entry.isDirectory()
      ? readTemplateFiles(relativePath)
      : [[relativePath, readFileSync(resolve(templateDir, relativePath))]]
  })

const removeExceptReadmes = relativePath => {
  const targetPath = resolve(rootDir, relativePath)
  const stat = lstatSync(targetPath, { throwIfNoEntry: false })

  if (!stat) {
    return
  }

  if (stat.isDirectory()) {
    for (const name of readdirSync(targetPath)) {
      removeExceptReadmes(`${relativePath}/${name}`)
    }

    if (readdirSync(targetPath).length > 0) {
      return
    }

    rmdirSync(targetPath)
    return
  }

  if (!stat.isFile() || !readmePattern.test(basename(targetPath))) {
    unlinkSync(targetPath)
  }
}

// Read every required input before removing any project files.
const minimalFiles = [
  ...sharedSourceFiles.map(path => [path, readFileSync(resolve(rootDir, path))]),
  ...readTemplateFiles(),
]
const packageJsonPath = resolve(rootDir, 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const gitignorePath = resolve(rootDir, '.gitignore')
const gitignore = readFileSync(gitignorePath, 'utf8')
const environmentIgnoreLines = ['.env', '.env.*', '!.env.example']
const missingIgnoreLines = environmentIgnoreLines.filter(
  line => !gitignore.split(/\r?\n/).includes(line),
)

packageJson.scripts = Object.fromEntries(
  Object.entries(packageJson.scripts).filter(([name]) => !name.startsWith('db:')),
)
packageJson.dependencies = Object.fromEntries(
  Object.entries(packageJson.dependencies).filter(([name]) => runtimeDependencies.has(name)),
)

const pathsToRemove = [
  'src',
  'drizzle',
  'drizzle.config.ts',
  'refer',
  'coverage',
  'dist',
  ...readdirSync(rootDir).filter(
    name =>
      (!['.env.example', '.env.development', '.env.production'].includes(name) &&
        (name === '.env' || name.startsWith('.env.'))) ||
      name.endsWith('.tsbuildinfo'),
  ),
]

for (const path of pathsToRemove) {
  removeExceptReadmes(path)
}

for (const [path, contents] of minimalFiles) {
  const targetPath = resolve(rootDir, path)
  mkdirSync(dirname(targetPath), { recursive: true })
  writeFileSync(targetPath, contents)
}

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

if (missingIgnoreLines.length > 0) {
  writeFileSync(
    gitignorePath,
    `${gitignore.trimEnd()}\n\n# environment files\n${missingIgnoreLines.join('\n')}\n`,
  )
}

console.log('Minimal Hono project reset complete. READMEs and development tools are preserved.')
console.log('Run pnpm install to reconcile package.json with pnpm-lock.yaml.')
