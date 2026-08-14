import type { AppEnv } from '#src/lib/logger/request-context.js'
import { Hono } from 'hono'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const loggerMock = vi.hoisted(() => {
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

  app.use('*', requestLogger)
  app.get('/ok', c => c.json({ status: 'ok' }))
  app.get('/bad', c => c.json({ status: 'bad' }, 400))
  app.get('/error', c => c.json({ status: 'error' }, 500))

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
        'x-forwarded-for': '192.0.2.10, 198.51.100.20',
        'user-agent': 'vitest',
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String))
    expect(loggerMock.logger.child).toHaveBeenCalledWith({
      requestId: response.headers.get('x-request-id'),
    })
    expect(loggerMock.childLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        path: '/ok',
        status: 200,
        userAgent: 'vitest',
        ip: '192.0.2.10',
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
})
