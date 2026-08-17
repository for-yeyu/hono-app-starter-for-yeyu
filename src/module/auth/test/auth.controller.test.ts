import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  process.env.Environment = 'development'
  process.env.ServerPort = '3000'
  process.env.CorsOrigins = 'http://localhost:3000'
  process.env.DatabaseUrl = 'postgres://user:password@localhost:5432/app'
  process.env.JwtPrivateKey = 'test-private-key'
  process.env.JwtPublicKey = 'test-public-key'
})

import { app } from '#src/app/index.js'
import { AppError } from '#src/lib/http/app-error.js'

const authServiceMock = vi.hoisted(() => ({
  login: vi.fn(),
}))

vi.mock('../auth.service.js', () => ({
  authService: authServiceMock,
}))

const user = {
  id: 'b8ae72c2-a34f-4b77-9b83-6f2071bb6f8d',
  name: 'Ada Lovelace',
}

describe('authController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs in a user', async () => {
    authServiceMock.login.mockResolvedValue({
      accessToken: 'signed-token',
      user,
    })

    const response = await app.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        password: 'correct password',
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String))
    expect(authServiceMock.login).toHaveBeenCalledWith({
      name: user.name,
      password: 'correct password',
    })
    expect(await response.json()).toEqual({
      data: {
        accessToken: 'signed-token',
        user,
      },
    })
  })

  it('returns 401 for invalid login credentials', async () => {
    authServiceMock.login.mockRejectedValue(new AppError('unauthorized', 'Invalid credentials'))

    const response = await app.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        name: user.name,
        password: 'wrong password',
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'unauthorized',
        message: 'Invalid credentials',
      },
    })
  })

  it('rejects an invalid login body', async () => {
    const response = await app.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        password: '',
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status).toBe(400)
    expect(authServiceMock.login).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Invalid request',
        details: expect.arrayContaining([
          {
            path: 'name',
            message: expect.any(String),
          },
          {
            path: 'password',
            message: expect.any(String),
          },
        ]),
      },
    })
  })
})
