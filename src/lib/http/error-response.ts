import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { AppError, type ErrorDetail } from './app-error.js'
import { type ErrorCode, errorCode } from './error-code.js'

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
  c: Context,
  error: {
    code: ErrorCode
    message: string
    status: ContentfulStatusCode
    details?: ErrorDetail[]
  },
) => c.json(createErrorResponseBody(error.code, error.message, error.details), error.status)

export const handleError = (err: Error, c: Context) => {
  if (err instanceof AppError) {
    return errorResponse(c, err)
  }

  console.error(err)

  return errorResponse(c, {
    code: errorCode.internalServerError,
    message: 'Internal server error',
    status: 500,
  })
}

export const handleNotFound = (c: Context) =>
  errorResponse(c, {
    code: errorCode.notFound,
    message: 'Not found',
    status: 404,
  })
