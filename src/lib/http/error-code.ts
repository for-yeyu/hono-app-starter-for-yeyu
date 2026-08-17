export const errorCode = {
  badRequest: 'bad_request',
  validationError: 'validation_error',
  unauthorized: 'unauthorized',
  notFound: 'not_found',
  conflict: 'conflict',
  internalServerError: 'internal_server_error',
} as const

export type ErrorCode = (typeof errorCode)[keyof typeof errorCode]
