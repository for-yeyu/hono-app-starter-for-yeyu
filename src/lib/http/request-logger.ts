import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '#src/lib/http/request-context.js'
import { requestId } from 'hono/request-id'
import { type Logger, logger } from '#src/lib/logger/index.js'

const requestIdMiddleware = requestId({ limitLength: 128 })

const logRequest = (
  requestLogger: Logger,
  data: {
    method: string
    path: string
    status: number
    durationMs: number
    userAgent?: string
  },
) => {
  if (data.status >= 500) {
    requestLogger.error(data, 'request completed')
    return
  }

  if (data.status >= 400) {
    requestLogger.warn(data, 'request completed')
    return
  }

  requestLogger.info(data, 'request completed')
}

export const requestLogger: MiddlewareHandler<AppEnv> = async (c, next) => {
  await requestIdMiddleware(c, async () => {
    const requestId = c.get('requestId')
    const requestLoggerInstance = logger.child({ requestId })
    const startedAt = performance.now()

    c.set('logger', requestLoggerInstance)

    await next()

    logRequest(requestLoggerInstance, {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - startedAt),
      userAgent: c.req.header('user-agent'),
    })
  })
}
