import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { type ErrorCode, errorCode } from './error-code.js'

export type ErrorDetail = {
  path: string
  message: string
}

const errorStatusByCode = {
  [errorCode.badRequest]: 400,
  [errorCode.validationError]: 400,
  [errorCode.notFound]: 404,
  [errorCode.conflict]: 409,
  [errorCode.internalServerError]: 500,
} as const satisfies Record<ErrorCode, ContentfulStatusCode>

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: ContentfulStatusCode
  readonly details?: ErrorDetail[]

  constructor(
    code: ErrorCode,
    message: string,
    options: {
      status?: ContentfulStatusCode
      details?: ErrorDetail[]
    } = {},
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = options.status ?? errorStatusByCode[code]
    this.details = options.details
  }
}
