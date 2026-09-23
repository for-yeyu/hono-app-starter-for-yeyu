import type { AppEnv } from '#src/lib/http/request-context.js'
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
