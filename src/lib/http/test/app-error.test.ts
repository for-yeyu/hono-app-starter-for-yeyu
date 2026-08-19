import { describe, expect, it } from 'vitest'
import { AppError } from '../app-error.js'
import { errorCode } from '../error-code.js'

describe('AppError', () => {
  it('derives the status from the error code', () => {
    const error = new AppError(errorCode.unauthorized, 'Invalid token')

    expect(error.status).toBe(401)
  })

  it('preserves structured details', () => {
    const details = [{ path: 'name', message: 'Required' }]
    const error = new AppError(errorCode.validationError, 'Invalid request', { details })

    expect(error.details).toEqual(details)
  })
})
