import type { AppEnv } from '#/lib/logger/request-context.js'
import { Hono } from 'hono'
import { appConfig } from '#/config/index.js'
import { handleError, handleNotFound } from '#/lib/http/error-response.js'
import { requestLogger } from '#/lib/http/request-logger.js'
import { userController } from '#/module/user/user.controller.js'

export const app = new Hono<AppEnv>()

app.onError(handleError)
app.notFound(handleNotFound)
app.use('*', requestLogger)

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

app.route('/api/users', userController)
