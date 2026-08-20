import type { AppEnv } from '#src/lib/http/request-context.js'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../app-error.js'
import { errorCode } from '../error-code.js'
import { handleError } from '../error-response.js'

const loggerMock = vi.hoisted(() => {
  process.env.Environment = 'development'
  process.env.ServerPort = '3000'
  process.env.CorsOrigins = 'http://localhost:3000'
  process.env.DatabaseUrl = 'postgres://user:password@localhost:5432/app'
  process.env.JwtPrivateKey = 'test-private-key'
  process.env.JwtPublicKey = 'test-public-key'

  const childLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }

  return {
    logger: {
      child: vi.fn(() => childLogger),
    },
    childLogger,
  }
})

vi.mock('#src/lib/logger/index.js', () => ({
  logger: loggerMock.logger,
}))

import { requestLogger } from '../request-logger.js'

const createTestApp = () => {
  const app = new Hono<AppEnv>()

  app.onError(handleError)
  app.use('*', requestLogger)
  app.get('/ok', c => c.json({ status: 'ok' }))
  app.get('/bad', c => c.json({ status: 'bad' }, 400))
  app.get('/error', c => c.json({ status: 'error' }, 500))
  app.get('/client-error', () => {
    throw new AppError(errorCode.badRequest, 'Bad request')
  })
  app.get('/unexpected-error', () => {
    throw new Error('unexpected error')
  })

  return app
}

describe('requestLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs successful requests with request metadata', async () => {
    const app = createTestApp()

    const response = await app.request('/ok', {
      headers: {
        'x-request-id': 'test-request-id',
        'user-agent': 'vitest',
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBe('test-request-id')
    expect(loggerMock.logger.child).toHaveBeenCalledWith({
      requestId: response.headers.get('x-request-id'),
    })
    expect(loggerMock.childLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/ok',
        status: 200,
        userAgent: 'vitest',
      }),
      'request completed',
    )
  })

  it('logs client errors as warnings', async () => {
    const app = createTestApp()

    const response = await app.request('/bad')

    expect(response.status).toBe(400)
    expect(loggerMock.childLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
      }),
      'request completed',
    )
  })

  it('logs server errors as errors', async () => {
    const app = createTestApp()

    const response = await app.request('/error')

    expect(response.status).toBe(500)
    expect(loggerMock.childLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
      }),
      'request completed',
    )
  })

  it('logs thrown client errors with completion metadata', async () => {
    const app = createTestApp()

    const response = await app.request('/client-error')

    expect(response.status).toBe(400)
    expect(loggerMock.childLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/client-error',
        status: 400,
      }),
      'request completed',
    )
  })

  it('logs thrown server errors with completion metadata', async () => {
    const app = createTestApp()

    const response = await app.request('/unexpected-error')

    expect(response.status).toBe(500)
    expect(loggerMock.childLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/unexpected-error',
        status: 500,
      }),
      'request completed',
    )
  })
})
