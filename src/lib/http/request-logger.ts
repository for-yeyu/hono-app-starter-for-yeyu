import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '#src/lib/logger/request-context.js'
import { nanoid } from 'nanoid'
import { type Logger, logger } from '#src/lib/logger/index.js'

const requestIdHeader = 'x-request-id'
const requestIdPattern = /^[\w.:-]{1,128}$/

const getRequestId = (requestId?: string) => {
  const trimmedRequestId = requestId?.trim()

  if (trimmedRequestId && requestIdPattern.test(trimmedRequestId)) {
    return trimmedRequestId
  }

  return nanoid()
}

const getIp = (forwardedFor?: string, realIp?: string) => {
  const forwardedIp = forwardedFor?.split(',')[0]?.trim()

  return forwardedIp || realIp || undefined
}

const logRequest = (
  requestLogger: Logger,
  data: {
    method: string
    path: string
    status: number
    durationMs: number
    userAgent?: string
    ip?: string
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
  const requestId = getRequestId(c.req.header(requestIdHeader))
  const requestLogger = logger.child({ requestId })
  const startedAt = performance.now()

  c.set('requestId', requestId)
  c.set('logger', requestLogger)
  c.header(requestIdHeader, requestId)

  await next()

  if (c.error) {
    return
  }

  logRequest(requestLogger, {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Math.round(performance.now() - startedAt),
    userAgent: c.req.header('user-agent'),
    ip: getIp(c.req.header('x-forwarded-for'), c.req.header('x-real-ip')),
  })
}
