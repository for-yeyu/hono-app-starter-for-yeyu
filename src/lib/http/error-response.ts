import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { AppEnv } from '#src/lib/logger/request-context.js'
import { AppError, type ErrorDetail } from './app-error.js'
import { type ErrorCode, errorCode } from './error-code.js'
import { logger } from '#src/lib/logger/index.js'

type ErrorResponseBody = {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: ErrorDetail[]
  }
}

const createErrorResponseBody = (
  code: ErrorCode,
  message: string,
  details?: ErrorDetail[],
): ErrorResponseBody => ({
  success: false,
  error: {
    code,
    message,
    ...(details ? { details } : {}),
  },
})

export const errorResponse = (
  c: Context<AppEnv>,
  error: {
    code: ErrorCode
    message: string
    status: ContentfulStatusCode
    details?: ErrorDetail[]
  },
) => c.json(createErrorResponseBody(error.code, error.message, error.details), error.status)

const getRequestLogger = (c: Context<AppEnv>) => c.get('logger') || logger

const logError = (
  c: Context<AppEnv>,
  error: {
    code: ErrorCode
    status: ContentfulStatusCode
    errorMessage?: string
    err?: Error
  },
) => {
  const requestLogger = getRequestLogger(c)
  const data = {
    errorCode: error.code,
    status: error.status,
    ...(error.errorMessage ? { errorMessage: error.errorMessage } : {}),
    ...(error.err ? { err: error.err } : {}),
  }

  if (error.status >= 500) {
    requestLogger.error(data, 'request failed')
    return
  }

  requestLogger.warn(data, 'request failed')
}

export const handleError = (err: Error, c: Context<AppEnv>) => {
  if (err instanceof AppError) {
    logError(c, {
      code: err.code,
      status: err.status,
      errorMessage: err.message,
    })

    return errorResponse(c, err)
  }

  logError(c, {
    code: errorCode.internalServerError,
    status: 500,
    err,
  })

  return errorResponse(c, {
    code: errorCode.internalServerError,
    message: 'Internal server error',
    status: 500,
  })
}

export const handleNotFound = (c: Context<AppEnv>) =>
  errorResponse(c, {
    code: errorCode.notFound,
    message: 'Not found',
    status: 404,
  })
